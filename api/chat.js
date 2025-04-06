let threadId = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Only POST requests allowed");
  }

  const { message } = req.body;

  try {
    if (!threadId) {
      const threadRes = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      const threadData = await threadRes.json();
      threadId = threadData.id;
    }

    if (message) {
      await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "user",
          content: message,
        }),
      });
    }

    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: "YOUR_ASSISTANT_ID", // 👈 Replace this
      }),
    });

    const runData = await runRes.json();

    // Wait until run is completed
    let runStatus = runData.status;
    while (runStatus !== "completed") {
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );
      const statusData = await statusRes.json();
      runStatus = statusData.status;
    }

    // Get messages
    const msgRes = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const msgData = await msgRes.json();
    const lastMsg = msgData.data.find((m) => m.role === "assistant");

    res.status(200).json({
      reply: lastMsg?.content?.[0]?.text?.value || "Hmm, no reply.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong." });
  }
}
