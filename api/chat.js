let threadId = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Only POST requests allowed");
  }

  const { message } = req.body;

  try {
    const headers = {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",  // <-- Add this header
    };

    // Step 1: Create thread if it doesn't exist
    if (!threadId) {
      const threadRes = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: headers,
      });

      if (!threadRes.ok) {
        console.error("Error creating thread:", await threadRes.text());
        return res.status(500).json({ reply: "Error creating thread" });
      }

      const threadData = await threadRes.json();
      threadId = threadData.id;
    }

    // Step 2: Send user's message to OpenAI if message exists
    if (message) {
      const msgRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          role: "user",
          content: message
