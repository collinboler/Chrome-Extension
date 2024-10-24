document.addEventListener('DOMContentLoaded', () => {
  // Load stored API key, word, sentence, and result
  chrome.storage.local.get(['apiKey', 'word', 'sentence', 'result'], (items) => {
      if (items.apiKey) {
          document.getElementById('apiKey').value = items.apiKey;
      }
      if (items.word) {
          document.getElementById('word').value = items.word;
      }
      if (items.sentence) {
          document.getElementById('sentence').value = items.sentence;
      }
      if (items.result) {
          document.getElementById('result').textContent = items.result;
      }
  });
});

// Save API Key when "Save API Key" button is clicked
document.getElementById('saveApiKey').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  if (!apiKey) {
      alert('Please enter your API key.');
      return;
  }
  // Save the API key
  chrome.storage.local.set({ 'apiKey': apiKey }, () => {
      alert('API key saved.');
  });
});

document.getElementById('submit').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const word = document.getElementById('word').value.trim();
  const sentence = document.getElementById('sentence').value.trim();
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = 'Loading...';

  if (!apiKey || !word || !sentence) {
      resultDiv.textContent = 'Please fill in all fields.';
      return;
  }

  // Save the word and sentence
  chrome.storage.local.set({ 'word': word, 'sentence': sentence });

  const prompt = `Provide synonyms for the word "${word}" that make sense in the context of the sentence: "${sentence}". Provide three. If no suitable replacements, reply with "No suitable replacements."`;

  try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                  { "role": "user", "content": prompt }
              ]
          })
      });

      if (!response.ok) {
          const error = await response.json();
          resultDiv.textContent = `Error: ${error.error.message}`;
          // Save the error message to storage
          chrome.storage.local.set({ 'result': resultDiv.textContent });
          return;
      }

      const data = await response.json();
      const reply = data.choices[0].message.content.trim();
      resultDiv.textContent = reply;

      // Save the result to storage
      chrome.storage.local.set({ 'result': reply });
  } catch (error) {
      console.error(error);
      resultDiv.textContent = 'An error occurred.';
      // Save the error message to storage
      chrome.storage.local.set({ 'result': resultDiv.textContent });
  }
});
