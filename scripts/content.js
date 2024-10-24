// Function to check if we are inside Google Docs and adjust accordingly
function isGoogleDocs() {
  return window.location.host.includes("docs.google.com");
}

// Function to handle highlighting in Google Docs
function handleGoogleDocsSelection() {
  let selectedText = document.getSelection().toString().trim();

  // Check if text is selected
  if (selectedText.length > 0) {
      let range = document.getSelection().getRangeAt(0).getBoundingClientRect();
      createPopupIcon(range.right, range.top + window.scrollY, selectedText);
  }
}

// Function to handle normal text editor selection
function handleNormalSelection() {
  const selectedText = window.getSelection().toString().trim();

  // Remove any existing popup if no text is selected
  let existingPopup = document.getElementById('synonym-popup');
  if (existingPopup) {
      existingPopup.remove();
  }

  if (selectedText.length > 0) {
      const range = window.getSelection().getRangeAt(0).getBoundingClientRect();
      createPopupIcon(range.right, range.top + window.scrollY, selectedText);
  }
}

// Function to create a popup icon and place it near the selected word
function createPopupIcon(x, y, selectedText) {
  let existingPopup = document.getElementById('synonym-popup');
  if (existingPopup) existingPopup.remove();

  let popupIcon = document.createElement('div');
  popupIcon.id = 'synonym-popup';
  popupIcon.innerHTML = `<img src="${chrome.runtime.getURL("images/hello_extensions.png")}" />`;

  popupIcon.style.position = 'absolute';
  popupIcon.style.left = `${x + 5}px`;
  popupIcon.style.top = `${y - 10}px`;
  popupIcon.style.width = '24px';
  popupIcon.style.height = '24px';
  popupIcon.style.border = '1px solid #ccc';
  popupIcon.style.borderRadius = '50%';
  popupIcon.style.backgroundColor = '#f1f1f1';
  popupIcon.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  popupIcon.style.cursor = 'pointer';
  popupIcon.style.zIndex = '10000';

  document.body.appendChild(popupIcon);

  // Click event to show synonym suggestions
  popupIcon.addEventListener('click', function () {
      showSynonymWindow(popupIcon, selectedText);
  });
}

// Function to show the mini-window with synonym suggestions
function showSynonymWindow(popupIcon, selectedText) {
  const synonymWindow = document.createElement('div');
  synonymWindow.style.position = 'absolute';
  synonymWindow.style.top = `${popupIcon.getBoundingClientRect().top - 40}px`;
  synonymWindow.style.left = `${popupIcon.getBoundingClientRect().left}px`;
  synonymWindow.style.backgroundColor = 'white';
  synonymWindow.style.border = '1px solid #ccc';
  synonymWindow.style.borderRadius = '5px';
  synonymWindow.style.padding = '8px';
  synonymWindow.style.fontSize = '14px';
  synonymWindow.style.maxWidth = '200px';
  synonymWindow.style.zIndex = '10001';
  synonymWindow.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';

  synonymWindow.innerHTML = "<strong>Synonyms:</strong><br/>";
  synonymWindow.innerHTML += `<div style="padding: 4px;">Loading synonyms for "${selectedText}"...</div>`;

  document.body.appendChild(synonymWindow);

  // Fetch and display synonyms from background.js
  chrome.runtime.sendMessage({ action: 'fetchSynonyms', word: selectedText }, function(response) {
      synonymWindow.innerHTML = "<strong>Synonyms:</strong><br/>";
      if (response && response.synonyms) {
          response.synonyms.forEach(synonym => {
              const synonymItem = document.createElement('div');
              synonymItem.style.cursor = 'pointer';
              synonymItem.style.padding = '4px 6px';
              synonymItem.style.borderRadius = '3px';
              synonymItem.textContent = synonym;
              synonymItem.addEventListener('click', () => {
                  replaceWord(selectedText, synonym);
                  synonymWindow.remove();
              });
              synonymItem.addEventListener('mouseover', () => {
                  synonymItem.style.backgroundColor = '#f1f1f1';
              });
              synonymItem.addEventListener('mouseout', () => {
                  synonymItem.style.backgroundColor = 'white';
              });
              synonymWindow.appendChild(synonymItem);
          });
      } else {
          synonymWindow.innerHTML += "<div style='padding: 4px;'>No synonyms found.</div>";
      }
  });
}

// Replace selected word with chosen synonym
function replaceWord(originalWord, synonym) {
  const range = window.getSelection().getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(synonym));
}

// Listen for text selection in both Google Docs and normal editors
document.addEventListener('mouseup', function () {
  if (isGoogleDocs()) {
      handleGoogleDocsSelection();
  } else {
      handleNormalSelection();
  }
});
