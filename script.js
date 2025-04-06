const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const chatLog = document.getElementById('chat-log');
const thinkingMessage = document.getElementById('thinking'); // Thinking message element

function updateChatLog(content, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = content;
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
}

sendButton.addEventListener('click', async () => {
  const message = userInput.value.trim();
  
  if (message) {
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
});
