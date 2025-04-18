const chatEl = document.getElementById("chat");
const speakBtn = document.getElementById("speak-btn");
const sendBtn = document.getElementById("send-btn");

let transcript = ""; // Holds the transcribed text
let isWaitingForResponse = false; // Track whether we're waiting for the assistant's response


const addMessage = (role, content) => {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.textContent = content;
  chatEl.appendChild(msg);
  chatEl.scrollTop = chatEl.scrollHeight;
};

const sendMessage = async (text) => {
  addMessage("user", text); // Show the user's message
  sendBtn.disabled = true;
  speakBtn.disabled = true; // Disable mic button during assistant response
    // Disable listening while waiting for the assistant's response
    recognition.stop();
    isWaitingForResponse = true;

  // Add a "Thinking..." message from assistant
  const thinkingMsg = document.createElement("div");
  thinkingMsg.className = "message assistant thinking";  // Add class 'thinking'
  thinkingMsg.textContent = "Thinking...";  // Set message text to "Thinking..."
  chatEl.appendChild(thinkingMsg);
  chatEl.scrollTop = chatEl.scrollHeight;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  const data = await res.json();

  // Remove the "Thinking..." message after response comes back
  chatEl.removeChild(thinkingMsg);  // Remove the "Thinking..." message

  // Add assistant's reply
  addMessage("assistant", data.reply);

  // Reactivate voice recognition after response
  isWaitingForResponse = false;
  speakBtn.disabled = false;
};

// Voice Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = true; //Enable continuous listening
recognition.interimResults = true; //Allow interimResults to true (for real-time partial updates
recognition.maxAlternatives = 1;

recognition.addEventListener("start", () => {
  speakBtn.textContent = "🎙️ Listening... Click again to stop";
});

recognition.addEventListener("end", () => {
  speakBtn.textContent = "🎤 Click to Speak";
});

recognition.addEventListener("result", (e) => {
  let interim = "";
  for (let i = e.resultIndex; i < e.results.length; i++) {
    const result = e.results[i];
    if (result.isFinal) {
      transcript += result[0].transcript + " ";
    } else {
      interim += result[0].transcript;
    }
  }

  // Remove old preview if exists
  const oldPreview = document.querySelector(".message.preview");
  if (oldPreview) oldPreview.remove();

  // Add updated preview message
  const preview = document.createElement("div");
  preview.className = "message user preview";
  preview.innerHTML = `
    <div class="text">${transcript + interim}</div>
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
  setTimeout(() => {
    const preview = document.querySelector(".message.preview");
    if (preview) preview.remove(); // Remove preview message
    sendMessage(transcript);
    transcript = "";
  }, 300); //delay of 300 ms to ensure all transcribed text gets sent
});

// Assistant greeting on load
window.addEventListener("DOMContentLoaded", async () => {

  const warmingEl = document.getElementById("warming-up");
  speakBtn.disabled = true; // Disable mic button during assistant response

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "" }),
  });
  const data = await res.json();

  // Remove the warming message
  if (warmingEl) warmingEl.remove();
  speakBtn.disabled = false; //re-enable speak buton

  addMessage("assistant", data.reply);
});
