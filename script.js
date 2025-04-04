const startBtn = document.getElementById('start');
const transcriptDisplay = document.getElementById('transcript');
const responseDisplay = document.getElementById('response');

// Replace this with your OpenAI API key
const OPENAI_API_KEY = 'YOUR_API_KEY_HERE';

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;

startBtn.onclick = () => {
  recognition.start();
};

recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  transcriptDisplay.textContent = userText;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userText }]
    })
  });

  const data = await response.json();
  const assistantReply = data.choices[0].message.content;
  responseDisplay.textContent = assistantReply;
};
