export default async function handler(req, res) {
  try {
    // Ensure the API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing' });
    }

    // Retrieve the user's message (from the request body)
    const userMessage = req.body.message;

    // Ensure the user message exists
    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Create the conversation thread if not present
    let thread = req.body.thread || [];

    // Add the user's message to the conversation thread
    thread.push({ role: "user", content: userMessage });

    // Make the API call to OpenAI with the conversation thread
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Or use the model you're working with
        messages: thread
      })
    });

    // Handle OpenAI response errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from OpenAI:", errorData);
      return res.status(500).json({ error: 'Error from OpenAI API', details: errorData });
    }

    // Parse OpenAI's response
    const data = await response.json();
    const assistantReply = data.choices[0].message.content;

    // Add the assistant's reply to the thread
    thread.push({ role: "assistant", content: assistantReply });

    // Respond back to the client with the assistant's reply and the updated thread
    return res.status(200).json({ reply: assistantReply, thread: thread });

  } catch (error) {
    // Catch and log any unexpected errors
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
