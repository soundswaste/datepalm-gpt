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

// Load assistant intro on page load
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Say hi and ask how I can help with early dating communication"
    }),
  });
  const data = await res.json();
  addMessage("assistant", data.reply);
});

sendBtn.addEventListener("click", async () => {
  const userText = inputEl.value.trim();
  if (!userText) return;

  addMessage("user", userText);
  inputEl.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText }),
  });
  const data = await res.json();
  addMessage("assistant", data.reply);
});
