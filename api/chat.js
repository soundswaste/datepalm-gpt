let threadId = null;

async function handler(req, res) {
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
          content: message,
        }),
      });

      if (!msgRes.ok) {
        console.error("Error sending message:", await msgRes.text());
        return res.status(500).json({ reply: "Error sending message" });
      }
    }

    // Step 3: Run assistant to process the message
    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        assistant_id: "asst_mz9EL6TLq5zy4OsBBJnsUhcQ", // 👈 Replace with your Assistant ID
      }),
    });

    if (!runRes.ok) {
      console.error("Error running assistant:", await runRes.text());
      return res.status(500).json({ reply: "Error running assistant" });
    }

    const runData = await runRes.json();
    
    // Wait for assistant to complete the task
    let runStatus = runData.status;
    let attempts = 0;

    while (attempts < 10 && runStatus !== "completed") {
      await new Promise((r) => setTimeout(r, 1500)); // wait 1.5 seconds
      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`,
        {
          headers: headers,
        }
      );

      if (!statusRes.ok) {
        console.error("Error fetching run status:", await statusRes.text());
        return res.status(500).json({ reply: "Error checking run status" });
      }

      const statusData = await statusRes.json();
      runStatus = statusData.status;
      attempts++;
    }

    if (runStatus !== "completed") {
      return res.status(504).json({ reply: "Assistant took too long to respond." });
    }

    // Step 4: Fetch the assistant's reply
    const msgRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: headers,
      }
    );

    if (!msgRes.ok) {
      console.error("Error fetching messages:", await msgRes.text());
      return res.status(500).json({ reply: "Error fetching assistant messages" });
    }

    const msgData = await msgRes.json();
    const lastMsg = msgData.data.find((m) => m.role === "assistant");

    return res.status(200).json({
      reply: lastMsg?.content?.[0]?.text?.value || "Hmm, no reply.",
    });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ reply: "Something went wrong." });
  }
}

// Export the handler function using CommonJS syntax
module.exports = handler;
