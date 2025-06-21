const axios = require('axios');

async function getSarvamResponse(prompt) {
  try {
    const response = await axios.post(
      'https://api.sarvam.ai/v1/chat/completions',
      {
        model: "sarvam-m", // Use the correct model name
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 100,
        // Optional: mode: "non-think" or "think" (if supported)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SARVAM_API_KEY}`
        }
      }
    );
    // Adjust based on Sarvam’s actual response structure
    // Example: response.data.choices[0].message.content (if similar to OpenAI)
    // If Sarvam returns differently, use the correct path
    // For now, assuming it is similar to OpenAI:
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Sarvam AI error:", error);
    return "Sorry, I couldn't process your request.";
  }
}

module.exports = { getSarvamResponse };
