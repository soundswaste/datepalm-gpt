document.addEventListener('DOMContentLoaded', () => {
  const inputElement = document.getElementById('userInput');
  const submitButton = document.getElementById('submitBtn');
  const chatBox = document.getElementById('chatBox');
  
  submitButton.addEventListener('click', async () => {
    const userInput = inputElement.value.trim();
    
    if (!userInput) {
      return;  // Don't send empty messages
    }

    // Display user message in the chat
    chatBox.innerHTML += `<div class="user-message">${userInput}</div>`;
    inputElement.value = ''; // Clear input field
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom

    try {
      // API call to OpenAI from frontend
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // This will need to be in your .env file in production
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Your OpenAI model
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' }, // Optional system message
            { role: 'user', content: userInput }, // User input
          ],
        }),
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error('Failed to fetch from OpenAI');
      }

      const data = await response.json();
      const assistantReply = data.choices[0].message.content;

      // Display assistant's response in the chat
      chatBox.innerHTML += `<div class="assistant-message">${assistantReply}</div>`;
      chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom

    } catch (error) {
      console.error('Error fetching from OpenAI:', error);
      chatBox.innerHTML += `<div class="error-message">Oops! Something went wrong. Please try again later.</div>`;
      chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    }
  });
});
