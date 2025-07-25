document.addEventListener('DOMContentLoaded', function() {
    const startMicBtn = document.getElementById('startMicBtn');
    const statusText = document.querySelector('.status-text');
    const expandIcon = document.querySelector('.expand-icon');
    const closeBtn = document.getElementById('closeBtn');
    
    let isMicActive = false;
    let userCount = 0;
    const maxUsers = 45;
    
    // Initialize status text
    updateStatusText();
    
    // Handle mic button click
    startMicBtn.addEventListener('click', function() {
        if (!isMicActive) {
            // Start mic
            isMicActive = true;
            startMicBtn.textContent = 'Stop Mic';
            startMicBtn.classList.add('mic-active');
            userCount = Math.min(userCount + 1, maxUsers);
            updateStatusText();
            
            // Simulate mic activation
            console.log('Microphone activated');
            
            // You can add actual microphone functionality here
            // navigator.mediaDevices.getUserMedia({ audio: true })
            //     .then(stream => {
            //         console.log('Microphone access granted');
            //     })
            //     .catch(err => {
            //         console.error('Microphone access denied:', err);
            //         // Reset button state
            //         isMicActive = false;
            //         startMicBtn.textContent = 'Start Mic';
            //         startMicBtn.classList.remove('mic-active');
            //     });
        } else {
            // Stop mic
            isMicActive = false;
            startMicBtn.textContent = 'Start Mic';
            startMicBtn.classList.remove('mic-active');
            userCount = Math.max(userCount - 1, 0);
            updateStatusText();
            
            console.log('Microphone deactivated');
        }
    });
    
    // Handle expand icon click
    expandIcon.addEventListener('click', function() {
        // You can implement expand functionality here
        // For now, just log the action
        console.log('Expand clicked');
        
        // Optional: Open in a new window or expand the popup
        // chrome.windows.create({
        //     url: chrome.runtime.getURL('popup.html'),
        //     type: 'popup',
        //     width: 400,
        //     height: 300
        // });
    });
    
    // Handle close button click
    closeBtn.addEventListener('click', function() {
        console.log('Close button clicked');
        // Close the current window
        if (chrome && chrome.windows) {
            chrome.windows.getCurrent(function(window) {
                chrome.windows.remove(window.id);
            });
        } else {
            // Fallback for testing in browser
            window.close();
        }
    });
    
    // Handle title drag (make the popup draggable)
    const title = document.querySelector('.title');
    title.addEventListener('mousedown', function(e) {
        // This would require additional implementation for dragging
        // For now, just log the action
        console.log('Title clicked - drag functionality can be implemented');
    });
    
    // Update status text
    function updateStatusText() {
        statusText.textContent = `${userCount} of ${maxUsers}M`;
    }
    
    // Add some visual feedback for the headphone icon
    const headphoneIcon = document.querySelector('.headphone-icon');
    headphoneIcon.addEventListener('click', function() {
        // Add a subtle animation
        headphoneIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            headphoneIcon.style.transform = 'scale(1)';
        }, 200);
        
        console.log('Headphone icon clicked');
    });
    
    // Add hover effect for the headphone icon
    headphoneIcon.addEventListener('mouseenter', function() {
        headphoneIcon.style.opacity = '0.8';
    });
    
    headphoneIcon.addEventListener('mouseleave', function() {
        headphoneIcon.style.opacity = '1';
    });
}); 