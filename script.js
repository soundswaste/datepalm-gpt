document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const chatContainer = document.getElementById('chatContainer');

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  const openaiApiKey = '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'; // Replace with your actual OpenAI API key

  // Function to make API call to OpenAI Assistant
  const getAssistantResponse = async (userInput) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant offering advice for early dating.' },
            { role: 'user', content: userInput },
          ],
        }),
      });

      const data = await response.json();
      const assistantReply = data.choices[0].message.content;

      return assistantReply;
    } catch (error) {
      console.error('Error:', error);
      return "Sorry, I couldn't get a response right now.";
    }
  };

  // Display a message in the chat
  const displayMessage = (message, isUser = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(isUser ? 'user-message' : 'assistant-message');
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  // Initialize chat with assistant's first message
  const initializeChat = async () => {
    const assistantIntro = "Hello! I'm Datepalm, here to help with your early dating communication. How can I assist you today?";
    displayMessage(assistantIntro);

    // Wait for user response
    startBtn.textContent = "Start talking";
  };

  // Start speech recognition and send user input to OpenAI
  startBtn.onclick = () => {
    recognition.start();
    startBtn.textContent = "Listening...";
  };

  recognition.onresult = async (event) => {
    const userText = event.results[0][0].transcript;
    displayMessage(userText, true); // Display user message

    // Get assistant's response
    const assistantReply = await getAssistantResponse(userText);
    displayMessage(assistantReply); // Display assistant's response

    startBtn.textContent = "Start talking"; // Reset button text
  };

  // Initialize chat on page load
  initializeChat();
});
