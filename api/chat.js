export default async function handler(req, res) {
  const { message } = req.body;
  const ASSISTANT_ID = 'asst_XXXXXXXXXXXX';
  const apiKey = process.env.OPENAI_API_KEY;

  // Create a thread
  const threadRes = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v1",
      "Content-Type": "application/json"
    }
  });
  const thread = await threadRes.json();

  // If not init, send user message
  if (message !== "init") {
    console.log("Using API key:", apiKey ? "✅ exists" : "❌ missing");

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
  }

  // Run assistant
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

  // Poll up to 20 seconds
const maxWaitTime = 20000; // 20 seconds
const start = Date.now();
let result;

while (Date.now() - start < maxWaitTime) {
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

if (result.status !== 'completed') {
  return res.status(200).json({ reply: "Sorry, I'm taking too long to think right now. Try asking again!" });
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
