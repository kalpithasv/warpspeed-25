// bot/sarvam.js
const axios = require('axios');

async function getSarvamResponse(prompt) {
  try {
    const response = await axios.post(
      'https://api.sarvam.ai/v1/chat/completions',
      {
        prompt: prompt,
        model: "openhermes-2.5-mistral-7b", // or another supported model
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Sarvam AI error:", error);
    return "Sorry, I couldn't process your request.";
  }
}

module.exports = { getSarvamResponse };
