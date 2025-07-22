// MoonMic Overlay Content Script
let moonMicOverlay = null;
let isOverlayVisible = false;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let currentPageType = null; // 'axiom', 'bullx', or null

// Voice Chat Variables
let voiceChat = {
    ws: null,
    localStream: null,
    peerConnections: new Map(),
    localUserId: null,
    username: null,
    roomId: null,
    isMuted: false,
    participants: new Map(),
    userVolumes: new Map(), // Store individual user volumes (0.0 to 1.0)
    userMutes: new Map()    // Store individual user mute states
};

// Test mode - set to true to test without server
const TEST_MODE = false;

// Server URLs - update these with your deployed server
const LOCAL_SERVER_URL = 'ws://localhost:3000';
const PRODUCTION_SERVER_URL = 'wss://moonmic-production.up.railway.app'; // Railway deployment

// Choose which server to use (change this for testing vs production)
const SERVER_URL = PRODUCTION_SERVER_URL; // Change to LOCAL_SERVER_URL for local testing

// WebRTC Configuration
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Create the overlay HTML
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'moonmic-overlay';
    
    overlay.innerHTML = `
        <div class="moonmic-container">
            <!-- Header Section -->
            <div class="moonmic-header">
                <div class="moonmic-title-section">
                    <h1 class="moonmic-title">Moon<span class="mic">Mic</span></h1>
                    <div class="moonmic-icon">
                        <img src="${chrome.runtime.getURL('icons/moonmic.png')}" alt="MoonMic" width="20" height="20">
                    </div>
                </div>
                <div class="moonmic-header-controls">
                    <div class="moonmic-close-icon" id="moonmic-close-btn">✕</div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="moonmic-main-content">
                <button class="moonmic-start-btn" id="moonmic-start-btn">
                    Join Voice Chat
                </button>
            </div>
        </div>
    `;
    
    return overlay;
}

// Reset UI to initial state
function resetToInitialUI() {
    if (moonMicOverlay) {
        const mainContent = moonMicOverlay.querySelector('.moonmic-main-content');
        
        // Remove any special height classes
        moonMicOverlay.classList.remove('showing-not-found');
        moonMicOverlay.classList.remove('showing-username');
        moonMicOverlay.classList.remove('showing-voice-chat');
        
        // Reset to initial "Join Voice Chat" button
        mainContent.innerHTML = `
            <button class="moonmic-start-btn" id="moonmic-start-btn">
                Join Voice Chat
            </button>
        `;
        
        // Re-setup the start button listener
        const startBtn = document.getElementById('moonmic-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                console.log('Start button clicked');
                // Re-detect page type in case it changed
                detectPageType();
                showAppropriateUI();
            });
        }
    }
}

// Show the overlay
function showOverlay() {
    if (isOverlayVisible) return;
    
    if (!moonMicOverlay) {
        moonMicOverlay = createOverlay();
        document.body.appendChild(moonMicOverlay);
        
        // Add event listeners
        setupEventListeners();
        setupDragging();
    } else {
        // Reset to initial UI when reopening
        resetToInitialUI();
    }
    
    moonMicOverlay.style.display = 'block';
    isOverlayVisible = true;
}

// Hide the overlay
function hideOverlay() {
    console.log('hideOverlay called');
    if (moonMicOverlay) {
        moonMicOverlay.style.display = 'none';
        isOverlayVisible = false;
        console.log('Overlay hidden');
    } else {
        console.log('moonMicOverlay is null');
    }
}

// Setup event listeners
function setupEventListeners() {
    const closeBtn = document.getElementById('moonmic-close-btn');
    const moonIcon = document.querySelector('.moonmic-icon');
    const startBtn = document.getElementById('moonmic-start-btn');
    
    let isMicActive = false;
    
    // Handle initial start button click
    startBtn.addEventListener('click', function() {
        console.log('Start button clicked');
        // Re-detect page type in case it changed
        detectPageType();
        showAppropriateUI();
    });
    

    
    // Handle close button click
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent dragging from starting
        e.preventDefault(); // Prevent any default behavior
        console.log('Close button clicked');
        hideOverlay();
    });
    
    // Also handle mousedown to prevent dragging
    closeBtn.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    
    // Handle moon icon click
    moonIcon.addEventListener('click', function() {
        moonIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            moonIcon.style.transform = 'scale(1)';
        }, 200);
        console.log('Moon icon clicked');
    });
}

// Setup dragging functionality
function setupDragging() {
    const header = moonMicOverlay.querySelector('.moonmic-header');
    
    header.addEventListener('mousedown', function(e) {
        // Don't start dragging if clicking on interactive elements
        if (e.target.closest('.moonmic-close-icon') || 
            e.target.closest('.moonmic-icon') || 
            e.target.closest('.moonmic-title')) {
            console.log('Dragging prevented - clicked on interactive element');
            return;
        }
        
        // Only start dragging on left mouse button
        if (e.button !== 0) return;
        
        console.log('Starting drag');
        isDragging = true;
        const rect = moonMicOverlay.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        
        // Add dragging cursor
        moonMicOverlay.style.cursor = 'grabbing';
        header.style.cursor = 'grabbing';
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep the overlay within viewport bounds
        const maxX = window.innerWidth - moonMicOverlay.offsetWidth;
        const maxY = window.innerHeight - moonMicOverlay.offsetHeight;
        
        moonMicOverlay.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        moonMicOverlay.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            moonMicOverlay.style.cursor = 'default';
            header.style.cursor = 'default';
        }
    });
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleOverlay') {
        if (isOverlayVisible) {
            hideOverlay();
        } else {
            showOverlay();
        }
        sendResponse({success: true});
    }
});

// Show appropriate UI based on current page
function showAppropriateUI() {
    const mainContent = moonMicOverlay.querySelector('.moonmic-main-content');
    
    console.log('showAppropriateUI called');
    console.log('currentPageType:', currentPageType);
    console.log('Current URL:', window.location.href);
    
    if (currentPageType === 'axiom' || currentPageType === 'bullx') {
        console.log('Showing username input UI');
        // Remove the showing-not-found class and add showing-username class
        moonMicOverlay.classList.remove('showing-not-found');
        moonMicOverlay.classList.add('showing-username');
        
        mainContent.innerHTML = `
            <div class="moonmic-username-section">
                <input type="text" id="moonmic-username" placeholder="Enter username" class="moonmic-username-input">
                <button class="moonmic-join-btn" id="moonmic-join-btn">
                    Join
                </button>
            </div>
        `;
        
        // Re-setup event listeners for the new elements
        setupJoinButtonListener();
    } else {
        console.log('Showing coin not found UI');
        // Add the showing-not-found class to increase height
        moonMicOverlay.classList.add('showing-not-found');
        
        mainContent.innerHTML = `
                    <div class="moonmic-not-found">
            <div class="moonmic-not-found-icon">✕</div>
            <div class="moonmic-not-found-text">Coin not found</div>
        </div>
        `;
    }
}

// Setup join button listener
function setupJoinButtonListener() {
    const joinBtn = document.getElementById('moonmic-join-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', async function() {
            const usernameInput = document.getElementById('moonmic-username');
            const username = usernameInput ? usernameInput.value.trim() : '';
            
            if (!username) {
                alert('Please enter a username');
                return;
            }
            
            // Change button to connecting state
            joinBtn.classList.add('connecting');
            joinBtn.innerHTML = `
                <div class="moonmic-spinner"></div>
                Connecting...
            `;
            joinBtn.disabled = true;
            
            console.log('Connecting to voice chat as:', username);
            
            try {
                // Generate room ID based on current page
                const roomId = generateRoomId();
                console.log('Generated room ID:', roomId);
                
                // Initialize voice chat - this will show the voice chat UI on success
                await initializeVoiceChat(username, roomId);
                
                console.log('Successfully connected to voice chat and UI shown');
                
            } catch (error) {
                console.error('Failed to connect to voice chat:', error);
                
                let errorMessage = 'Failed to connect to voice chat. ';
                if (TEST_MODE) {
                    errorMessage = '🧪 TEST MODE: This is a simulation. No real connection was made.';
                } else if (error.name === 'NotAllowedError') {
                    errorMessage += 'Please allow microphone access and try again.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage += 'No microphone found. Please connect a microphone and try again.';
                } else if (error.message.includes('timeout') || error.message.includes('server')) {
                    errorMessage += 'Voice chat server is not running. Please start the server with "npm start" and try again.';
                } else {
                    errorMessage += 'Please check your connection and try again.';
                }
                
                alert(errorMessage);
                
                // Reset button to original state
                joinBtn.classList.remove('connecting');
                joinBtn.innerHTML = 'Join';
                joinBtn.disabled = false;
            }
        });
    }
}

function generateRoomId() {
    // Generate a room ID based on the current page URL
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    if (hostname.includes('axiom.trade')) {
        // Extract token address from Axiom URL
        const match = url.match(/\/(meme|token)\/([a-zA-Z0-9]+)/);
        if (match) {
            return `axiom-${match[2]}`;
        }
    } else if (hostname.includes('neo.bullx.io')) {
        // Extract token address from BullX URL (uses address parameter)
        const addressMatch = url.match(/address=([a-zA-Z0-9]+)/);
        if (addressMatch) {
            return `bullx-${addressMatch[1]}`;
        }
    }
    
    // Fallback to URL hash
    return `room-${btoa(url).slice(0, 16)}`;
}

// Detect current page type
function detectPageType() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    console.log('detectPageType called');
    console.log('URL:', url);
    console.log('Hostname:', hostname);
    
    if (hostname.includes('axiom.trade')) {
        console.log('On Axiom domain');
        // Check if we're on a token/memecoin page
        if (url.includes('/meme/') || url.includes('/token/') || url.includes('0x') || url.includes('contract')) {
            currentPageType = 'axiom';
            console.log('Detected Axiom token/memecoin page');
        } else {
            currentPageType = null;
            console.log('On Axiom but not a token/memecoin page');
        }
    } else if (hostname.includes('neo.bullx.io')) {
        console.log('On BullX domain');
        // Check if we're on a token page (BullX uses /terminal with chainId and address parameters)
        if (url.includes('/terminal?chainId=') && url.includes('address=')) {
            currentPageType = 'bullx';
            console.log('Detected BullX token page');
        } else {
            currentPageType = null;
            console.log('On BullX but not a token page');
        }
    } else {
        currentPageType = null;
        console.log('Not on Axiom or BullX');
    }
    
    console.log('Final currentPageType:', currentPageType);
}

// Voice Chat Functions
async function initializeVoiceChat(username, roomId) {
    try {
        if (TEST_MODE) {
            // Test mode - simulate connection without real server
            console.log('🧪 TEST MODE: Simulating voice chat connection...');
            
            voiceChat.username = username;
            voiceChat.roomId = roomId;
            voiceChat.localUserId = 'test-user-' + Date.now();
            
            // Simulate some test participants with mute status
            voiceChat.participants.set('test-user-1', { id: 'test-user-1', username: 'Taxi', isMuted: true });
            voiceChat.participants.set('test-user-2', { id: 'test-user-2', username: 'harkor', isMuted: true });
            voiceChat.participants.set('test-user-3', { id: 'test-user-3', username: 'Cole', isMuted: true });
            voiceChat.participants.set('test-user-4', { id: 'test-user-4', username: 'Th', isMuted: false });
            voiceChat.participants.set('test-user-5', { id: 'test-user-5', username: 'haazu', isMuted: true });
            
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('🧪 TEST MODE: Connection simulated successfully');
            showVoiceChatUI();
            return true;
        } else {
            // Real mode - get user media and connect to server
            voiceChat.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            voiceChat.username = username;
            voiceChat.roomId = roomId;
            
            // Connect to signaling server
            await connectToSignalingServer();
            
            // Show voice chat UI after successful connection
            showVoiceChatUI();
            
            console.log('Voice chat initialized successfully');
            return true;
        }
    } catch (error) {
        console.error('Failed to initialize voice chat:', error);
        throw error;
    }
}

async function connectToSignalingServer() {
    return new Promise((resolve, reject) => {
        // Connect to server (local or production)
        const wsUrl = SERVER_URL;
        voiceChat.ws = new WebSocket(wsUrl);
        
        let connectionTimeout = setTimeout(() => {
            reject(new Error('Connection timeout - server may not be running'));
        }, 10000); // 10 second timeout
        
        voiceChat.ws.onopen = () => {
            console.log('Connected to signaling server');
            clearTimeout(connectionTimeout);
            
            // Join the room
            voiceChat.ws.send(JSON.stringify({
                type: 'join-room',
                roomId: voiceChat.roomId,
                username: voiceChat.username
            }));
            
            // Wait for room-joined confirmation before resolving
            const originalOnMessage = voiceChat.ws.onmessage;
            voiceChat.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'room-joined') {
                    console.log('Successfully joined room:', voiceChat.roomId);
                    resolve();
                }
                // Still call the original handler for other messages
                handleSignalingMessage(event);
            };
        };
        
        voiceChat.ws.onerror = (error) => {
            clearTimeout(connectionTimeout);
            console.error('WebSocket connection error:', error);
            reject(new Error('Failed to connect to voice chat server'));
        };
        
        voiceChat.ws.onclose = () => {
            clearTimeout(connectionTimeout);
            console.log('Disconnected from signaling server');
        };
    });
}

function handleSignalingMessage(event) {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
        case 'room-joined':
            voiceChat.localUserId = data.userId;
            data.participants.forEach(participant => {
                if (participant.id !== voiceChat.localUserId) {
                    voiceChat.participants.set(participant.id, participant);
                    createPeerConnection(participant.id);
                }
            });
            updateParticipantsList();
            break;
            
        case 'user-joined':
            voiceChat.participants.set(data.userId, { id: data.userId, username: data.username });
            createPeerConnection(data.userId);
            updateParticipantsList();
            break;
            
        case 'user-left':
            voiceChat.participants.delete(data.userId);
            if (voiceChat.peerConnections.has(data.userId)) {
                voiceChat.peerConnections.get(data.userId).close();
                voiceChat.peerConnections.delete(data.userId);
            }
            updateParticipantsList();
            break;
            
        case 'offer':
            handleOffer(data.fromUserId, data.offer);
            break;
            
        case 'answer':
            handleAnswer(data.fromUserId, data.answer);
            break;
            
        case 'ice-candidate':
            handleIceCandidate(data.fromUserId, data.candidate);
            break;
            
        case 'user-mute-toggle':
            updateUserMuteStatus(data.userId, data.isMuted);
            break;
    }
}

async function createPeerConnection(remoteUserId) {
    const pc = new RTCPeerConnection(rtcConfig);
    voiceChat.peerConnections.set(remoteUserId, pc);
    
    // Add local stream
    voiceChat.localStream.getTracks().forEach(track => {
        pc.addTrack(track, voiceChat.localStream);
    });
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            voiceChat.ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate
            }));
        }
    };
    
    // Handle remote stream
    pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        
        // Create audio element for remote audio
        const audioElement = document.createElement('audio');
        audioElement.id = `audio-${remoteUserId}`;
        audioElement.autoplay = true;
        audioElement.controls = false;
        audioElement.style.display = 'none';
        
        // Set initial volume from user preferences
        const userVolume = voiceChat.userVolumes.get(remoteUserId) || 1.0;
        const isUserMuted = voiceChat.userMutes.get(remoteUserId) || false;
        audioElement.volume = userVolume;
        audioElement.muted = isUserMuted;
        
        // Set the remote stream as the audio source
        audioElement.srcObject = remoteStream;
        
        // Add to page (hidden)
        document.body.appendChild(audioElement);
        
        console.log('Added remote audio for user:', remoteUserId);
    };
    
    // Create and send offer
    try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        voiceChat.ws.send(JSON.stringify({
            type: 'offer',
            targetUserId: remoteUserId,
            offer: offer
        }));
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

async function handleOffer(fromUserId, offer) {
    const pc = new RTCPeerConnection(rtcConfig);
    voiceChat.peerConnections.set(fromUserId, pc);
    
    // Add local stream
    voiceChat.localStream.getTracks().forEach(track => {
        pc.addTrack(track, voiceChat.localStream);
    });
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            voiceChat.ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate
            }));
        }
    };
    
    // Handle remote stream
    pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        
        // Create audio element for remote audio
        const audioElement = document.createElement('audio');
        audioElement.id = `audio-${fromUserId}`;
        audioElement.autoplay = true;
        audioElement.controls = false;
        audioElement.style.display = 'none';
        
        // Set initial volume from user preferences
        const userVolume = voiceChat.userVolumes.get(fromUserId) || 1.0;
        const isUserMuted = voiceChat.userMutes.get(fromUserId) || false;
        audioElement.volume = userVolume;
        audioElement.muted = isUserMuted;
        
        // Set the remote stream as the audio source
        audioElement.srcObject = remoteStream;
        
        // Add to page (hidden)
        document.body.appendChild(audioElement);
        
        console.log('Added remote audio for user:', fromUserId);
    };
    
    // Set remote description and create answer
    try {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        voiceChat.ws.send(JSON.stringify({
            type: 'answer',
            fromUserId: fromUserId,
            answer: answer
        }));
    } catch (error) {
        console.error('Error handling offer:', error);
    }
}

async function handleAnswer(fromUserId, answer) {
    const pc = voiceChat.peerConnections.get(fromUserId);
    if (pc) {
        try {
            await pc.setRemoteDescription(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }
}

async function handleIceCandidate(fromUserId, candidate) {
    const pc = voiceChat.peerConnections.get(fromUserId);
    if (pc) {
        try {
            await pc.addIceCandidate(candidate);
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }
}

function toggleMute() {
    voiceChat.isMuted = !voiceChat.isMuted;
    
    if (!TEST_MODE && voiceChat.localStream) {
        // Mute/unmute local audio tracks (real mode only)
        voiceChat.localStream.getAudioTracks().forEach(track => {
            track.enabled = !voiceChat.isMuted;
        });
    }
    
    // Update UI
    const muteBtn = document.getElementById('moonmic-mute-btn');
    if (muteBtn) {
        if (voiceChat.isMuted) {
            muteBtn.classList.add('muted');
            muteBtn.innerHTML = '🔇 Unmute';
        } else {
            muteBtn.classList.remove('muted');
            muteBtn.innerHTML = '🎤 Mute';
        }
    }
    
    // Notify other users (real mode only)
    if (!TEST_MODE && voiceChat.ws) {
        voiceChat.ws.send(JSON.stringify({
            type: 'mute-toggle',
            isMuted: voiceChat.isMuted
        }));
    }
    
    // Update participants list to show mute status
    updateParticipantsList();
    
    if (TEST_MODE) {
        console.log('🧪 TEST MODE: Mute toggled to:', voiceChat.isMuted);
    }
}

function leaveVoiceChat() {
    if (!TEST_MODE) {
        // Close all peer connections (real mode only)
        voiceChat.peerConnections.forEach(pc => pc.close());
        voiceChat.peerConnections.clear();
        
        // Stop local stream (real mode only)
        if (voiceChat.localStream) {
            voiceChat.localStream.getTracks().forEach(track => track.stop());
            voiceChat.localStream = null;
        }
        
        // Remove all remote audio elements
        voiceChat.participants.forEach(participant => {
            const audioElement = document.getElementById(`audio-${participant.id}`);
            if (audioElement) {
                audioElement.remove();
            }
        });
        
        // Close WebSocket connection (real mode only)
        if (voiceChat.ws) {
            voiceChat.ws.send(JSON.stringify({ type: 'leave-room' }));
            voiceChat.ws.close();
            voiceChat.ws = null;
        }
    }
    
    if (TEST_MODE) {
        console.log('🧪 TEST MODE: Leaving voice chat');
    }
    
    // Reset voice chat state
    voiceChat.localUserId = null;
    voiceChat.username = null;
    voiceChat.roomId = null;
    voiceChat.isMuted = false;
    voiceChat.participants.clear();
    
    // Reset to initial UI
    resetToInitialUI();
}

function showVoiceChatUI() {
    const mainContent = moonMicOverlay.querySelector('.moonmic-main-content');
    
    // Add voice chat class for height
    moonMicOverlay.classList.remove('showing-username');
    moonMicOverlay.classList.add('showing-voice-chat');
    
    mainContent.innerHTML = `
        <div class="moonmic-voice-chat">
            <div class="moonmic-voice-header">
                <div class="moonmic-voice-title">
                    
                </div>
                <div class="moonmic-voice-controls">
                    <button class="moonmic-mute-btn" id="moonmic-mute-btn">
                        🎤 Mute
                    </button>
                    <button class="moonmic-leave-btn" id="moonmic-leave-btn">
                        Leave
                    </button>
                </div>
            </div>
            <div class="moonmic-users-section">
                <div class="moonmic-users-header">
                    👥 Users in Channel (${voiceChat.participants.size + 1})
                </div>
                <div class="moonmic-user-list" id="moonmic-user-list">
                    <!-- Users will be populated here -->
                </div>
            </div>
        </div>
    `;
    
    // Setup voice chat event listeners
    setupVoiceChatListeners();
    updateParticipantsList();
}

function setupVoiceChatListeners() {
    const muteBtn = document.getElementById('moonmic-mute-btn');
    const leaveBtn = document.getElementById('moonmic-leave-btn');
    
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }
    
    if (leaveBtn) {
        leaveBtn.addEventListener('click', leaveVoiceChat);
    }
}

function updateParticipantsList() {
    const userList = document.getElementById('moonmic-user-list');
    if (!userList) return;
    
    let html = '';
    
    // Add current user first
    html += `
        <div class="moonmic-user-item you">
            <div class="moonmic-user-info">
                <span>${voiceChat.username} (You)</span>
            </div>
            <div class="moonmic-user-status">
                <span class="moonmic-mic-icon">${voiceChat.isMuted ? '🔇' : '🎤'}</span>
            </div>
        </div>
    `;
    
    // Add other participants
    voiceChat.participants.forEach(participant => {
        const userId = participant.id;
        const isUserMuted = voiceChat.userMutes.get(userId) || false;
        const userVolume = voiceChat.userVolumes.get(userId) || 1.0;
        
        html += `
            <div class="moonmic-user-item" data-user-id="${userId}">
                <div class="moonmic-user-info">
                    <span>${participant.username}</span>
                </div>
                <div class="moonmic-user-controls">
                    <button class="moonmic-user-mute-btn" data-user-id="${userId}" title="Mute/Unmute user">
                        <span class="moonmic-speaker-icon">${isUserMuted ? '🔇' : '🔊'}</span>
                    </button>
                    <div class="moonmic-volume-control">
                        <input type="range" 
                               class="moonmic-volume-slider" 
                               data-user-id="${userId}"
                               min="0" 
                               max="100" 
                               value="${Math.round(userVolume * 100)}"
                               title="Adjust volume">
                    </div>
                </div>
                <div class="moonmic-user-status">
                    <span class="moonmic-mic-icon">${participant.isMuted ? '🔇' : '🎤'}</span>
                </div>
            </div>
        `;
    });
    
    userList.innerHTML = html;
    
    // Setup volume and mute controls
    setupUserControls();
}

function setupUserControls() {
    // Setup volume sliders
    const volumeSliders = document.querySelectorAll('.moonmic-volume-slider');
    volumeSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const userId = this.getAttribute('data-user-id');
            const volume = this.value / 100; // Convert 0-100 to 0.0-1.0
            setUserVolume(userId, volume);
        });
    });
    
    // Setup mute buttons
    const muteButtons = document.querySelectorAll('.moonmic-user-mute-btn');
    muteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            toggleUserMute(userId);
        });
    });
}

function setUserVolume(userId, volume) {
    voiceChat.userVolumes.set(userId, volume);
    
    // Find the audio element for this user and adjust volume
    const audioElement = document.getElementById(`audio-${userId}`);
    if (audioElement) {
        audioElement.volume = volume;
    }
    
    // Update the volume slider value
    const volumeSlider = document.querySelector(`.moonmic-volume-slider[data-user-id="${userId}"]`);
    if (volumeSlider) {
        volumeSlider.value = Math.round(volume * 100);
    }
}

function toggleUserMute(userId) {
    const isCurrentlyMuted = voiceChat.userMutes.get(userId) || false;
    const newMuteState = !isCurrentlyMuted;
    
    voiceChat.userMutes.set(userId, newMuteState);
    
    // Find the audio element for this user and mute/unmute
    const audioElement = document.getElementById(`audio-${userId}`);
    if (audioElement) {
        audioElement.muted = newMuteState;
    }
    
    // Update the mute button icon
    const muteButton = document.querySelector(`.moonmic-user-mute-btn[data-user-id="${userId}"]`);
    if (muteButton) {
        const speakerIcon = muteButton.querySelector('.moonmic-speaker-icon');
        if (speakerIcon) {
            speakerIcon.textContent = newMuteState ? '🔇' : '🔊';
        }
    }
}

function updateUserMuteStatus(userId, isMuted) {
    // Update the mute status in the UI
    updateParticipantsList();
}

// Initialize overlay as hidden
document.addEventListener('DOMContentLoaded', function() {
    detectPageType();
    // Overlay will be shown when extension icon is clicked
}); 