const startBtn = document.getElementById('start');
const chat = document.getElementById('chat');

// Setup speech
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

// Show a bot message on load
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "init" })
  });
  const data = await res.json();
  addMessage(data.reply, 'bot');
});

function addMessage(text, sender) {
  const message = document.createElement('div');
  message.classList.add('message', sender);
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}
