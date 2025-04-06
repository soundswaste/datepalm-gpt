const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

const addMessage = (role, content) => {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.textContent = content;
  chatEl.appendChild(msg);
  chatEl.scrollTop = chatEl.scrollHeight;
};

const sendMessage = async (text) => {
  addMessage("user", text);
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });
  const data = await res.json();
  addMessage("assistant", data.reply);
};

sendBtn.addEventListener("click", () => {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  sendMessage(text);
});

// Voice Input (Web Speech API)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Trigger voice input when user presses Enter in input
inputEl.addEventListener("focus", () => recognition.start());
recognition.addEventListener("result", (e) => {
  const transcript = e.results[0][0].transcript;
  inputEl.value = transcript;
  sendBtn.click();
});

// Load assistant's greeting on page load
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "" }),
  });
  const data = await res.json();
  addMessage("assistant", data.reply);
});
