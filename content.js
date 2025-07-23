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
const TEST_MODE = false; // Set to false for production with Railway server

// Server URLs - update these with your deployed server
const LOCAL_SERVER_URL = 'ws://localhost:3000';
const PRODUCTION_SERVER_URL = 'wss://moonmic-production.up.railway.app'; // Railway deployment

// Choose which server to use (change this for testing vs production)
const SERVER_URL = PRODUCTION_SERVER_URL; // Change to LOCAL_SERVER_URL for local testing

// WebRTC Configuration
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
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
                <input type="text" id="moonmic-username" placeholder="Enter username" class="moonmic-username-input" maxlength="8">
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
            
            if (username.length > 8) {
                alert('Username must be 8 characters or less');
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
            console.log('Getting user media...');
            voiceChat.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Local stream obtained:', voiceChat.localStream);
            console.log('Audio tracks:', voiceChat.localStream.getAudioTracks().length);
            voiceChat.localStream.getAudioTracks().forEach(track => {
                console.log('Audio track:', track.id, 'enabled:', track.enabled, 'muted:', track.muted);
            });
            
            // Set up local voice activity detection
            setupVoiceActivityDetection('local', voiceChat.localStream);
            
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
        console.log('🔍 DEBUG: Attempting WebSocket connection to:', wsUrl);
        console.log('🔍 DEBUG: SERVER_URL constant value:', SERVER_URL);
        voiceChat.ws = new WebSocket(wsUrl);
        
        let connectionTimeout = setTimeout(() => {
            reject(new Error('Connection timeout - server may not be running'));
        }, 10000); // 10 second timeout
        
        voiceChat.ws.onopen = () => {
            console.log('✅ Connected to signaling server at:', wsUrl);
            clearTimeout(connectionTimeout);
            
            // Join the room
            const joinMessage = {
                type: 'join-room',
                roomId: voiceChat.roomId,
                username: voiceChat.username
            };
            console.log('📤 Sending join-room message:', joinMessage);
            try {
                voiceChat.ws.send(JSON.stringify(joinMessage));
                console.log('✅ Join-room message sent successfully');
            } catch (error) {
                console.error('❌ Failed to send join-room message:', error);
                reject(new Error('Failed to send join message'));
                return;
            }
            
            // Wait for room-joined confirmation before resolving
            let roomJoined = false;
            voiceChat.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('🔍 DEBUG: Original handler received:', data.type, data);
                    
                    if (data.type === 'room-joined' && !roomJoined) {
                        console.log('🎉 Successfully joined room:', voiceChat.roomId);
                        roomJoined = true;
                        resolve();
                    }
                    // Always call the handler for all messages
                    handleSignalingMessage(event);
                } catch (error) {
                    console.error('❌ Failed to parse message in original handler:', error);
                }
            };
        };
        
        voiceChat.ws.onerror = (error) => {
            clearTimeout(connectionTimeout);
            console.error('❌ WebSocket connection error:', error);
            reject(new Error('Failed to connect to voice chat server'));
        };
        
        voiceChat.ws.onclose = () => {
            clearTimeout(connectionTimeout);
            console.log('Disconnected from signaling server');
        };
    });
}

function handleSignalingMessage(event) {
    let data;
    try {
        data = JSON.parse(event.data);
        console.log('📨 Received signaling message:', data.type, data);
    } catch (error) {
        console.error('❌ Failed to parse signaling message:', error, 'Raw message:', event.data);
        return;
    }
    
    if (!data || typeof data.type !== 'string') {
        console.error('Invalid message format:', data);
        return;
    }
    
    switch (data.type) {
        case 'room-joined':
            console.log('🎉 Room joined successfully. Local user ID:', data.userId);
            console.log('📋 Existing participants:', data.participants);
            console.log('🏠 Room ID:', voiceChat.roomId);
            voiceChat.localUserId = data.userId;
            console.log('✅ Set local user ID to:', voiceChat.localUserId);
            
            // Clear existing participants and add new ones
            voiceChat.participants.clear();
            
            data.participants.forEach(participant => {
                console.log('🔍 Processing participant:', participant.id, participant.username);
                if (participant.id !== voiceChat.localUserId) {
                    console.log('🔗 Creating peer connection for existing participant:', participant.id, participant.username);
                    voiceChat.participants.set(participant.id, participant);
                    console.log('✅ Added participant to list:', participant.id, participant.username);
                    createPeerConnection(participant.id);
                } else {
                    console.log('🔗 Skipping peer connection to self in room-joined:', participant.id);
                }
            });
            console.log('📊 Final participants after room-joined:', Array.from(voiceChat.participants.values()));
            console.log('👥 Total participants count:', voiceChat.participants.size + 1); // +1 for self
            
            // Small delay to ensure UI is ready
            setTimeout(() => {
                updateParticipantsList();
            }, 100);
            break;
            
        case 'user-joined':
            console.log('👤 User joined:', data.userId, data.username);
            console.log('🏠 Room ID:', voiceChat.roomId);
            console.log('🆔 Local user ID:', voiceChat.localUserId);
            console.log('📋 Current participants before adding:', Array.from(voiceChat.participants.values()));
            
            // Don't create peer connection to ourselves
            if (data.userId === voiceChat.localUserId) {
                console.log('❌ Skipping peer connection to self:', data.userId);
            } else {
                voiceChat.participants.set(data.userId, { id: data.userId, username: data.username });
                console.log('✅ Added participant:', data.userId, data.username);
                console.log('📋 Current participants after adding:', Array.from(voiceChat.participants.values()));
                console.log('👥 Total participants count:', voiceChat.participants.size + 1); // +1 for self
                createPeerConnection(data.userId);
            }
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
            
        case 'pong':
            console.log('✅ Received pong from server:', data);
            break;
            
        case 'echo-response':
            console.log('✅ Received echo response from server:', data);
            break;
    }
}

async function createPeerConnection(remoteUserId) {
    console.log('Creating peer connection for user:', remoteUserId);
    const pc = new RTCPeerConnection(rtcConfig);
    voiceChat.peerConnections.set(remoteUserId, pc);
    
    // Add local stream
    voiceChat.localStream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind, track.id);
        pc.addTrack(track, voiceChat.localStream);
    });
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
        console.log('🔗 Peer connection state changed for user:', remoteUserId, 'State:', pc.connectionState);
        if (pc.connectionState === 'connected') {
            console.log('✅ WebRTC connection established for user:', remoteUserId);
        } else if (pc.connectionState === 'failed') {
            console.error('❌ WebRTC connection failed for user:', remoteUserId);
        }
    };
    
    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state changed for user:', remoteUserId, 'State:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected') {
            console.log('✅ ICE connection established for user:', remoteUserId);
        } else if (pc.iceConnectionState === 'failed') {
            console.error('❌ ICE connection failed for user:', remoteUserId);
        }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('Sending ICE candidate for user:', remoteUserId);
            try {
                voiceChat.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    targetUserId: remoteUserId,
                    candidate: event.candidate
                }));
            } catch (error) {
                console.error('Failed to send ICE candidate for user:', remoteUserId, error);
            }
        }
    };
    
    // Handle remote stream
    pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        console.log('🎵 Received remote stream for user:', remoteUserId, 'tracks:', remoteStream.getTracks().length);
        console.log('🎵 Remote stream details:', {
            id: remoteStream.id,
            active: remoteStream.active,
            tracks: remoteStream.getTracks().map(t => ({ kind: t.kind, id: t.id, enabled: t.enabled }))
        });
        
        // Create audio element for remote audio
        const audioElement = document.createElement('audio');
        audioElement.id = `audio-${remoteUserId}`;
        audioElement.autoplay = true;
        audioElement.controls = false;
        audioElement.style.display = 'none';
        audioElement.playsInline = true;
        
        // Set initial volume from user preferences
        const userVolume = voiceChat.userVolumes.get(remoteUserId) || 1.0;
        const isUserMuted = voiceChat.userMutes.get(remoteUserId) || false;
        audioElement.volume = userVolume;
        audioElement.muted = isUserMuted;
        
        // Set the remote stream as the audio source
        audioElement.srcObject = remoteStream;
        
        // Add to page (hidden)
        document.body.appendChild(audioElement);
        
        // Ensure audio plays
        audioElement.play().then(() => {
            console.log('🎵 Audio started playing for user:', remoteUserId);
            console.log('🎵 Audio element state:', {
                volume: audioElement.volume,
                muted: audioElement.muted,
                paused: audioElement.paused,
                readyState: audioElement.readyState,
                currentTime: audioElement.currentTime
            });
        }).catch(error => {
            console.error('❌ Failed to play audio for user:', remoteUserId, error);
            console.error('❌ Audio element state when failed:', {
                volume: audioElement.volume,
                muted: audioElement.muted,
                paused: audioElement.paused,
                readyState: audioElement.readyState
            });
        });
        
        // Add event listeners for debugging
        audioElement.addEventListener('play', () => {
            console.log('Audio play event fired for user:', remoteUserId);
        });
        
        audioElement.addEventListener('error', (e) => {
            console.error('Audio error for user:', remoteUserId, e);
        });
        
        audioElement.addEventListener('loadedmetadata', () => {
            console.log('Audio metadata loaded for user:', remoteUserId, 'duration:', audioElement.duration);
        });
        
        console.log('Added remote audio for user:', remoteUserId, 'audio element:', audioElement);
    };
    
    // Create and send offer
    try {
        console.log('Creating offer for user:', remoteUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        try {
            voiceChat.ws.send(JSON.stringify({
                type: 'offer',
                targetUserId: remoteUserId,
                offer: offer
            }));
            console.log('Offer sent successfully for user:', remoteUserId);
        } catch (error) {
            console.error('Failed to send offer for user:', remoteUserId, error);
        }
    } catch (error) {
        console.error('Error creating offer for user:', remoteUserId, error);
    }
}

async function handleOffer(fromUserId, offer) {
    // Don't process offers from ourselves
    if (fromUserId === voiceChat.localUserId) {
        console.log('Skipping offer from self:', fromUserId);
        return;
    }
    
    const pc = new RTCPeerConnection(rtcConfig);
    voiceChat.peerConnections.set(fromUserId, pc);
    
    // Add local stream
    voiceChat.localStream.getTracks().forEach(track => {
        pc.addTrack(track, voiceChat.localStream);
    });
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            try {
                voiceChat.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    targetUserId: fromUserId,
                    candidate: event.candidate
                }));
            } catch (error) {
                console.error('Failed to send ICE candidate in handleOffer for user:', fromUserId, error);
            }
        }
    };
    
    // Handle remote stream
    pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        console.log('Received remote stream for user:', fromUserId, 'tracks:', remoteStream.getTracks().length);
        
        // Create audio element for remote audio
        const audioElement = document.createElement('audio');
        audioElement.id = `audio-${fromUserId}`;
        audioElement.autoplay = true;
        audioElement.controls = false;
        audioElement.style.display = 'none';
        audioElement.playsInline = true;
        
        // Set initial volume from user preferences
        const userVolume = voiceChat.userVolumes.get(fromUserId) || 1.0;
        const isUserMuted = voiceChat.userMutes.get(fromUserId) || false;
        audioElement.volume = userVolume;
        audioElement.muted = isUserMuted;
        
        // Set the remote stream as the audio source
        audioElement.srcObject = remoteStream;
        
        // Add to page (hidden)
        document.body.appendChild(audioElement);
        
        // Set up voice activity detection
        setupVoiceActivityDetection(fromUserId, remoteStream);
        
        // Ensure audio plays
        audioElement.play().then(() => {
            console.log('Audio started playing for user:', fromUserId);
        }).catch(error => {
            console.error('Failed to play audio for user:', fromUserId, error);
        });
        
        // Add event listeners for debugging
        audioElement.addEventListener('play', () => {
            console.log('Audio play event fired for user:', fromUserId);
        });
        
        audioElement.addEventListener('error', (e) => {
            console.error('Audio error for user:', fromUserId, e);
        });
        
        audioElement.addEventListener('loadedmetadata', () => {
            console.log('Audio metadata loaded for user:', fromUserId, 'duration:', audioElement.duration);
        });
        
        console.log('Added remote audio for user:', fromUserId, 'audio element:', audioElement);
    };
    
    // Set remote description and create answer
    try {
        console.log('Handling offer from user:', fromUserId);
        await pc.setRemoteDescription(offer);
        console.log('Remote description set for user:', fromUserId);
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('Answer created and set for user:', fromUserId);
        
        try {
            voiceChat.ws.send(JSON.stringify({
                type: 'answer',
                fromUserId: fromUserId,
                answer: answer
            }));
        } catch (error) {
            console.error('Failed to send answer for user:', fromUserId, error);
        }
        console.log('Answer sent to user:', fromUserId);
    } catch (error) {
        console.error('Error handling offer from user:', fromUserId, error);
    }
}

async function handleAnswer(fromUserId, answer) {
    console.log('Handling answer from user:', fromUserId);
    
    // Don't process answers from ourselves
    if (fromUserId === voiceChat.localUserId) {
        console.log('Skipping answer from self:', fromUserId);
        return;
    }
    
    const pc = voiceChat.peerConnections.get(fromUserId);
    if (pc) {
        try {
            // Check if we're in the right state to set remote description
            if (pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(answer);
                console.log('Remote description set from answer for user:', fromUserId);
            } else {
                console.warn('Cannot set remote description - wrong signaling state:', pc.signalingState, 'for user:', fromUserId);
            }
        } catch (error) {
            console.error('Error handling answer from user:', fromUserId, error);
        }
    } else {
        console.error('No peer connection found for user:', fromUserId);
    }
}

async function handleIceCandidate(fromUserId, candidate) {
    console.log('Handling ICE candidate from user:', fromUserId);
    
    // Don't process our own ICE candidates
    if (fromUserId === voiceChat.localUserId) {
        console.log('Skipping ICE candidate from self:', fromUserId);
        return;
    }
    
    const pc = voiceChat.peerConnections.get(fromUserId);
    if (pc) {
        try {
            await pc.addIceCandidate(candidate);
            console.log('ICE candidate added for user:', fromUserId);
        } catch (error) {
            console.error('Error adding ICE candidate for user:', fromUserId, error);
        }
    } else {
        console.error('No peer connection found for ICE candidate from user:', fromUserId);
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
        try {
            voiceChat.ws.send(JSON.stringify({
                type: 'mute-toggle',
                isMuted: voiceChat.isMuted
            }));
        } catch (error) {
            console.error('Failed to send mute-toggle message:', error);
        }
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
            try {
                voiceChat.ws.send(JSON.stringify({ type: 'leave-room' }));
            } catch (error) {
                console.error('Failed to send leave-room message:', error);
            }
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
            <div class="moonmic-voice-panel">
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
            <div style="padding: 8px; text-align: center;">
                <button id="debug-btn" style="background: #333; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                    🔍 Debug
                </button>
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
    const debugBtn = document.getElementById('debug-btn');
    
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }
    
    if (leaveBtn) {
        leaveBtn.addEventListener('click', leaveVoiceChat);
    }
    
    if (debugBtn) {
        console.log('Debug button found, adding event listener');
        debugBtn.addEventListener('click', () => {
            // Create debug info
            const debugInfo = {
                username: voiceChat.username,
                roomId: voiceChat.roomId,
                localUserId: voiceChat.localUserId,
                isMuted: voiceChat.isMuted,
                wsConnected: !!voiceChat.ws,
                participantsCount: voiceChat.participants.size,
                peerConnectionsCount: voiceChat.peerConnections.size,
                participants: Array.from(voiceChat.participants.values()),
                peerConnections: Array.from(voiceChat.peerConnections.keys())
            };
            
            // Test WebSocket connection
            let wsTest = '❌ No WebSocket connection';
            if (voiceChat.ws) {
                wsTest = `✅ WebSocket connected (State: ${voiceChat.ws.readyState})`;
                wsTest += `\nURL: ${voiceChat.ws.url}`;
                
                // Send a test message
                try {
                    voiceChat.ws.send(JSON.stringify({
                        type: 'ping',
                        timestamp: Date.now()
                    }));
                    wsTest += '\n✅ Ping sent successfully';
                } catch (error) {
                    wsTest += `\n❌ Ping failed: ${error.message}`;
                }
                
                // Test if we can send a join-room message
                try {
                    const joinMessage = {
                        type: 'join-room',
                        roomId: voiceChat.roomId,
                        username: voiceChat.username
                    };
                    voiceChat.ws.send(JSON.stringify(joinMessage));
                    wsTest += '\n✅ Join-room message sent';
                    console.log('🔍 DEBUG: Sent join-room message:', joinMessage);
                } catch (error) {
                    wsTest += `\n❌ Join-room failed: ${error.message}`;
                }
                
                // Test echo functionality
                try {
                    const echoMessage = {
                        type: 'echo',
                        message: 'Hello from client!'
                    };
                    voiceChat.ws.send(JSON.stringify(echoMessage));
                    wsTest += '\n✅ Echo message sent';
                    console.log('🔍 DEBUG: Sent echo message:', echoMessage);
                } catch (error) {
                    wsTest += `\n❌ Echo failed: ${error.message}`;
                }
            }
            
            // Create debug popup
            const debugPopup = document.createElement('div');
            debugPopup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #1a1a1a;
                color: white;
                padding: 20px;
                border-radius: 8px;
                border: 2px solid #333;
                z-index: 1000000;
                max-width: 500px;
                max-height: 400px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.8);
            `;
            
            debugPopup.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #00ff00;">🔍 Debug Info</h3>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✕</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Username:</strong> ${debugInfo.username || 'Not set'}<br>
                    <strong>Room ID:</strong> ${debugInfo.roomId || 'Not set'}<br>
                    <strong>Local User ID:</strong> ${debugInfo.localUserId || 'Not set'}<br>
                    <strong>Muted:</strong> ${debugInfo.isMuted ? 'Yes' : 'No'}<br>
                    <strong>WebSocket:</strong> ${debugInfo.wsConnected ? 'Connected' : 'Not connected'}<br>
                    <strong>Participants:</strong> ${debugInfo.participantsCount}<br>
                    <strong>Peer Connections:</strong> ${debugInfo.peerConnectionsCount}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>WebSocket Test:</strong><br>
                    <pre style="background: #333; padding: 8px; border-radius: 4px; margin: 5px 0; white-space: pre-wrap;">${wsTest}</pre>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Participants:</strong><br>
                    <pre style="background: #333; padding: 8px; border-radius: 4px; margin: 5px 0; white-space: pre-wrap;">${JSON.stringify(debugInfo.participants, null, 2)}</pre>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Peer Connections:</strong><br>
                    <pre style="background: #333; padding: 8px; border-radius: 4px; margin: 5px 0; white-space: pre-wrap;">${JSON.stringify(debugInfo.peerConnections, null, 2)}</pre>
                </div>
                <button onclick="this.parentElement.remove()" style="background: #444; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">Close</button>
            `;
            
            document.body.appendChild(debugPopup);
            
            // Force update participants list
            updateParticipantsList();
            
            // Add debug logging to existing message handler
            if (voiceChat.ws && voiceChat.ws.onmessage) {
                const originalOnMessage = voiceChat.ws.onmessage;
                voiceChat.ws.onmessage = (event) => {
                    console.log('🔍 DEBUG: Raw message received:', event.data);
                    // Parse and log the message type
                    try {
                        const data = JSON.parse(event.data);
                        console.log('🔍 DEBUG: Message type:', data.type);
                        console.log('🔍 DEBUG: Full message data:', data);
                    } catch (error) {
                        console.log('🔍 DEBUG: Failed to parse message:', error);
                    }
                    // Call the original handler
                    originalOnMessage(event);
                };
            } else {
                console.log('🔍 DEBUG: No WebSocket or message handler found');
            }
        });
    } else {
        console.error('Debug button not found!');
    }
}

function updateParticipantsList() {
    const userList = document.getElementById('moonmic-user-list');
    if (!userList) {
        console.error('❌ User list element not found - will retry in 100ms');
        // Retry after a short delay
        setTimeout(() => {
            updateParticipantsList();
        }, 100);
        return;
    }
    
    console.log('🔄 Updating participants list');
    console.log('📋 Current participants:', Array.from(voiceChat.participants.values()));
    console.log('👤 Local user:', voiceChat.username, 'Local user ID:', voiceChat.localUserId);
    console.log('👥 Total count (including self):', voiceChat.participants.size + 1);
    
    let html = '';
    
    // Add current user first
    html += `
        <div class="moonmic-user-item you">
            <div class="moonmic-user-info moonmic-username-clickable">
                <span>${voiceChat.username} (You)</span>
            </div>
            <div class="moonmic-user-status">
                <div class="voice-meter-container">
                    <div class="voice-meter" data-user-id="local" style="width: 0%; background-color: #9E9E9E;"></div>
                </div>
                <span class="moonmic-mic-icon">${voiceChat.isMuted ? '🔇' : '🎤'}</span>
            </div>
        </div>
    `;
    
    // Add other participants
    voiceChat.participants.forEach(participant => {
        console.log('Adding participant to UI:', participant);
        const userId = participant.id;
        const isUserMuted = voiceChat.userMutes.get(userId) || false;
        const userVolume = voiceChat.userVolumes.get(userId) || 1.0;
        
        html += `
            <div class="moonmic-user-item" data-user-id="${userId}">
                <div class="moonmic-user-info moonmic-username-clickable" data-user-id="${userId}">
                    <span>${participant.username}</span>
                </div>
                <div class="moonmic-user-controls" style="display: none;">
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
                    <div class="voice-meter-container">
                        <div class="voice-meter" data-user-id="${userId}" style="width: 0%; background-color: #9E9E9E;"></div>
                    </div>
                    <span class="moonmic-mic-icon">${participant.isMuted ? '🔇' : '🎤'}</span>
                </div>
            </div>
        `;
    });
    
    userList.innerHTML = html;
    console.log('Updated user list HTML:', userList.innerHTML);
    
    // Setup volume and mute controls
    setupUserControls();
}

function setupUserControls() {
    // Setup clickable usernames to show/hide volume controls
    const clickableUsernames = document.querySelectorAll('.moonmic-username-clickable');
    clickableUsernames.forEach(username => {
        username.addEventListener('click', function(e) {
            // Prevent event bubbling to avoid conflicts
            e.stopPropagation();
            const userId = this.getAttribute('data-user-id');
            toggleVolumeControls(userId);
        });
    });
    
    // Setup volume sliders with auto-hide reset
    const volumeSliders = document.querySelectorAll('.moonmic-volume-slider');
    volumeSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const userId = this.getAttribute('data-user-id');
            const volume = this.value / 100; // Convert 0-100 to 0.0-1.0
            setUserVolume(userId, volume);
            
            // Reset auto-hide timeout when user interacts with slider
            resetVolumeControlsTimeout(userId);
        });
        
        // Also reset timeout on mousedown/touchstart for better responsiveness
        slider.addEventListener('mousedown', function() {
            const userId = this.getAttribute('data-user-id');
            resetVolumeControlsTimeout(userId);
        });
        
        slider.addEventListener('touchstart', function() {
            const userId = this.getAttribute('data-user-id');
            resetVolumeControlsTimeout(userId);
        });
    });
    
    // Setup mute buttons with auto-hide reset
    const muteButtons = document.querySelectorAll('.moonmic-user-mute-btn');
    muteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            toggleUserMute(userId);
            
            // Reset auto-hide timeout when user clicks mute button
            resetVolumeControlsTimeout(userId);
        });
    });
}

function toggleVolumeControls(userId) {
    const userItem = document.querySelector(`.moonmic-user-item[data-user-id="${userId}"]`);
    if (userItem) {
        const controls = userItem.querySelector('.moonmic-user-controls');
        if (controls) {
            // Check if controls are currently visible
            const isVisible = controls.style.display === 'flex';
            
            if (isVisible) {
                // If visible, hide them
                hideVolumeControls(userId);
            } else {
                // If hidden, show them with auto-hide
                showVolumeControls(userId);
            }
        }
    }
}

function showVolumeControls(userId) {
    // Hide all other volume controls first
    const allControls = document.querySelectorAll('.moonmic-user-controls');
    allControls.forEach(control => {
        control.style.display = 'none';
        control.style.opacity = '1';
        // Clear any existing timeout
        if (control.autoHideTimeout) {
            clearTimeout(control.autoHideTimeout);
            control.autoHideTimeout = null;
        }
    });
    
    // Show controls for this specific user
    const userItem = document.querySelector(`.moonmic-user-item[data-user-id="${userId}"]`);
    if (userItem) {
        const controls = userItem.querySelector('.moonmic-user-controls');
        if (controls) {
            controls.style.display = 'flex';
            controls.style.opacity = '1';
            
            // Set up auto-hide timeout (3.8 seconds)
            if (controls.autoHideTimeout) {
                clearTimeout(controls.autoHideTimeout);
            }
            
            controls.autoHideTimeout = setTimeout(() => {
                // Fade out effect
                controls.style.transition = 'opacity 0.3s ease-out';
                controls.style.opacity = '0';
                
                // Hide after fade completes
                setTimeout(() => {
                    controls.style.display = 'none';
                    controls.style.opacity = '1';
                    controls.autoHideTimeout = null;
                }, 300);
            }, 3800);
        }
    }
}

function hideVolumeControls(userId) {
    const userItem = document.querySelector(`.moonmic-user-item[data-user-id="${userId}"]`);
    if (userItem) {
        const controls = userItem.querySelector('.moonmic-user-controls');
        if (controls) {
            controls.style.display = 'none';
            // Clear any existing timeout
            if (controls.autoHideTimeout) {
                clearTimeout(controls.autoHideTimeout);
                controls.autoHideTimeout = null;
            }
        }
    }
}

function resetVolumeControlsTimeout(userId) {
    const userItem = document.querySelector(`.moonmic-user-item[data-user-id="${userId}"]`);
    if (userItem) {
        const controls = userItem.querySelector('.moonmic-user-controls');
        if (controls && controls.style.display === 'flex') {
            // Clear existing timeout
            if (controls.autoHideTimeout) {
                clearTimeout(controls.autoHideTimeout);
            }
            
            // Reset to full opacity
            controls.style.opacity = '1';
            controls.style.transition = 'opacity 0.3s ease-out';
            
            // Set new timeout (3.8 seconds)
            controls.autoHideTimeout = setTimeout(() => {
                // Fade out effect
                controls.style.opacity = '0';
                
                // Hide after fade completes
                setTimeout(() => {
                    controls.style.display = 'none';
                    controls.style.opacity = '1';
                    controls.autoHideTimeout = null;
                }, 300);
            }, 3800);
        }
    }
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
    console.log('Updating mute status for user:', userId, 'isMuted:', isMuted);
    
    // Update the participant's mute status
    const participant = voiceChat.participants.get(userId);
    if (participant) {
        participant.isMuted = isMuted;
        console.log('Updated participant mute status:', participant);
    }
    
    // Update the mute status in the UI
    updateParticipantsList();
    
    // Also update the audio element mute status
    const audioElement = document.getElementById(`audio-${userId}`);
    if (audioElement) {
        audioElement.muted = isMuted;
        console.log('Updated audio element mute status for user:', userId, 'muted:', isMuted);
    }
}

function setupVoiceActivityDetection(userId, stream) {
    console.log('Setting up voice activity detection for user:', userId);
    
    // Create audio context for analyzing audio levels
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    // Configure analyser
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    // Connect the audio nodes
    source.connect(analyser);
    
    // Create data array for frequency analysis
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Store analyser for this user
    if (!voiceChat.voiceAnalysers) {
        voiceChat.voiceAnalysers = new Map();
    }
    voiceChat.voiceAnalysers.set(userId, analyser);
    
    // Function to update voice meter
    function updateVoiceMeter() {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // Convert to percentage (0-100)
        const volumeLevel = Math.min(100, (average / 128) * 100);
        
        // Update voice meter in UI
        updateVoiceMeterUI(userId, volumeLevel);
        
        // Continue monitoring
        requestAnimationFrame(updateVoiceMeter);
    }
    
    // Start monitoring
    updateVoiceMeter();
}

function updateVoiceMeterUI(userId, volumeLevel) {
    // Find the voice meter element for this user
    const voiceMeter = document.querySelector(`.voice-meter[data-user-id="${userId}"]`);
    if (voiceMeter) {
        // Update the meter width based on volume level
        voiceMeter.style.width = `${volumeLevel}%`;
        
        // Change color based on activity level
        if (volumeLevel > 30) {
            voiceMeter.style.backgroundColor = '#4CAF50'; // Green for active
        } else if (volumeLevel > 10) {
            voiceMeter.style.backgroundColor = '#FF9800'; // Orange for low activity
        } else {
            voiceMeter.style.backgroundColor = '#9E9E9E'; // Gray for no activity
        }
    }
}



// Initialize overlay as hidden
document.addEventListener('DOMContentLoaded', function() {
    detectPageType();
    // Overlay will be shown when extension icon is clicked
}); 