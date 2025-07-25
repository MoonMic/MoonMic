const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// Store rooms
const rooms = new Map();

console.log('Starting minimal test server...');

wss.on('connection', (ws, req) => {
    const clientId = Date.now() + Math.random().toString(36).substr(2, 9);
    console.log(`Client connected: ${clientId}`);
    
    let currentRoom = null;
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`Received: ${data.type} from ${clientId}`);
            
            if (data.type === 'join-room') {
                const { roomId, username } = data;
                console.log(`User ${username} joining room ${roomId}`);
                
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, new Map());
                }
                
                const room = rooms.get(roomId);
                room.set(clientId, { id: clientId, username, ws });
                currentRoom = roomId;
                
                // Send confirmation
                ws.send(JSON.stringify({
                    type: 'room-joined',
                    userId: clientId,
                    participants: Array.from(room.values()).map(u => ({ id: u.id, username: u.username }))
                }));
                
                console.log(`User ${username} joined room ${roomId}`);
            }
            
        } catch (error) {
            console.error('Error processing message:', error.message);
        }
    });
    
    ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        if (currentRoom && rooms.has(currentRoom)) {
            const room = rooms.get(currentRoom);
            room.delete(clientId);
            if (room.size === 0) {
                rooms.delete(currentRoom);
            }
        }
    });
    
    ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error.message);
    });
});

wss.on('error', (error) => {
    console.error('WebSocket server error:', error.message);
});

server.on('error', (error) => {
    console.error('HTTP server error:', error.message);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Minimal test server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
}); 