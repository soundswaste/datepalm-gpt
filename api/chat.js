// /api/chat.js (Node.js, Vercel-compatible)
export default async function handler(req, res) {
  const { message } = req.body;

  const ASSISTANT_ID = 'asst_XXXXXXXXXXXX'; // Replace with your assistant ID
  const apiKey = process.env.OPENAI_API_KEY;

  // Create a new thread
  const threadRes = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v1",
      "Content-Type": "application/json"
    }
  });
  const thread = await threadRes.json();

  // Add user message to thread
  await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v1",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      role: "user",
      content: message
    })
  });

  // Run the assistant
  const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v1",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ assistant_id: ASSISTANT_ID })
  });

  const run = await runRes.json();

  // Poll until run completes
  let result;
  while (true) {
    const check = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v1"
      }
    });
    result = await check.json();
    if (result.status === 'completed') break;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Get messages
  const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v1"
    }
  });

  const messagesData = await messagesRes.json();
  const lastMsg = messagesData.data.find(m => m.role === "assistant");

  res.status(200).json({ reply: lastMsg.content[0].text.value });
}
