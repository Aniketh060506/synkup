// CopyDock Chrome Extension - Content Script

let floatingButton = null;
let currentSelection = null;

// Initialize
init();

function init() {
  // Listen for text selection
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureSelection') {
      captureCurrentSelection();
    }
    
    if (request.action === 'captureSuccess') {
      showToast(`✅ Saved to ${request.notebookName}`, 'success');
      hideFloatingButton();
    }
    
    if (request.action === 'captureError') {
      showToast(`❌ Error: ${request.error}`, 'error');
    }
  });
}

function handleTextSelection(e) {
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      currentSelection = {
        text: selectedText,
        html: getSelectedHTML(selection)
      };
      showFloatingButton(e);
    } else {
      hideFloatingButton();
      currentSelection = null;
    }
  }, 10);
}

function getSelectedHTML(selection) {
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const div = document.createElement('div');
    div.appendChild(range.cloneContents());
    return div.innerHTML;
  }
  return '';
}

function showFloatingButton(event) {
  if (!floatingButton) {
    floatingButton = document.createElement('div');
    floatingButton.id = 'copydock-floating-button';
    floatingButton.innerHTML = '📋 Send to CopyDock';
    floatingButton.addEventListener('click', captureCurrentSelection);
    document.body.appendChild(floatingButton);
  }
  
  // Position near the selection
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    floatingButton.style.left = `${rect.left + window.scrollX}px`;
    floatingButton.style.top = `${rect.bottom + window.scrollY + 5}px`;
  }
  
  floatingButton.classList.add('show');
}

function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.classList.remove('show');
    setTimeout(() => {
      if (floatingButton && !floatingButton.classList.contains('show')) {
        floatingButton.remove();
        floatingButton = null;
      }
    }, 300);
  }
}

function captureCurrentSelection() {
  if (!currentSelection) {
    showToast('⚠️ No text selected', 'warning');
    return;
  }
  
  // Show loading state
  if (floatingButton) {
    floatingButton.innerHTML = '⏳ Saving...';
    floatingButton.classList.add('loading');
  }
  
  // Send to background script
  chrome.runtime.sendMessage({
    action: 'capture',
    selectedText: currentSelection.text,
    selectedHTML: currentSelection.html,
    sourceUrl: window.location.href
  }, (response) => {
    console.log('Capture response:', response);
  });
}

function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existingToast = document.getElementById('copydock-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.id = 'copydock-toast';
  toast.className = `copydock-toast copydock-toast-${type}`;
  toast.innerHTML = message;
  document.body.appendChild(toast);
  
  // Show animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Hide floating button when clicking outside
document.addEventListener('click', (e) => {
  if (floatingButton && !floatingButton.contains(e.target)) {
    const selection = window.getSelection();
    if (!selection.toString().trim()) {
      hideFloatingButton();
    }
  }
});