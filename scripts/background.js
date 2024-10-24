// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSynonyms') {
        const selectedText = request.selectedText;
        // Retrieve API key
        chrome.storage.local.get(['apiKey'], (items) => {
            if (!items.apiKey) {
                sendResponse({ error: 'API key not set. Please set your API key in the extension popup.' });
                return;
            }

            const apiKey = items.apiKey;
            const prompt = `Provide synonyms for the text: "${selectedText}". List them separated by commas. If no suitable replacements, reply with "No suitable replacements."`;

            fetch('https://api.openai.com/v1/chat/completions', {
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
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.choices && data.choices.length > 0) {
                    const reply = data.choices[0].message.content.trim();
                    sendResponse({ synonyms: reply });
                } else {
                    sendResponse({ error: 'No suitable replacements found.' });
                }
            })
            .catch(error => {
                console.error(error);
                sendResponse({ error: 'Error fetching synonyms.' });
            });
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});
