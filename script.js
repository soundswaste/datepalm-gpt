const startBtn = document.getElementById('start');
const chat = document.getElementById('chat');

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;

startBtn.onclick = () => {
  recognition.start();
  startBtn.textContent = "🎧 Listening...";
};

recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  addMessage(userText, 'user');
  startBtn.textContent = "💬 Thinking...";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText })
  });

  const data = await res.json();
  addMessage(data.reply, 'bot');
  startBtn.textContent = "🎤 Start Talking";
};

function addMessage(text, sender) {
  const message = document.createElement('div');
  message.classList.add('message', sender);
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight; // auto-scroll to bottom
}
