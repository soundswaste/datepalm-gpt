export default async function handler(req, res) {
  try {
    const userInput = req.body.message;

    // If user input is empty, return an error
    if (!userInput || userInput.trim() === "") {
      return res.status(400).json({ error: "No input provided" });
    }

    // Define your custom assistant model ID
    const customModelId = "asst_O8bibYy4d6YYRmXSjOFpTqKW";  // Replace this with your specific model ID
    console.log(customModelId);

    // Call OpenAI API using the custom assistant model
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: customModelId,  // Use your specific custom model here
        messages: [
          { role: "system", content: "You are a friendly and helpful assistant." },  // Optional system message
          { role: "user", content: userInput },  // User's message
        ],
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error('Failed to fetch response from OpenAI');
    }

    const data = await response.json();

    // Send OpenAI's response back to the client
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
}
