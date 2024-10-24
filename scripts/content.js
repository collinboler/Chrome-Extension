// content.js

(function() {
  let iconDiv;
  let popupDiv;

  // Function to create and show the synonym icon
  function showIcon(x, y, selectedText) {
      removeIcon(); // Remove existing icon if any

      iconDiv = document.createElement('div');
      iconDiv.style.position = 'absolute';
      iconDiv.style.left = `${x}px`;
      iconDiv.style.top = `${y}px`;
      iconDiv.style.zIndex = 2147483647; // Max z-index
      iconDiv.style.cursor = 'pointer';
      iconDiv.title = 'Get Synonyms';
      iconDiv.textContent = '🔍';
      iconDiv.style.fontSize = '20px';
      iconDiv.style.backgroundColor = '#fff';
      iconDiv.style.border = '1px solid #ccc';
      iconDiv.style.borderRadius = '4px';
      iconDiv.style.padding = '2px';

      document.body.appendChild(iconDiv);

      iconDiv.addEventListener('click', () => {
          getSynonyms(selectedText);
          removeIcon();
      });
  }

  // Function to remove the icon
  function removeIcon() {
      if (iconDiv) {
          iconDiv.remove();
          iconDiv = null;
      }
  }

  // Function to create and show the synonyms popup
  function showPopup(x, y, synonyms, selectedText) {
      removePopup(); // Remove existing popup if any

      popupDiv = document.createElement('div');
      popupDiv.style.position = 'absolute';
      popupDiv.style.left = `${x}px`;
      popupDiv.style.top = `${y}px`;
      popupDiv.style.zIndex = 2147483647; // Max z-index
      popupDiv.style.backgroundColor = '#fff';
      popupDiv.style.border = '1px solid #ccc';
      popupDiv.style.padding = '10px';
      popupDiv.style.maxWidth = '200px';
      popupDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      popupDiv.style.fontSize = '14px';

      if (synonyms === 'No suitable replacements.') {
          popupDiv.textContent = synonyms;
      } else {
          synonyms.split(', ').forEach((synonym) => {
              const synonymDiv = document.createElement('div');
              synonymDiv.textContent = synonym;
              synonymDiv.style.cursor = 'pointer';
              synonymDiv.style.padding = '5px 0';

              synonymDiv.addEventListener('click', () => {
                  replaceSelectedText(synonym);
                  removePopup();
              });

              popupDiv.appendChild(synonymDiv);
          });
      }

      // Add a close button
      const closeButton = document.createElement('div');
      closeButton.textContent = 'Close';
      closeButton.style.marginTop = '10px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.color = '#007BFF';
      closeButton.addEventListener('click', () => {
          removePopup();
      });
      popupDiv.appendChild(closeButton);

      document.body.appendChild(popupDiv);
  }

  // Function to remove the popup
  function removePopup() {
      if (popupDiv) {
          popupDiv.remove();
          popupDiv = null;
      }
  }

  // Function to get synonyms via background script
  function getSynonyms(selectedText) {
      chrome.runtime.sendMessage({ action: 'getSynonyms', selectedText: selectedText }, (response) => {
          if (response && response.synonyms) {
              const selection = window.getSelection();
              if (selection.rangeCount === 0) return;

              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              const x = rect.left + window.scrollX;
              const y = rect.bottom + window.scrollY;

              showPopup(x, y, response.synonyms, selectedText);
          } else if (response && response.error) {
              alert(response.error);
          } else {
              alert('Failed to get synonyms.');
          }
      });
  }

  // Function to replace the selected text
  function replaceSelectedText(replacement) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      // For contentEditable elements, like in Google Docs
      if (document.activeElement && document.activeElement.isContentEditable) {
          // Attempt to replace text in contentEditable element
          document.execCommand('insertText', false, replacement);
      } else {
          // Standard text replacement
          range.deleteContents();
          range.insertNode(document.createTextNode(replacement));
          selection.removeAllRanges();
      }
  }

  // Listen for selection changes
  document.addEventListener('selectionchange', () => {
      setTimeout(() => {
          const selection = window.getSelection();
          if (!selection) {
              removeIcon();
              return;
          }

          const selectedText = selection.toString().trim();
          if (selectedText) {
              try {
                  const range = selection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  const x = rect.right + window.scrollX;
                  const y = rect.top + window.scrollY;

                  showIcon(x, y, selectedText);
              } catch (e) {
                  // In case of errors, remove the icon
                  removeIcon();
              }
          } else {
              removeIcon();
          }
      }, 100);
  });

  // Remove icon and popup when clicking elsewhere
  document.addEventListener('mousedown', (event) => {
      if (iconDiv && !iconDiv.contains(event.target)) {
          removeIcon();
      }
      if (popupDiv && !popupDiv.contains(event.target)) {
          removePopup();
      }
  });
})();
