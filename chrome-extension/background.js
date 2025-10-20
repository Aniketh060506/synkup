// Background service worker for CopyDock extension

let targetNotebookId = null;
let targetNotebookName = 'Default Notebook';
let port = null;

// Connect to native CopyDock desktop app
function connectToNativeApp() {
  try {
    port = chrome.runtime.connectNative('com.copydock.app');
    
    port.onMessage.addListener((message) => {
      console.log('Received from CopyDock app:', message);
      
      // Handle target notebook updates
      if (message.type === 'TARGET_NOTEBOOK_UPDATE') {
        targetNotebookId = message.notebookId;
        targetNotebookName = message.notebookName || 'Default Notebook';
        chrome.storage.local.set({ targetNotebookId, targetNotebookName });
      }
      
      // Handle success confirmation
      if (message.type === 'CAPTURE_SUCCESS') {
        console.log('Content saved successfully to:', message.notebookName);
      }
    });
    
    port.onDisconnect.addListener(() => {
      console.log('Disconnected from CopyDock app');
      port = null;
      // Try to reconnect after 5 seconds
      setTimeout(connectToNativeApp, 5000);
    });
    
    console.log('Connected to CopyDock desktop app');
  } catch (error) {
    console.error('Failed to connect to CopyDock app:', error);
    port = null;
  }
}

// Initialize connection on startup
connectToNativeApp();

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'copydock-capture',
    title: 'Send to CopyDock',
    contexts: ['selection'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copydock-capture' && info.selectionText) {
    // Send message to content script to get full HTML
    chrome.tabs.sendMessage(tab.id, {
      action: 'getSelection',
      text: info.selectionText,
    });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture-selection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'captureFromShortcut',
        });
      }
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureContent') {
    // Send to CopyDock desktop app via Native Messaging
    if (port) {
      port.postMessage({
        type: 'CONTENT_CAPTURE',
        payload: {
          ...request.data,
          targetNotebookId: targetNotebookId,
          timestamp: new Date().toISOString(),
        },
      });
      sendResponse({ success: true, message: 'Sent to CopyDock app' });
    } else {
      console.error('Not connected to CopyDock app');
      // Try to reconnect
      connectToNativeApp();
      sendResponse({ success: false, message: 'CopyDock app not running. Please start the desktop app.' });
    }
  }

  if (request.action === 'setTargetNotebook') {
    targetNotebookId = request.notebookId;
    targetNotebookName = request.notebookName || 'Default Notebook';
    chrome.storage.local.set({ targetNotebookId, targetNotebookName });
    
    // Notify desktop app
    if (port) {
      port.postMessage({
        type: 'SET_TARGET_NOTEBOOK',
        notebookId: targetNotebookId,
      });
    }
  }
  
  if (request.action === 'getConnectionStatus') {
    sendResponse({ 
      connected: port !== null,
      targetNotebookName: targetNotebookName 
    });
  }
  
  return true; // Keep channel open for async response
});

// Load target notebook on startup
chrome.storage.local.get(['targetNotebookId', 'targetNotebookName'], (result) => {
  targetNotebookId = result.targetNotebookId;
  targetNotebookName = result.targetNotebookName || 'Default Notebook';
});
