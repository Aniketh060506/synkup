// CopyDock Extension Popup Script

let connectionStatusInterval = null;

// Initialize popup
init();

function init() {
  updateStatus();
  
  // Update status every 3 seconds
  connectionStatusInterval = setInterval(updateStatus, 3000);
  
  // Test capture button
  document.getElementById('test-capture').addEventListener('click', testCapture);
}

// Update connection status and settings
function updateStatus() {
  // Get settings from background script
  chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
    if (response) {
      updateNotebookDisplay(response.targetNotebookName || 'Web Captures');
      updateConnectionDisplay(response.connectionStatus || 'checking');
    }
  });
  
  // Check actual connection
  chrome.runtime.sendMessage({ action: 'checkConnection' }, (response) => {
    if (response) {
      updateConnectionDisplay(response.status);
    }
  });
}

function updateConnectionDisplay(status) {
  const statusElement = document.getElementById('connection-status');
  const dot = statusElement.querySelector('.status-dot');
  const text = statusElement.querySelector('span:last-child');
  
  // Remove all status classes
  dot.classList.remove('status-connected', 'status-disconnected', 'status-checking');
  
  if (status === 'connected') {
    dot.classList.add('status-connected');
    text.textContent = 'Connected ✅';
    text.style.color = '#10B981';
  } else if (status === 'error' || status === 'disconnected') {
    dot.classList.add('status-disconnected');
    text.textContent = 'Disconnected ❌';
    text.style.color = '#EF4444';
  } else {
    dot.classList.add('status-checking');
    text.textContent = 'Checking...';
    text.style.color = '#F59E0B';
  }
}

function updateNotebookDisplay(notebookName) {
  document.getElementById('target-notebook').textContent = notebookName;
}

function testCapture() {
  const button = document.getElementById('test-capture');
  button.textContent = 'Testing...';
  button.disabled = true;
  
  // Send test message to background
  chrome.runtime.sendMessage({
    action: 'capture',
    selectedText: 'This is a test capture from CopyDock extension!',
    selectedHTML: '<p>This is a <strong>test</strong> capture.</p>',
    sourceUrl: 'chrome-extension://test'
  }, (response) => {
    button.disabled = false;
    if (response && response.success) {
      button.textContent = '✅ Test Successful!';
      button.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      setTimeout(() => {
        button.textContent = 'Test Capture';
        button.style.background = '';
      }, 2000);
    } else {
      button.textContent = '❌ Test Failed';
      button.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
      setTimeout(() => {
        button.textContent = 'Test Capture';
        button.style.background = '';
      }, 2000);
    }
  });
}

// Cleanup interval on popup close
window.addEventListener('unload', () => {
  if (connectionStatusInterval) {
    clearInterval(connectionStatusInterval);
  }
});