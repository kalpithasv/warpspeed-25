pincode = {
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

const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  // Generate and scan this code with your phone
  // console.log('QR RECEIVED', qr);
});

client.on("ready", () => {
  console.log("Client is ready!");
});
let state = "";
client.on("message", (msg) => {
  const content = msg.body;
  console.log(msg.body);
  if (content === "Hi") {
    client.sendMessage(msg.from, "Hello,How can I help you?");
  }
  if (content.includes("appointment") || content.includes("Appointment")) {
    state = "doctor";
    client.sendMessage(
      msg.from,
      "Yes, Sure I can do that please share your Pincode"
    );
  }
  if (content.includes("600")) {
    if (state === "doctor") {
      client.sendMessage(
        msg.from,
        ` Will send the appointment to nearest doctors in ${pincode[content]}`
      );
      client.sendMessage(
        msg.from,
        "You will soon receive the conformation from the doctors"
      );
    } else {
      client.sendMessage(
        msg.from,
        ` Will send the nearest ambulance in ${pincode[content]} to you shortly`
      );
      client.sendMessage(
        msg.from,
        "You will soon receive the contact details of ambulance driver"
      );
    }
  }
  if (
    content.includes("emergerncy") ||
    content.includes("Emergency") ||
    content.includes("EMERGENCY")
  ) {
    state = "emergency";
    client.sendMessage(
      msg.from,
      "Yes, Sure I will send the ambulance to your location,please share your Location"
    );
  }
});

client.initialize();

// 9962312592
