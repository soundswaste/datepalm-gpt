const startBtn = document.getElementById('start');
const transcriptDisplay = document.getElementById('transcript');
const responseDisplay = document.getElementById('response');

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;

startBtn.onclick = () => {
  recognition.start();
};

recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  transcriptDisplay.textContent = userText;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText })
  });

  const data = await res.json();
  responseDisplay.textContent = data.reply;
};
