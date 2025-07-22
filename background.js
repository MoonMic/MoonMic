// MoonMic Background Script
chrome.action.onClicked.addListener(async (tab) => {
  // Send message to content script to toggle overlay
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleOverlay'
    });
    
    if (response && response.success) {
      console.log('Overlay toggled successfully');
    }
  } catch (error) {
    console.error('Failed to toggle overlay:', error);
    
    // If content script is not loaded, inject it
    if (error.message.includes('Could not establish connection')) {
      console.log('Content script not loaded, injecting...');
      
      // Inject the content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Inject the CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['overlay.css']
      });
      
      // Try to toggle overlay again
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'toggleOverlay'
          });
        } catch (retryError) {
          console.error('Still failed to toggle overlay:', retryError);
        }
      }, 100);
    }
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('MoonMic extension installed');
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('MoonMic extension started');
}); 