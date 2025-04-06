const startTalkingBtn = document.getElementById('start-talking-btn');
const chatLog = document.getElementById('chat-log');

let isListening = false;
let recognition;

function updateChatLog(content, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = content;
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
}

// Check for browser support of SpeechRecognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true; // Keep recognizing speech until stopped
  recognition.interimResults = true; // Show results while still listening

  recognition.onstart = () => {
    updateChatLog("Listening... Say something!", 'assistant');
    startTalkingBtn.textContent = 'Listening. Click when Done.';
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    // Display the current transcript (real-time transcription)
    updateChatLog(transcript, 'user');
  };

  recognition.onend = () => {
    if (isListening) {
      updateChatLog('Stopped listening.', 'assistant');
      startTalkingBtn.textContent = 'Start talking';
    }
  };

  recognition.onerror = (event) => {
    updateChatLog('Error occurred: ' + event.error, 'assistant');
    startTalkingBtn.textContent = 'Start talking';
  };
} else {
  alert("Speech Recognition is not supported in this browser.");
}

startTalkingBtn.addEventListener('click', () => {
  if (!isListening) {
    recognition.start();
    isListening = true;
  } else {
    recognition.stop();
    isListening = false;
  }
});
