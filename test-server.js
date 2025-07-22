// Test script for MoonMic Voice Chat Server
const WebSocket = require('ws');

const SERVER_URL = 'ws://localhost:3000';

console.log('🧪 Testing MoonMic Voice Chat Server...');
console.log(`Connecting to: ${SERVER_URL}`);

const ws = new WebSocket(SERVER_URL);

ws.on('open', () => {
    console.log('✅ Connected to server!');
    
    // Test joining a room
    const joinMessage = {
        type: 'join-room',
        roomId: 'test-room-123',
        username: 'TestUser'
    };
    
    console.log('📤 Sending join-room message:', joinMessage);
    ws.send(JSON.stringify(joinMessage));
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data);
        console.log('📥 Received message:', message);
        
        if (message.type === 'room-joined') {
            console.log('✅ Successfully joined room!');
            console.log('👥 Participants:', message.participants);
            
            // Test mute toggle
            setTimeout(() => {
                const muteMessage = {
                    type: 'mute-toggle',
                    isMuted: true
                };
                console.log('📤 Sending mute-toggle message:', muteMessage);
                ws.send(JSON.stringify(muteMessage));
            }, 1000);
            
            // Test leaving room
            setTimeout(() => {
                const leaveMessage = {
                    type: 'leave-room'
                };
                console.log('📤 Sending leave-room message:', leaveMessage);
                ws.send(JSON.stringify(leaveMessage));
                
                setTimeout(() => {
                    console.log('🔌 Closing connection...');
                    ws.close();
                }, 500);
            }, 2000);
        }
    } catch (error) {
        console.error('❌ Error parsing message:', error);
    }
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
    console.log('🔌 Connection closed');
    console.log('✅ Test completed!');
    process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.log('⏰ Test timeout - server may not be running');
    console.log('💡 Make sure to start the server first: cd server && npm start');
    process.exit(1);
}, 10000); 