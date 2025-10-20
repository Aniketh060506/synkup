// CopyDock Chrome Extension - Background Service Worker

// Use the public backend URL that routes through the proxy
const API_URL = 'https://sprint-3.preview.emergentagent.com/api';

let connectionStatus = 'disconnected';
let targetNotebookId = null;
let targetNotebookName = 'Web Captures';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CopyDock Extension installed');
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'copydock-capture',
    title: 'Send to CopyDock',
    contexts: ['selection']
  });
  
  // Load saved settings
  chrome.storage.local.get(['targetNotebookId', 'targetNotebookName'], (result) => {
    if (result.targetNotebookId) {
      targetNotebookId = result.targetNotebookId;
    }
    if (result.targetNotebookName) {
      targetNotebookName = result.targetNotebookName;
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copydock-capture' && info.selectionText) {
    captureContent(info.selectionText, '', tab.url, tab);
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture-selection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'captureSelection' });
      }
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'capture') {
    captureContent(
      request.selectedText,
      request.selectedHTML,
      request.sourceUrl,
      sender.tab
    ).then(response => {
      sendResponse(response);
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getSettings') {
    sendResponse({
      targetNotebookId: targetNotebookId,
      targetNotebookName: targetNotebookName,
      connectionStatus: connectionStatus
    });
    return true;
  }
  
  if (request.action === 'setTargetNotebook') {
    targetNotebookId = request.notebookId;
    targetNotebookName = request.notebookName;
    chrome.storage.local.set({ targetNotebookId, targetNotebookName });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'checkConnection') {
    checkConnection().then(status => {
      sendResponse({ status });
    });
    return true;
  }
});

// Capture content and send to backend
async function captureContent(selectedText, selectedHTML, sourceUrl, tab) {
  try {
    const url = new URL(sourceUrl);
    const domain = url.hostname;
    
    const payload = {
      selectedText: selectedText,
      selectedHTML: selectedHTML || '',
      sourceDomain: domain,
      sourceUrl: sourceUrl,
      targetNotebookId: targetNotebookId || 'default',
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending capture to backend:', payload);
    
    const response = await fetch(`${API_URL}/web-capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Backend response:', result);
    
    connectionStatus = 'connected';
    
    // Send success message back to content script
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'captureSuccess',
        notebookName: result.notebookName || targetNotebookName
      });
    }
    
    return {
      success: true,
      notebookName: result.notebookName || targetNotebookName
    };
    
  } catch (error) {
    console.error('Capture error:', error);
    connectionStatus = 'error';
    
    // Send error message back to content script
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'captureError',
        error: error.message
      });
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Check connection to backend
async function checkConnection() {
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      connectionStatus = 'connected';
      return 'connected';
    } else {
      connectionStatus = 'disconnected';
      return 'disconnected';
    }
  } catch (error) {
    connectionStatus = 'error';
    return 'error';
  }
}

// Periodic connection check
setInterval(checkConnection, 30000); // Check every 30 seconds
checkConnection(); // Initial check