const chatEl = document.getElementById("chat");
const speakBtn = document.getElementById("speak-btn");
const sendBtn = document.getElementById("send-btn");

let transcript = ""; // Holds the transcribed text

const addMessage = (role, content) => {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.textContent = content;
  chatEl.appendChild(msg);
  chatEl.scrollTop = chatEl.scrollHeight;
};

const sendMessage = async (text) => {
  addMessage("user", text);
  sendBtn.disabled = true;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  const data = await res.json();
  addMessage("assistant", data.reply);
};

// Voice Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.addEventListener("start", () => {
  speakBtn.textContent = "🎙️ Listening... Click again to stop";
});

recognition.addEventListener("end", () => {
  speakBtn.textContent = "🎤 Click to Speak";
});

recognition.addEventListener("result", (e) => {
  transcript = e.results[0][0].transcript;

  // Remove old preview if exists
  const oldPreview = document.querySelector(".message.preview");
  if (oldPreview) oldPreview.remove();

  // Add new preview message
  const preview = document.createElement("div");
  preview.className = "message user preview";
  preview.innerHTML = `
    <div class="text">${transcript}</div>
    <div class="hint">Click 'Send' to send this message</div>
  `;
  chatEl.appendChild(preview);
  chatEl.scrollTop = chatEl.scrollHeight;

  sendBtn.disabled = false;
});


speakBtn.addEventListener("click", () => {
  recognition.start();
});

sendBtn.addEventListener("click", () => {
  if (!transcript) return;
  const preview = document.querySelector(".message.preview");
  if (preview) preview.remove(); // Remove preview message
  sendMessage(transcript);
  transcript = "";
});

// Assistant greeting on load
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "" }),
  });
  const data = await res.json();
  addMessage("assistant", data.reply);
});
