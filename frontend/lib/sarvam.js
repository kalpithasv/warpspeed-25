// frontend/lib/sarvam.js
export async function getSarvamResponse(prompt) {
  try {
    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SARVAM_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        model: "openhermes-2.5-mistral-7b", // or another supported model
        max_tokens: 100
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Sarvam AI error:", error);
    return "Sorry, I couldn't process your request.";
  }
}
