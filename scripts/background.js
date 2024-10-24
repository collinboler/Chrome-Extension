chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fetchSynonyms') {
        // Here, you can make the API call to fetch synonyms and send back the response
        fetchSynonyms(message.word).then(synonyms => {
            sendResponse({ synonyms: synonyms });
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});

// Example function to fetch synonyms (you can adjust this for your OpenAI API logic)
function fetchSynonyms(word) {
    return new Promise((resolve) => {
        // Simulate API call (replace this with actual API call logic)
        setTimeout(() => {
            resolve(["example", "sample", "model"]);  // Placeholder for actual synonyms
        }, 1000);
    });
}
