const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const chatLog = document.getElementById('chat-log');
const thinkingMessage = document.getElementById('thinking'); // Thinking message element

// Speech-to-text functionality (using the Web Speech API)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = true; // Enable real-time transcription

// Function to update chat log
function updateChatLog(content, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = content;
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
}

// Function to speak out the assistant's response
function speakText(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = 'en-US';
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;
  window.speechSynthesis.speak(speech);
}

// Start speech-to-text recognition when user clicks 'Start talking'
sendButton.addEventListener('click', () => {
  const message = userInput.value.trim();
  
  if (message === "") {
    // Start speech-to-text when there's no user input
    recognition.start();
    
    // Show the "Listening..." animation (change button text)
    sendButton.textContent = "Listening... Click when Done";
    
    // Capture the speech-to-text and update the input field
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      userInput.value = transcript; // Update input field with transcribed speech
    };

    recognition.onend = () => {
      // After speech recognition ends, show the 'Send' button again
      sendButton.textContent = "Send";
    };
  } else {
    // When there's user input in the text box, send the message
    sendMessage(message);
  }
});

// Function to send the message and get the assistant's response
async function sendMessage(message) {
  // Show the user's message
  updateChatLog(message, 'user');
  userInput.value = ''; // Clear the input field

  // Show "Thinking..." message before the assistant responds
  thinkingMessage.style.display = 'block';

  try {
    // Call the /api/chat endpoint to get the assistant's response
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_message: message })
    });

    if (response.ok) {
      const data = await response.json();
      const assistantMessage = data.assistant_response || 'Sorry, I didn\'t catch that. Can you try again?';

      // Hide "Thinking..." and show the assistant's response
      thinkingMessage.style.display = 'none';
      updateChatLog(assistantMessage, 'assistant');

      // Speak out the assistant's response
      speakText(assistantMessage);
    } else {
      // Handle error response
      thinkingMessage.style.display = 'none';
      updateChatLog("There was an issue with the assistant. Please try again.", 'assistant');
    }
  } catch (error) {
    console.error('Error fetching from /api/chat:', error);
    thinkingMessage.style.display = 'none';
    updateChatLog("Something went wrong! Please try again.", 'assistant');
  }
}
