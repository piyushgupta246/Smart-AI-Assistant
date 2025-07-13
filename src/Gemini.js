const GEMINI_API_KEY = "Your API"; // Replace with your key

export async function generateResponse(prompt, imageBase64 = null, mimeType = null) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

  const headers = {
    "Content-Type": "application/json"
  };

  const contents = [
    {
      parts: [
        { text: prompt }
      ]
    }
  ];

  // If image is present, add image part
  if (imageBase64 && mimeType) {
    contents[0].parts.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64
      }
    });
  }

  const body = JSON.stringify({ contents });

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body
    });

    const data = await res.json();

    // Extract the response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    return responseText;

  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Error calling Gemini API.";
  }
}
