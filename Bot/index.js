// Pincode to area mapping
const pincode = {
  600001: "Chennai GPO",
  600002: "Anna Road GPO",
  600003: "Park Town",
  600004: "Mylapore",
  600005: "Triplicane",
  600006: "Greams Road",
  600007: "Vepery",
  600008: "Egmore",
  600009: "Fort St George",
  600010: "Kilpauk",
  600011: "Perambur",
  600012: "Perambur Barracks",
  600013: "Royapuram",
  600014: "Royapettah",
  600015: "Saidapet",
  600016: "St.Thomas Mount",
  600017: "T.Nagar",
  600018: "Teynampet",
  600019: "Tiruvottiyur",
  600020: "Adyar",
};

console.log("Pincode mapping loaded.");

// QR code terminal generator
const qrcode = require("qrcode-terminal");
console.log("QR code terminal module loaded.");

// WhatsApp client setup
const { Client, LocalAuth } = require("whatsapp-web.js");
console.log("WhatsApp client module loaded.");

// Sarvam AI integration
let getSarvamResponse;
try {
  getSarvamResponse = require('./sarvam').getSarvamResponse;
  console.log("Sarvam AI module loaded.");
} catch (err) {
  console.error("Sarvam AI module not found or error loading:", err);
  getSarvamResponse = async (text) => "Sarvam AI is not available right now.";
}

// Initialize WhatsApp client
console.log("Initializing WhatsApp client...");
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

// QR code generation
client.on("qr", (qr) => {
  console.log("QR code event triggered.");
  qrcode.generate(qr, { small: true });
});


// Client ready
client.on("ready", () => {
  console.log("Client is ready!");
});

// Error handlers
client.on("auth_failure", (msg) => {
  console.error("Authentication failed:", msg);
});

client.on("disconnected", (reason) => {
  console.error("Client was logged out:", reason);
});

// State for conversation flow
let state = "";
console.log("State variable initialized.");

// Handle incoming messages
client.on("message", async (msg) => {
  console.log("New message received from:", msg.from);
  console.log("Message content:", msg.body);

  const content = msg.body;
  console.log("Processing message:", content);

  // Greeting
  if (content === "Hi") {
    console.log("Handling 'Hi' message.");
    await client.sendMessage(msg.from, "Hello! Welcome to our e-commerce store. How can I help you today?");
    return;
  }

  // Order flow
  if (content.toLowerCase().includes("order") || content.toLowerCase().includes("buy")) {
    console.log("Handling 'order' or 'buy' message.");
    state = "order";
    await client.sendMessage(msg.from, "Great! Please share your pincode so I can check delivery options.");
    return;
  }

  // Track flow
  if (content.toLowerCase().includes("track") || content.toLowerCase().includes("status")) {
    console.log("Handling 'track' or 'status' message.");
    state = "track";
    await client.sendMessage(msg.from, "Please share your pincode to track your order.");
    return;
  }

  // Support flow
  if (content.toLowerCase().includes("support") || content.toLowerCase().includes("help")) {
    console.log("Handling 'support' or 'help' message.");
    await client.sendMessage(msg.from, "Our support team will contact you shortly to assist you.");
    return;
  }

  // Pincode lookup
  if (pincode[content.trim()]) {
    console.log("Handling pincode message.");
    if (state === "order") {
      await client.sendMessage(msg.from, `Thanks! We deliver to ${pincode[content.trim()]}. What product would you like to order?`);
      state = "product";
    } else if (state === "track") {
      await client.sendMessage(msg.from, `Your order to ${pincode[content.trim()]} is being tracked. I'll update you soon.`);
      state = "";
    } else {
      await client.sendMessage(msg.from, `We deliver to ${pincode[content.trim()]}. How can I help you?`);
    }
    return;
  }

  // Sarvam AI for all other messages
  if (
    !content.toLowerCase().includes("order") &&
    !content.toLowerCase().includes("buy") &&
    !content.toLowerCase().includes("track") &&
    !content.toLowerCase().includes("status") &&
    !content.toLowerCase().includes("support") &&
    !content.toLowerCase().includes("help") &&
    !pincode[content.trim()] &&
    content !== "Hi"
  ) {
    console.log("Handling other messages with Sarvam AI.");
    try {
      const sarvamResponse = await getSarvamResponse(content);
      await client.sendMessage(msg.from, sarvamResponse);
    } catch (err) {
      console.error("Error getting Sarvam response:", err);
      await client.sendMessage(msg.from, "Sorry, I encountered an error. Please try again.");
    }
  }
});

console.log("Starting client initialization...");
client.initialize();
console.log("Client initialization called. Waiting for events...");
