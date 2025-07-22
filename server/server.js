const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['chrome-extension://*', 'https://axiom.trade', 'https://neo.bullx.io'],
    credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// Store active rooms and their participants
const rooms = new Map();
const connections = new Map();

// Logging
const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data) : '');
};

wss.on('connection', (ws, req) => {
    const clientId = Date.now() + Math.random().toString(36).substr(2, 9);
    connections.set(clientId, ws);
    
    log(`New client connected`, { clientId, ip: req.socket.remoteAddress });
    
    let currentUser = null;
    let currentRoom = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Validate message structure
            if (!data || typeof data.type !== 'string') {
                log(`Invalid message format`, { clientId, message: message.toString() });
                return;
            }
            
            log(`Received message`, { clientId, type: data.type, roomId: data.roomId });
            
            switch (data.type) {
                case 'join-room':
                    const { roomId, username } = data;
                    
                    // Validate required fields
                    if (!roomId || !username) {
                        log(`Invalid join-room data`, { clientId, roomId, username });
                        return;
                    }
                    
                    currentUser = { id: clientId, username, ws, roomId };
                    currentRoom = roomId;
                    
                    if (!rooms.has(roomId)) {
                        rooms.set(roomId, new Map());
                        log(`Created new room`, { roomId });
                    }
                    
                    const room = rooms.get(roomId);
                    room.set(clientId, currentUser);
                    
                    // Notify all users in the room about the new user
                    room.forEach((user) => {
                        if (user.ws !== ws) {
                            try {
                                user.ws.send(JSON.stringify({
                                    type: 'user-joined',
                                    userId: clientId,
                                    username: username
                                }));
                            } catch (sendError) {
                                log(`Failed to send user-joined message`, { error: sendError.message, targetUser: user.id });
                            }
                        }
                    });
                    
                    // Send current room participants to the new user
                    const participants = Array.from(room.values()).map(user => ({
                        id: user.id,
                        username: user.username
                    }));
                    
                    try {
                        ws.send(JSON.stringify({
                            type: 'room-joined',
                            participants,
                            userId: clientId
                        }));
                    } catch (sendError) {
                        log(`Failed to send room-joined message`, { error: sendError.message, clientId });
                    }
                    
                    log(`User joined room`, { username, roomId, participantsCount: room.size });
                    break;
                    
                case 'offer':
                    const { targetUserId, offer } = data;
                    
                    // Validate required fields
                    if (!targetUserId || !offer) {
                        log(`Invalid offer data`, { clientId, targetUserId, hasOffer: !!offer });
                        return;
                    }
                    
                    const targetUser = rooms.get(currentRoom)?.get(targetUserId);
                    if (targetUser) {
                        try {
                            targetUser.ws.send(JSON.stringify({
                                type: 'offer',
                                fromUserId: clientId,
                                offer
                            }));
                            log(`Sent offer`, { from: clientId, to: targetUserId });
                        } catch (sendError) {
                            log(`Failed to send offer message`, { error: sendError.message, targetUser: targetUserId });
                        }
                    }
                    break;
                    
                case 'answer':
                    const { fromUserId, answer } = data;
                    
                    // Validate required fields
                    if (!fromUserId || !answer) {
                        log(`Invalid answer data`, { clientId, fromUserId, hasAnswer: !!answer });
                        return;
                    }
                    
                    const fromUser = rooms.get(currentRoom)?.get(fromUserId);
                    if (fromUser) {
                        try {
                            fromUser.ws.send(JSON.stringify({
                                type: 'answer',
                                fromUserId: clientId,
                                answer
                            }));
                            log(`Sent answer`, { from: clientId, to: fromUserId });
                        } catch (sendError) {
                            log(`Failed to send answer message`, { error: sendError.message, targetUser: fromUserId });
                        }
                    }
                    break;
                    
                case 'ice-candidate':
                    const { targetUserId, candidate } = data;
                    
                    // Validate required fields
                    if (!candidate) {
                        log(`Invalid ice-candidate data`, { clientId, hasCandidate: !!candidate });
                        return;
                    }
                    
                    // Handle both old format (broadcast) and new format (targeted)
                    if (targetUserId) {
                        // New format: send to specific user
                        const targetUser = rooms.get(currentRoom)?.get(targetUserId);
                        if (targetUser) {
                            try {
                                targetUser.ws.send(JSON.stringify({
                                    type: 'ice-candidate',
                                    fromUserId: clientId,
                                    candidate
                                }));
                                log(`Sent ICE candidate to specific user`, { from: clientId, to: targetUserId });
                            } catch (sendError) {
                                log(`Failed to send targeted ICE candidate`, { error: sendError.message, targetUser: targetUserId });
                            }
                        }
                    } else {
                        // Old format: broadcast to all other users (fallback)
                        rooms.get(currentRoom)?.forEach((user) => {
                            if (user.ws !== ws) {
                                try {
                                    user.ws.send(JSON.stringify({
                                        type: 'ice-candidate',
                                        fromUserId: clientId,
                                        candidate
                                    }));
                                } catch (sendError) {
                                    log(`Failed to send broadcast ICE candidate`, { error: sendError.message, targetUser: user.id });
                                }
                            }
                        });
                        log(`Broadcasted ICE candidate`, { from: clientId });
                    }
                    break;
                    
                case 'mute-toggle':
                    const { isMuted } = data;
                    
                    // Validate required fields
                    if (typeof isMuted !== 'boolean') {
                        log(`Invalid mute-toggle data`, { clientId, isMuted });
                        return;
                    }
                    rooms.get(currentRoom)?.forEach((user) => {
                        if (user.ws !== ws) {
                            try {
                                user.ws.send(JSON.stringify({
                                    type: 'user-mute-toggle',
                                    userId: clientId,
                                    isMuted
                                }));
                            } catch (sendError) {
                                log(`Failed to send mute-toggle message`, { error: sendError.message, targetUser: user.id });
                            }
                        }
                    });
                    log(`User mute toggle`, { userId: clientId, isMuted });
                    break;
                    
                case 'leave-room':
                    if (currentRoom && rooms.has(currentRoom)) {
                        const room = rooms.get(currentRoom);
                        room.delete(clientId);
                        
                        // Notify other users
                        room.forEach((user) => {
                            try {
                                user.ws.send(JSON.stringify({
                                    type: 'user-left',
                                    userId: clientId
                                }));
                            } catch (sendError) {
                                log(`Failed to send user-left message`, { error: sendError.message, targetUser: user.id });
                            }
                        });
                        
                        // Clean up empty rooms
                        if (room.size === 0) {
                            rooms.delete(currentRoom);
                            log(`Room deleted`, { roomId: currentRoom });
                        }
                        
                        log(`User left room`, { username: currentUser?.username, roomId: currentRoom });
                    }
                    break;
                    
                default:
                    log(`Unknown message type`, { type: data.type });
            }
        } catch (error) {
            log(`Error processing message`, { error: error.message, clientId, messageType: data?.type });
            // Send error response to client if possible
            try {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to process message',
                    details: error.message
                }));
            } catch (sendError) {
                log(`Failed to send error response`, { error: sendError.message });
            }
        }
    });
    
    ws.on('close', () => {
        if (currentRoom && rooms.has(currentRoom)) {
            const room = rooms.get(currentRoom);
            room.delete(clientId);
            
            // Notify other users
            room.forEach((user) => {
                try {
                    user.ws.send(JSON.stringify({
                        type: 'user-left',
                        userId: clientId
                    }));
                } catch (sendError) {
                    log(`Failed to send disconnect notification`, { error: sendError.message, targetUser: user.id });
                }
            });
            
            // Clean up empty rooms
            if (room.size === 0) {
                rooms.delete(currentRoom);
                log(`Room deleted on disconnect`, { roomId: currentRoom });
            }
            
            log(`User disconnected`, { username: currentUser?.username, roomId: currentRoom });
        }
        
        connections.delete(clientId);
        log(`Client disconnected`, { clientId });
    });
    
    ws.on('error', (error) => {
        log(`WebSocket error`, { clientId, error: error.message });
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    wss.close(() => {
        log('WebSocket server closed');
        server.close(() => {
            log('HTTP server closed');
            process.exit(0);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    log(`MoonMic voice chat server running on port ${PORT}`);
    log(`Health check available at http://localhost:${PORT}/health`);
}); 