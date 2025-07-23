const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            rooms: rooms.size,
            connections: wss.clients.size
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});
const wss = new WebSocket.Server({ server });

// Logging function
const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data) : '');
};

// WebSocket server error handling
wss.on('error', (error) => {
    log('WebSocket server error:', { error: error.message, stack: error.stack });
});

// HTTP server error handling
server.on('error', (error) => {
    log('HTTP server error:', { error: error.message, stack: error.stack });
});

// Store active rooms and their participants
const rooms = new Map();

wss.on('connection', (ws) => {
    const clientId = Date.now() + Math.random().toString(36).substr(2, 9);
    log('New client connected', { clientId });
    
    let currentUser = null;
    let currentRoom = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'join-room':
                    const { roomId, username } = data;
                    currentUser = { id: clientId, username, ws };
                    currentRoom = roomId;
                    
                    if (!rooms.has(roomId)) {
                        rooms.set(roomId, new Map());
                    }
                    
                    const room = rooms.get(roomId);
                    room.set(currentUser.id, currentUser);
                    
                    // Notify all users in the room about the new user
                    room.forEach((user) => {
                        if (user.ws !== ws) {
                            user.ws.send(JSON.stringify({
                                type: 'user-joined',
                                userId: currentUser.id,
                                username: currentUser.username
                            }));
                        }
                    });
                    
                    // Send current room participants to the new user
                    const participants = Array.from(room.values()).map(user => ({
                        id: user.id,
                        username: user.username
                    }));
                    
                    ws.send(JSON.stringify({
                        type: 'room-joined',
                        participants,
                        userId: currentUser.id
                    }));
                    
                    log(`User joined room`, { username, roomId, participantsCount: room.size });
                    break;
                    
                case 'offer':
                    const { targetUserId, offer } = data;
                    const targetUser = rooms.get(currentRoom)?.get(targetUserId);
                    if (targetUser) {
                        targetUser.ws.send(JSON.stringify({
                            type: 'offer',
                            fromUserId: currentUser.id,
                            offer
                        }));
                    }
                    break;
                    
                case 'answer':
                    const { fromUserId, answer } = data;
                    const fromUser = rooms.get(currentRoom)?.get(fromUserId);
                    if (fromUser) {
                        fromUser.ws.send(JSON.stringify({
                            type: 'answer',
                            fromUserId: currentUser.id,
                            answer
                        }));
                    }
                    break;
                    
                case 'ice-candidate':
                    const { targetUserId, candidate } = data;
                    
                    // Handle both old format (broadcast) and new format (targeted)
                    if (targetUserId) {
                        // New format: send to specific user
                        const targetUser = rooms.get(currentRoom)?.get(targetUserId);
                        if (targetUser) {
                            targetUser.ws.send(JSON.stringify({
                                type: 'ice-candidate',
                                fromUserId: currentUser.id,
                                candidate
                            }));
                            console.log(`Sent ICE candidate to specific user: ${currentUser.id} -> ${targetUserId}`);
                        }
                    } else {
                        // Old format: broadcast to all other users (fallback)
                        rooms.get(currentRoom)?.forEach((user) => {
                            if (user.ws !== ws) {
                                user.ws.send(JSON.stringify({
                                    type: 'ice-candidate',
                                    fromUserId: currentUser.id,
                                    candidate
                                }));
                            }
                        });
                        console.log(`Broadcasted ICE candidate from: ${currentUser.id}`);
                    }
                    break;
                    
                case 'mute-toggle':
                    const { isMuted } = data;
                    rooms.get(currentRoom)?.forEach((user) => {
                        if (user.ws !== ws) {
                            user.ws.send(JSON.stringify({
                                type: 'user-mute-toggle',
                                userId: currentUser.id,
                                isMuted
                            }));
                        }
                    });
                    break;
                    
                case 'leave-room':
                    if (currentRoom && rooms.has(currentRoom)) {
                        const room = rooms.get(currentRoom);
                        room.delete(currentUser.id);
                        
                        // Notify other users
                        room.forEach((user) => {
                            user.ws.send(JSON.stringify({
                                type: 'user-left',
                                userId: currentUser.id
                            }));
                        });
                        
                        // Clean up empty rooms
                        if (room.size === 0) {
                            rooms.delete(currentRoom);
                        }
                        
                        console.log(`${currentUser.username} left room ${currentRoom}`);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('close', () => {
        if (currentRoom && rooms.has(currentRoom)) {
            const room = rooms.get(currentRoom);
            room.delete(currentUser?.id);
            
            // Notify other users
            room.forEach((user) => {
                user.ws.send(JSON.stringify({
                    type: 'user-left',
                    userId: currentUser?.id
                }));
            });
            
            // Clean up empty rooms
            if (room.size === 0) {
                rooms.delete(currentRoom);
            }
            
            console.log(`${currentUser?.username} disconnected from room ${currentRoom}`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Voice chat signaling server running on port ${PORT}`);
}); 