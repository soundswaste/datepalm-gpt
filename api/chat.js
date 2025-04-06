// /api/chat.js

let threadId = null; // In-memory (resets on each deployment)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Only POST requests allowed");
  }

  const { message } = req.body;

  try {
    // Step 1: Create a thread if it doesn't exist
    if (!threadId) {
      const threadRes = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
      });

      const threadData = await threadRes.json();
      threadId = threadData.id;
    }

    // Step 2: Add user message to thread
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user",
        content: message
      })
    });

    // Step 3: Run the assistant on this thread
    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assistant_id: "asst_O8bibYy4d6YYRmXSjOFpTqKW"
      })
    });

    const runData = await runRes.json();

    // Step 4: Poll the run status until it's complete
    let runStatus = runData.status;
    let finalRun;
    while (runStatus !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
      const checkRun = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`, {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
      finalRun = await checkRun.json();
      runStatus = finalRun.status;

      if (runStatus === "failed" || runStatus === "cancelled") {
        throw new Error("Run failed");
      }
    }

    // Step 5: Get the messages
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const msgData = await msgRes.json();
    const lastMessage = msgData.data.find(m => m.role === "assistant");

    res.status(200).json({
      reply: lastMessage?.content?.[0]?.text?.value || "Hmm, something went wrong."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong. Please try again." });
  }
}
