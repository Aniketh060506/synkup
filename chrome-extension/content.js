// Content script for CopyDock extension

let floatingButton = null;
let currentSelection = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    captureCurrentSelection();
  }

  if (request.action === 'captureFromShortcut') {
    captureCurrentSelection();
  }

  // Forward messages to CopyDock app
  if (request.type === 'CONTENT_CAPTURE') {
    window.postMessage(request, '*');
  }
});

// Capture current selection and send to CopyDock
function captureCurrentSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());

    // Get clean HTML
    const selectedHTML = container.innerHTML;
    const selectedText = selection.toString();

    // Extract page info
    const sourceDomain = window.location.hostname.replace('www.', '');
    const sourceUrl = window.location.href;

    // Send to background script
    chrome.runtime.sendMessage({
      action: 'captureContent',
      data: {
        selectedText,
        selectedHTML,
        sourceDomain,
        sourceUrl,
      },
    });

    // Visual feedback
    showCaptureNotification();
    hideFloatingButton();
  }
}

// Listen for text selection on the page
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('touchend', handleTextSelection);

// Handle text selection
function handleTextSelection(e) {
  // Small delay to ensure selection is complete
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      currentSelection = selection;
      showFloatingButton(e);
    } else {
      hideFloatingButton();
    }
  }, 10);
}

// Show floating "Send to CopyDock" button
function showFloatingButton(event) {
  // Remove existing button if any
  hideFloatingButton();

  // Create floating button
  floatingButton = document.createElement('div');
  floatingButton.id = 'copydock-floating-button';
  floatingButton.innerHTML = `
    <button class="copydock-btn">
      <span class="copydock-icon">📋</span>
      <span class="copydock-text">Send to CopyDock</span>
    </button>
  `;

  // Position near cursor
  const x = event.pageX;
  const y = event.pageY;
  
  floatingButton.style.cssText = `
    position: absolute;
    left: ${x + 10}px;
    top: ${y + 10}px;
    z-index: 999999;
    animation: copydockFadeIn 0.2s ease-out;
  `;

  document.body.appendChild(floatingButton);

  // Add click handler
  const btn = floatingButton.querySelector('.copydock-btn');
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    captureCurrentSelection();
  });

  // Hide on click outside
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 100);
}

// Hide floating button
function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.remove();
    floatingButton = null;
    document.removeEventListener('click', handleClickOutside);
  }
}

// Handle clicks outside the button
function handleClickOutside(e) {
  if (floatingButton && !floatingButton.contains(e.target)) {
    hideFloatingButton();
  }
}

window.addEventListener('message', (event) => {
  if (event.data.type === 'TARGET_NOTEBOOK_UPDATED') {
    chrome.runtime.sendMessage({
      action: 'setTargetNotebook',
      notebookId: event.data.notebookId,
    });
  }
});

// Show visual feedback when content is captured
function showCaptureNotification() {
  const notification = document.createElement('div');
  notification.textContent = '✅ Copied to CopyDock';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1C1C1E;
    color: white;
    padding: 12px 20px;
    border-radius: 20px;
    font-family: -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
