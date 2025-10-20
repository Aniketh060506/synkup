// Popup script for CopyDock extension

document.getElementById('openApp').addEventListener('click', () => {
  // Since it's a desktop app, we can't "open" it via URL
  // Just show a message
  alert('Please open the CopyDock desktop application if it\'s not already running.');
});

// Check connection status and update UI
function updateStatus() {
  chrome.runtime.sendMessage({ action: 'getConnectionStatus' }, (response) => {
    const statusEl = document.getElementById('status');
    const targetEl = document.getElementById('target');
    const statusDot = document.getElementById('statusDot');

    if (response && response.connected) {
      statusEl.textContent = 'Connected';
      statusEl.style.color = '#4ade80';
      statusDot.style.background = '#4ade80';
      
      targetEl.textContent = response.targetNotebookName || 'Default Notebook';
    } else {
      statusEl.textContent = 'Disconnected';
      statusEl.style.color = '#ef4444';
      statusDot.style.background = '#ef4444';
      
      targetEl.textContent = 'App not running';
      targetEl.style.color = '#999';
    }
  });
}

// Update status immediately and every 3 seconds
updateStatus();
setInterval(updateStatus, 3000);

