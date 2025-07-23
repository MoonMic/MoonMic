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

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        status: 'test-ok', 
        timestamp: new Date().toISOString(),
        message: 'Server is running with updated code!',
        version: '1.0.1'
    });
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket server error handling
wss.on('error', (error) => {
    log('WebSocket server error:', { error: error.message, stack: error.stack });
});

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
            
            log(`Received message`, { clientId, type: data.type, roomId: data.roomId || 'undefined' });
            
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
                    if (!room) {
                        log(`Room not found after creation`, { roomId, clientId });
                        return;
                    }
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
                        username: user.username || 'Unknown'
                    }));
                    
                    try {
                        const roomJoinedMessage = {
                            type: 'room-joined',
                            participants,
                            userId: clientId
                        };
                        log(`Sending room-joined message`, { clientId, participantsCount: participants.length, message: roomJoinedMessage });
                        ws.send(JSON.stringify(roomJoinedMessage));
                        log(`Successfully sent room-joined message`, { clientId });
                    } catch (sendError) {
                        log(`Failed to send room-joined message`, { error: sendError.message, clientId });
                    }
                    
                    log(`User joined room`, { username, roomId, participantsCount: room.size });
                    break;
                    
                case 'offer':
                    const { targetUserId: offerTargetUserId, offer } = data;
                    
                    // Validate required fields
                    if (!offerTargetUserId || !offer) {
                        log(`Invalid offer data`, { clientId, targetUserId: offerTargetUserId, hasOffer: !!offer });
                        return;
                    }
                    
                    log(`Processing offer`, { from: clientId, to: offerTargetUserId, roomId: currentRoom });
                    
                    const targetUser = rooms.get(currentRoom)?.get(offerTargetUserId);
                    if (targetUser) {
                        try {
                            const offerMessage = {
                                type: 'offer',
                                fromUserId: clientId,
                                offer
                            };
                            log(`Sending offer message`, { from: clientId, to: offerTargetUserId, message: offerMessage });
                            targetUser.ws.send(JSON.stringify(offerMessage));
                            log(`Sent offer`, { from: clientId, to: offerTargetUserId });
                        } catch (sendError) {
                            log(`Failed to send offer message`, { error: sendError.message, targetUser: offerTargetUserId });
                        }
                    } else {
                        log(`Target user not found for offer`, { targetUserId: offerTargetUserId, roomId: currentRoom, availableUsers: Array.from(rooms.get(currentRoom)?.keys() || []) });
                    }
                    break;
                    
                case 'answer':
                    const { fromUserId, answer } = data;
                    
                    // Validate required fields
                    if (!fromUserId || !answer) {
                        log(`Invalid answer data`, { clientId, fromUserId, hasAnswer: !!answer });
                        return;
                    }
                    
                    log(`Processing answer`, { from: clientId, to: fromUserId, roomId: currentRoom });
                    
                    const fromUser = rooms.get(currentRoom)?.get(fromUserId);
                    if (fromUser) {
                        try {
                            const answerMessage = {
                                type: 'answer',
                                fromUserId: clientId,
                                answer
                            };
                            log(`Sending answer message`, { from: clientId, to: fromUserId, message: answerMessage });
                            fromUser.ws.send(JSON.stringify(answerMessage));
                            log(`Sent answer`, { from: clientId, to: fromUserId });
                        } catch (sendError) {
                            log(`Failed to send answer message`, { error: sendError.message, targetUser: fromUserId });
                        }
                    } else {
                        log(`From user not found for answer`, { fromUserId, roomId: currentRoom, availableUsers: Array.from(rooms.get(currentRoom)?.keys() || []) });
                    }
                    break;
                    
                case 'ice-candidate':
                    const { targetUserId: iceTargetUserId, candidate } = data;
                    
                    // Validate required fields
                    if (!candidate) {
                        log(`Invalid ice-candidate data`, { clientId, hasCandidate: !!candidate });
                        return;
                    }
                    
                    // Handle both old format (broadcast) and new format (targeted)
                    if (iceTargetUserId) {
                        // New format: send to specific user
                        const targetUser = rooms.get(currentRoom)?.get(iceTargetUserId);
                        if (targetUser) {
                            try {
                                targetUser.ws.send(JSON.stringify({
                                    type: 'ice-candidate',
                                    fromUserId: clientId,
                                    candidate
                                }));
                                log(`Sent ICE candidate to specific user`, { from: clientId, to: iceTargetUserId });
                            } catch (sendError) {
                                log(`Failed to send targeted ICE candidate`, { error: sendError.message, targetUser: iceTargetUserId });
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
                    
                case 'echo':
                    log('Received echo request', { clientId: currentUser?.id, message: data.message });
                    try {
                        ws.send(JSON.stringify({
                            type: 'echo-response',
                            message: data.message,
                            timestamp: Date.now()
                        }));
                    } catch (error) {
                        log('Failed to send echo response', { error: error.message });
                    }
                    break;
                    
                case 'ping':
                    log('Received ping from client', { clientId: currentUser?.id });
                    try {
                        ws.send(JSON.stringify({
                            type: 'pong',
                            timestamp: data.timestamp,
                            serverTime: Date.now()
                        }));
                    } catch (error) {
                        log('Failed to send pong', { error: error.message });
                    }
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

// Global error handling
process.on('uncaughtException', (error) => {
    log('Uncaught Exception:', { error: error.message, stack: error.stack });
    // Don't exit immediately, try to log and continue
});

process.on('unhandledRejection', (reason, promise) => {
    log('Unhandled Rejection:', { reason: reason?.message || reason, promise });
    // Don't exit immediately, try to log and continue
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

process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully');
    wss.close(() => {
        log('WebSocket server closed');
        server.close(() => {
            log('HTTP server closed');
            process.exit(0);
        });
    });
});

const PORT = process.env.PORT || 3000;

// HTTP server error handling
server.on('error', (error) => {
    log('HTTP server error:', { error: error.message, stack: error.stack });
});

server.listen(PORT, () => {
    log(`MoonMic voice chat server running on port ${PORT}`);
    log(`Health check available at http://localhost:${PORT}/health`);
}).on('error', (error) => {
    log('Server listen error:', { error: error.message, stack: error.stack });
}); 