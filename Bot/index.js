require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { 
  db, 
  auth,
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  onSnapshot, 
  query, 
  where,
  setDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} = require('./firebase');
const { getSarvamResponse } = require('./sarvam');

// State for conversation flow - now includes persistent login
const userState = {};

const client = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    type: "remote",
    remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

client.on("qr", (qr) => {
  console.log("QR code event triggered. Scan this QR code with WhatsApp on your phone:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

// Utility functions
async function saveImageFromWhatsApp(media, sellerId, productName) {
  try {
    const timestamp = Date.now();
    const fileName = `${sellerId}_${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${media.mimetype.split('/')[1]}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Save the image data to file
    const buffer = Buffer.from(media.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    // Return the file path (in production, you'd upload to cloud storage and return URL)
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
}

async function registerSeller(sellerData) {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, sellerData.email, sellerData.password);
    const user = userCredential.user;
    
    // Store additional seller data in Firestore (without password)
    const sellerDoc = {
      uid: user.uid,
      email: sellerData.email,
      businessName: sellerData.businessName,
      ownerName: sellerData.ownerName,
      phone: sellerData.phone,
      address: sellerData.address,
      category: sellerData.category,
      description: sellerData.description || '',
      status: "pending",
      role:"seller",
      createdAt: new Date(),
      whatsappId: sellerData.whatsappId
    };
    
    await setDoc(doc(db, "users", user.uid), sellerDoc);
    console.log("Seller registered successfully");
    
    return { success: true, user, seller: sellerDoc };
  } catch (err) {
    console.error("Error registering seller:", err);
    return { success: false, message: err.message };
  }
}

async function authenticateSeller(email, password) {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get seller data from Firestore
    const sellerDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
    
    if (sellerDoc.empty) {
      return { success: false, message: "Seller profile not found" };
    }
    
    let sellerData = null;
    sellerDoc.forEach(doc => {
      sellerData = { id: doc.id, ...doc.data() };
    });
    
    return { success: true, user, seller: sellerData };
  } catch (err) {
    console.error("Error authenticating seller:", err);
    let errorMessage = "Authentication failed";
    
    if (err.code === 'auth/user-not-found') {
      errorMessage = "No account found with this email";
    } else if (err.code === 'auth/wrong-password') {
      errorMessage = "Incorrect password";
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address";
    }
    
    return { success: false, message: errorMessage };
  }
}

function getPhoneFromWhatsApp(from) {
  // Extract phone number from WhatsApp ID (remove @c.us suffix)
  return from.replace('@c.us', '');
}

function showWelcomeMessage(isLoggedIn = false, sellerName = null) {
  if (isLoggedIn && sellerName) {
    return `Hello ${sellerName}! Welcome back to your seller dashboard! 👋

What would you like to do?

1️⃣ *Add Products* - Add new products to your store
2️⃣ *View My Products* - See all your products
3️⃣ *Update Profile* - Update your business info
4️⃣ *Logout* - Sign out of your account

Please reply with the number (1, 2, 3, or 4) or the option name.`;
  } else {
    return `Hello! Welcome to our e-commerce platform! 👋

How can I help you today?

1️⃣ *Become a Seller* - Register your business
2️⃣ *Login to Seller Profile* - Access your seller account
3️⃣ *Browse Products* - Shop as a customer
4️⃣ *Get Support* - Contact our support team

Please reply with the number (1, 2, 3, or 4) or the option name.`;
  }
}

// --- MAIN MESSAGE HANDLER ---
client.on("message", async (msg) => {
  const content = msg.body.trim();
  const from = msg.from;

  console.log("New message received from:", from);
  console.log("Message content:", content);

  // Initialize user state if not exists
  if (!userState[from]) {
    userState[from] = { 
      flow: null, 
      step: null, 
      data: {},
      isLoggedIn: false,
      seller: null 
    };
  }

  const currentState = userState[from];

  // --- GLOBAL "HI" COMMAND - Works from anywhere ---
  if (/^(hi|hello|hey|start)$/i.test(content)) {
    // Reset flow but keep login state
    currentState.flow = null;
    currentState.step = null;
    currentState.data = { ...currentState.data }; // Keep existing data like seller info
    
    const welcomeMessage = showWelcomeMessage(
      currentState.isLoggedIn, 
      currentState.seller?.ownerName
    );

    try {
      await client.sendMessage(from, welcomeMessage);
      
      // If logged in, set flow to dashboard
      if (currentState.isLoggedIn) {
        currentState.flow = "seller_dashboard";
      }
      
      console.log("Welcome message sent successfully!");
    } catch (err) {
      console.error("Error sending welcome message:", err);
    }
    return;
  }

  // --- OPTION SELECTION (for non-logged-in users) ---
  if (!currentState.flow && !currentState.isLoggedIn) {
    if (/^(1|become a seller|become seller)$/i.test(content)) {
      currentState.flow = "seller_registration";
      currentState.step = "email";
      try {
        await client.sendMessage(from, "Great! Let's register your business. 📝\n\nFirst, what's your email address?");
      } catch (err) {
        console.error("Error sending seller registration start:", err);
      }
      return;
    }
    
    if (/^(2|login to seller profile|login|seller login)$/i.test(content)) {
      currentState.flow = "seller_login";
      currentState.step = "email";
      try {
        await client.sendMessage(from, "Please enter your registered email address:");
      } catch (err) {
        console.error("Error sending login prompt:", err);
      }
      return;
    }
    
    // --- BUYER FLOW: BROWSE PRODUCTS WITH SARVAM AI ---
    if (/^(3|browse products|browse|shop)$/i.test(content)) {
      currentState.flow = "buyer_browse";
      currentState.step = "ai_intro";
      try {
        await client.sendMessage(from, "🛍️ Welcome to our AI-powered product explorer!\n\nYou can:\n- Ask for products by category, price, or features\n- Type your needs (e.g., 'Show me shoes under 1000', 'I want a red dress', etc.)\n\nHow can I help you shop today?");
      } catch (err) {
        console.error("Error sending browse message:", err);
      }
      return;
    }
    
    if (/^(4|get support|support|help)$/i.test(content)) {
      try {
        await client.sendMessage(from, "🎧 Our support team will contact you shortly to assist you. Thank you for your patience!");
      } catch (err) {
        console.error("Error sending support message:", err);
      }
      return;
    }
  }

  // --- BUYER BROWSE FLOW WITH SARVAM AI ---
  // ...existing code above...

// --- BUYER BROWSE FLOW WITH SARVAM AI ---
if (currentState.flow === "buyer_browse") {
  // Step 1: On first message, fetch all products
  if (currentState.step === "ai_intro") {
    // Save the user's query for Sarvam
    currentState.data.buyerQuery = content;
    currentState.step = "ai_search";
    // Fetch all products from Firestore
    try {
      const productsSnapshot = await getDocs(collection(db, "products"));
      const products = [];
      productsSnapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      if (products.length === 0) {
        await client.sendMessage(from, "Sorry, there are no products available right now.");
        currentState.flow = null;
        currentState.step = null;
        return;
      }
      // Prepare a prompt for Sarvam AI
      const productListForAI = products.map((p, idx) => 
        `${idx + 1}. ${p.name} - ₹${p.price}${p.description ? ` (${p.description})` : ''}`
      ).join('\n');
      const sarvamPrompt = `
A buyer on WhatsApp wants to shop. Here are the products in the store:
${productListForAI}

The buyer said: "${currentState.data.buyerQuery}"

Your job:
- ONLY show products that match what the buyer asked for (by name, type, or description).
- If there is a clear match (e.g., buyer asks for "curd rice" and it's available), reply: "Yes, we have curd rice available!" and show only that product.
- If there are multiple relevant products, show a short list (max 5) with product names and prices.
- If nothing matches, politely say so and suggest the closest alternatives.
- Do NOT list unrelated products.
- End by asking if the buyer wants to buy or know more about any product.

Reply in a friendly, concise way.
`;
      // Get Sarvam AI's response
      const sarvamReply = await getSarvamResponse(sarvamPrompt);
      // Save products in state for later reference
      currentState.data.products = products;
      await client.sendMessage(from, sarvamReply);
      await client.sendMessage(from, "Reply with the product number or name to buy or know more!");
    } catch (err) {
      console.error("Error in buyer browse flow:", err);
      await client.sendMessage(from, "❌ Error fetching products. Please try again later.");
      currentState.flow = null;
      currentState.step = null;
    }
    return;
  }

  // Step 2: Handle buyer's selection or follow-up query
  if (currentState.step === "ai_search") {
    const products = currentState.data.products || [];
    let selectedProduct = null;

    // Try to match by number
    const num = parseInt(content);
    if (!isNaN(num) && num > 0 && num <= products.length) {
      selectedProduct = products[num - 1];
    } else {
      // Try to match by name (case-insensitive, partial match)
      selectedProduct = products.find(p => p.name.toLowerCase() === content.toLowerCase());
      if (!selectedProduct) {
        // Try partial match
        selectedProduct = products.find(p => p.name.toLowerCase().includes(content.toLowerCase()));
      }
    }

    if (selectedProduct) {
      // Show product details and ask if they want to buy
      let productMsg = `*${selectedProduct.name}*\nPrice: ₹${selectedProduct.price}\n`;
      if (selectedProduct.description) productMsg += `Description: ${selectedProduct.description}\n`;
      if (selectedProduct.stock !== undefined) productMsg += `Stock: ${selectedProduct.stock} units\n`;
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        // Send first image if available
        try {
          const imagePath = path.join(__dirname, selectedProduct.images[0]);
          if (fs.existsSync(imagePath)) {
            const media = MessageMedia.fromFilePath(imagePath);
            await client.sendMessage(from, media, { caption: productMsg + "\nWould you like to buy this product? (yes/no)" });
          } else {
            await client.sendMessage(from, productMsg + "\nWould you like to buy this product? (yes/no)");
          }
        } catch (err) {
          await client.sendMessage(from, productMsg + "\nWould you like to buy this product? (yes/no)");
        }
      } else {
        await client.sendMessage(from, productMsg + "\nWould you like to buy this product? (yes/no)");
      }
      currentState.step = "ai_buy_confirm";
      currentState.data.selectedProduct = selectedProduct;
      return;
    } else {
      // If not matched, treat as a new query and ask Sarvam again
      currentState.data.buyerQuery = content;
      currentState.step = "ai_intro";
      // Loop back to AI search
      client.emit("message", msg); // Re-process as new query
      return;
    }
  }

  // Step 3: Confirm purchase intent
  if (currentState.step === "ai_buy_confirm") {
    if (/^(yes|y|buy|purchase)$/i.test(content)) {
      // Ask for buyer's name and phone (if not already known)
      currentState.step = "ai_buyer_details";
      await client.sendMessage(from, "Great! Please share your name for the order:");
      return;
    } else if (/^(no|n|back|cancel)$/i.test(content)) {
      await client.sendMessage(from, "No problem! You can ask for another product or type 'hi' to return to main menu.");
      currentState.flow = null;
      currentState.step = null;
      currentState.data = {};
      return;
    } else {
      await client.sendMessage(from, "Please reply 'yes' to buy or 'no' to cancel.");
      return;
    }
  }

  // Step 4: Collect buyer details and notify seller
  if (currentState.step === "ai_buyer_details") {
    currentState.data.buyerName = content;
    // Optionally, you can ask for address or other info here
    // Notify seller (find seller's WhatsApp ID from product)
    try {
      const selectedProduct = currentState.data.selectedProduct;
      // Find seller in users collection
      const sellerSnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", selectedProduct.sellerId)));
      let sellerWhatsappId = null;
      sellerSnapshot.forEach(doc => {
        sellerWhatsappId = doc.data().whatsappId;
      });
      if (sellerWhatsappId) {
        await client.sendMessage(sellerWhatsappId, `🛒 *New Order Request!*\n\nProduct: ${selectedProduct.name}\nBuyer: ${currentState.data.buyerName}\nWhatsApp: ${from}\n\nPlease follow up with the buyer to complete the sale.`);
      }
      await client.sendMessage(from, "🎉 Your interest has been sent to the seller! They will contact you soon to complete your order.\n\nType 'hi' to return to main menu or ask for more products.");
    } catch (err) {
      await client.sendMessage(from, "❌ Error sending your order to the seller. Please try again later.");
    }
    currentState.flow = null;
    currentState.step = null;
    currentState.data = {};
    return;
  }
}
// ...rest of your code...

  // --- SELLER REGISTRATION FLOW ---
  if (currentState.flow === "seller_registration") {
    if (currentState.step === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(content)) {
        try {
          await client.sendMessage(from, "Please enter a valid email address:");
        } catch (err) {
          console.error("Error sending email validation:", err);
        }
        return;
      }
      
      currentState.data.email = content;
      currentState.step = "password";
      try {
        await client.sendMessage(from, "Please create a password for your account (minimum 6 characters):");
      } catch (err) {
        console.error("Error sending password prompt:", err);
      }
      return;
    }
    
    if (currentState.step === "password") {
      if (content.length < 6) {
        try {
          await client.sendMessage(from, "Password must be at least 6 characters long. Please try again:");
        } catch (err) {
          console.error("Error sending password validation:", err);
        }
        return;
      }
      
      currentState.data.password = content;
      currentState.step = "businessName";
      try {
        await client.sendMessage(from, "What's your business name?");
      } catch (err) {
        console.error("Error sending business name prompt:", err);
      }
      return;
    }
    
    if (currentState.step === "businessName") {
      currentState.data.businessName = content;
      currentState.step = "ownerName";
      try {
        await client.sendMessage(from, "What's the owner's name?");
      } catch (err) {
        console.error("Error sending owner name prompt:", err);
      }
      return;
    }
    
    if (currentState.step === "ownerName") {
      currentState.data.ownerName = content;
      currentState.step = "address";
      try {
        await client.sendMessage(from, "What's your business address?");
      } catch (err) {
        console.error("Error sending address prompt:", err);
      }
      return;
    }
    
    if (currentState.step === "address") {
      currentState.data.address = content;
      currentState.step = "category";
      try {
        await client.sendMessage(from, "What's your business category? (e.g., Fashion, Electronics, Food, etc.)");
      } catch (err) {
        console.error("Error sending category prompt:", err);
      }
      return;
    }
    
    if (currentState.step === "category") {
      currentState.data.category = content;
      currentState.step = "description";
      try {
        await client.sendMessage(from, "Please provide a brief description of your business (optional - you can type 'skip'):");
      } catch (err) {
        console.error("Error sending description prompt:", err);
      }
      return;
    }
    
    if (currentState.step === "description") {
      const description = content.toLowerCase() === 'skip' ? '' : content;
      
      const sellerData = {
        email: currentState.data.email,
        password: currentState.data.password,
        businessName: currentState.data.businessName,
        ownerName: currentState.data.ownerName,
        phone: getPhoneFromWhatsApp(from),
        address: currentState.data.address,
        category: currentState.data.category,
        description: description,
        whatsappId: from
      };
      
      try {
        const result = await registerSeller(sellerData);
        
        if (result.success) {
          // Auto-login after successful registration
          currentState.isLoggedIn = true;
          currentState.seller = result.seller;
          currentState.flow = "seller_dashboard";
          currentState.step = null;
          currentState.data = { seller: result.seller, user: result.user };
          
          await client.sendMessage(from, `✅ Registration successful! 

Your seller account has been created with:
📧 Email: ${sellerData.email}
🏢 Business: ${sellerData.businessName}
👤 Owner: ${sellerData.ownerName}
📱 Phone: ${sellerData.phone}

Your account is pending approval. You'll be notified once approved.

You are now logged in! What would you like to do?

1️⃣ Add Products
2️⃣ View My Products  
3️⃣ Update Profile
4️⃣ Logout

Please reply with the number or option name.`);
        } else {
          await client.sendMessage(from, `❌ Registration failed: ${result.message}\n\nPlease try again or type 'hi' to return to main menu.`);
          // Reset registration flow
          currentState.flow = null;
          currentState.step = null;
          currentState.data = {};
        }
        
      } catch (err) {
        console.error("Error saving seller:", err);
        await client.sendMessage(from, "❌ Sorry, there was an error saving your information. Please try again later.");
      }
      return;
    }
  }

  // --- SELLER LOGIN FLOW ---
  if (currentState.flow === "seller_login") {
    if (currentState.step === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(content)) {
        try {
          await client.sendMessage(from, "Please enter a valid email address:");
        } catch (err) {
          console.error("Error sending email validation:", err);
        }
        return;
      }
      
      currentState.data.email = content;
      currentState.step = "password";
      try {
        await client.sendMessage(from, "Please enter your password:");
      } catch (err) {
        console.error("Error sending password prompt:", err);
      }
      return;
    }
    
    if (currentState.step === "password") {
      const authResult = await authenticateSeller(currentState.data.email, content);
      
      if (authResult.success) {
        const seller = authResult.seller;
        
        // Set persistent login state
        currentState.isLoggedIn = true;
        currentState.seller = seller;
        currentState.data.seller = seller;
        currentState.data.user = authResult.user;
        currentState.flow = "seller_dashboard";
        currentState.step = null;
        
        try {
          await client.sendMessage(from, `✅ Login successful! 

Welcome back, ${seller.ownerName}!
🏢 Business: ${seller.businessName}
📧 Email: ${seller.email}
📱 Phone: ${seller.phone}
📊 Status: ${seller.status}

What would you like to do?
1️⃣ Add Products
2️⃣ View My Products  
3️⃣ Update Profile
4️⃣ Logout

Please reply with the number or option name.`);
        } catch (err) {
          console.error("Error sending login success:", err);
        }
      } else {
        try {
          await client.sendMessage(from, `❌ ${authResult.message}\n\nPlease try again or type 'hi' to return to main menu.`);
          currentState.step = "email";
          currentState.data = {};
        } catch (err) {
          console.error("Error sending login failure:", err);
        }
      }
      return;
    }
  }

  // --- SELLER DASHBOARD (for logged-in users) ---
  if (currentState.flow === "seller_dashboard" && currentState.isLoggedIn) {
    if (/^(1|add products)$/i.test(content)) {
      try {
        await client.sendMessage(from, "📦 *Add a Product - Step by Step*\n\nLet's add your product step by step:\n\n1️⃣ First, what's the product name?");
        currentState.step = "product_name";
        currentState.data.currentProduct = {};
      } catch (err) {
        console.error("Error sending add products instruction:", err);
      }
      return;
    }
    
    if (/^(2|view my products)$/i.test(content)) {
      try {
        const q = query(collection(db, "products"), where("sellerId", "==", currentState.seller.uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          await client.sendMessage(from, "📦 You haven't added any products yet.\n\nType '1' to add products or 'hi' for main menu.");
        } else {
          let productsList = "🛍️ *Your Products:*\n\n";
          querySnapshot.forEach(doc => {
            const product = doc.data();
            productsList += `• ${product.name} - ₹${product.price}`;
            if (product.description) {
              productsList += ` (${product.description})`;
            }
            productsList += `\n  Stock: ${product.stock} units\n  Images: ${product.images.length} uploaded\n\n`;
          });
          productsList += "Type 'hi' to return to main menu.";
          await client.sendMessage(from, productsList);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        await client.sendMessage(from, "❌ Error fetching products. Please try again.");
      }
      return;
    }
    
    if (/^(3|update profile)$/i.test(content)) {
      try {
        await client.sendMessage(from, "🔧 Profile update feature coming soon!\n\nType 'hi' to return to main menu.");
      } catch (err) {
        console.error("Error sending update profile:", err);
      }
      return;
    }
    
    if (/^(4|logout)$/i.test(content)) {
      try {
        await signOut(auth);
        
        // Clear login state
        currentState.isLoggedIn = false;
        currentState.seller = null;
        currentState.flow = null;
        currentState.step = null;
        currentState.data = {};
        
        await client.sendMessage(from, "👋 You have been logged out successfully!\n\nType 'hi' to return to main menu.");
      } catch (err) {
        console.error("Error logging out:", err);
        await client.sendMessage(from, "Error logging out, but session cleared locally.");
      }
      return;
    }
    
    // --- STEP-BY-STEP PRODUCT ADDITION ---
    if (currentState.step === "product_name") {
      currentState.data.currentProduct.name = content;
      currentState.step = "product_price";
      try {
        await client.sendMessage(from, "2️⃣ What's the price of this product? (Enter numbers only, e.g., 500)");
      } catch (err) {
        console.error("Error asking for price:", err);
      }
      return;
    }
    
    if (currentState.step === "product_price") {
      const price = parseInt(content);
      if (isNaN(price) || price <= 0) {
        try {
          await client.sendMessage(from, "❌ Please enter a valid price (numbers only). For example: 500");
        } catch (err) {
          console.error("Error sending price validation:", err);
        }
        return;
      }
      
      currentState.data.currentProduct.price = price;
      currentState.step = "product_description";
      try {
        await client.sendMessage(from, "3️⃣ Add a description for your product (or type 'skip' to skip):");
      } catch (err) {
        console.error("Error asking for description:", err);
      }
      return;
    }
    
    if (currentState.step === "product_description") {
      const description = content.toLowerCase() === 'skip' ? '' : content;
      currentState.data.currentProduct.description = description;
      currentState.step = "product_stock";
      try {
        await client.sendMessage(from, "4️⃣ How many units do you have in stock? (Enter numbers only, e.g., 10)");
      } catch (err) {
        console.error("Error asking for stock:", err);
      }
      return;
    }
    
    if (currentState.step === "product_stock") {
      const stock = parseInt(content);
      if (isNaN(stock) || stock < 0) {
        try {
          await client.sendMessage(from, "❌ Please enter a valid stock quantity (numbers only). For example: 10");
        } catch (err) {
          console.error("Error sending stock validation:", err);
        }
        return;
      }
      
      currentState.data.currentProduct.stock = stock;
      currentState.step = "product_images";
      currentState.data.currentProduct.images = [];
      try {
        await client.sendMessage(from, "5️⃣ Now send me product images! 📸\n\nYou can:\n• Send multiple images one by one\n• Type 'done' when finished\n• Type 'skip' to add product without images\n\nSend your first image:");
      } catch (err) {
        console.error("Error asking for images:", err);
      }
      return;
    }
    
    if (currentState.step === "product_images") {
      // Check if user wants to finish or skip
      if (content.toLowerCase() === 'done' || content.toLowerCase() === 'skip') {
        // Save the product
        try {
          const productData = {
            sellerId: currentState.seller.uid,
            name: currentState.data.currentProduct.name,
            description: currentState.data.currentProduct.description,
            price: currentState.data.currentProduct.price,
            images: currentState.data.currentProduct.images || [],
            category: currentState.seller.category,
            stock: currentState.data.currentProduct.stock,
            createdAt: new Date()
          };
          
          await addDoc(collection(db, "products"), productData);
          
          const confirmationMessage = `✅ Product added successfully!\n\n📦 *${productData.name}*\n💰 Price: ₹${productData.price}\n📝 Description: ${productData.description || 'None'}\n📦 Stock: ${productData.stock} units\n🖼️ Images: ${productData.images.length} uploaded\n\nWhat would you like to do next?\n\n1️⃣ Add Another Product\n2️⃣ View My Products\n3️⃣ Back to Dashboard (type 'hi')`;
          
          await client.sendMessage(from, confirmationMessage);
          
          // Reset to dashboard
          currentState.step = null;
          currentState.data.currentProduct = {};
          
        } catch (err) {
          console.error("Error saving product:", err);
          await client.sendMessage(from, "❌ Error saving product. Please try again.");
        }
        return;
      }
      
      // Check if message has media (image)
      if (msg.hasMedia) {
        try {
          const media = await msg.downloadMedia();
          
          if (media.mimetype.startsWith('image/')) {
            // Save image
            const imagePath = await saveImageFromWhatsApp(media, currentState.seller.uid, currentState.data.currentProduct.name);
            
            if (imagePath) {
              currentState.data.currentProduct.images.push(imagePath);
              await client.sendMessage(from, `✅ Image ${currentState.data.currentProduct.images.length} uploaded successfully!\n\nSend more images or type 'done' to finish.`);
            } else {
              await client.sendMessage(from, "❌ Failed to save image. Please try again or type 'done' to continue.");
            }
          } else {
            await client.sendMessage(from, "❌ Please send only image files (JPG, PNG, etc.)");
          }
        } catch (err) {
          console.error("Error processing image:", err);
          await client.sendMessage(from, "❌ Error processing image. Please try again or type 'done' to continue.");
        }
        return;
      }
      
      // If no media and not done/skip command
      try {
        await client.sendMessage(from, "📸 Please send an image, or type 'done' to finish or 'skip' to add product without images.");
      } catch (err) {
        console.error("Error sending image prompt:", err);
      }
      return;
    }
  }

  // --- DEFAULT RESPONSE ---
  try {
    if (currentState.isLoggedIn) {
      await client.sendMessage(from, "I didn't understand that. Type 'hi' to see your seller dashboard options.");
    } else {
      await client.sendMessage(from, "I didn't understand that. Type 'hi' to see available options.");
    }
  } catch (err) {
    console.error("Error sending default response:", err);
  }
});

// Start the client
console.log("Starting client initialization...");
client.initialize();
console.log("Client initialization called. Waiting for events...");