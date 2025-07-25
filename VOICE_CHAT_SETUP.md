# MoonMic Voice Chat System Setup

## Overview
MoonMic now includes a complete WebRTC-based voice chat system that allows users to communicate with each other when viewing the same memecoin/token on Axiom or BullX.

## Features
- **Real-time voice communication** using WebRTC
- **Automatic room creation** based on the current token page
- **Mute/unmute functionality** with visual indicators
- **User list** showing all participants
- **Cross-browser compatibility** using STUN servers

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Signaling Server
```bash
npm start
```
The server will run on `http://localhost:3000`

### 3. Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the MoonMic extension folder
4. The extension should now be loaded and ready to use

## How It Works

### Room Creation
- When a user clicks "Join" on a memecoin page, a unique room ID is generated based on the token address
- Users viewing the same token will automatically join the same voice chat room
- Room IDs are generated as:
  - Axiom: `axiom-{tokenAddress}`
  - BullX: `bullx-{tokenAddress}`

### Voice Chat Flow
1. User enters username and clicks "Join"
2. Extension requests microphone permission
3. Connects to signaling server via WebSocket
4. Joins the room for the current token
5. Establishes peer-to-peer connections with other users in the room
6. Shows the voice chat UI with participant list

### WebRTC Implementation
- Uses Google's STUN servers for NAT traversal
- Peer-to-peer audio streaming
- Automatic connection management
- Mute/unmute state synchronization

## Production Deployment

### Signaling Server
For production, deploy the signaling server to a cloud provider:

1. **Heroku**:
   ```bash
   heroku create moonmic-voice-chat
   git push heroku main
   ```

2. **DigitalOcean/AWS**: Deploy the Node.js server with PM2 or similar

3. **Update WebSocket URL**: Change `ws://localhost:3000` in `content.js` to your production server URL

### Extension Updates
1. Update the WebSocket URL in `content.js` to point to your production server
2. Package and publish the extension to the Chrome Web Store

## Troubleshooting

### Microphone Access
- Ensure the website has microphone permissions
- Check browser settings for microphone access
- Try refreshing the page and granting permissions again

### Connection Issues
- Check if the signaling server is running
- Verify WebSocket URL is correct
- Check browser console for error messages

### Voice Quality
- WebRTC automatically adjusts quality based on network conditions
- STUN servers help with NAT traversal
- Consider adding TURN servers for better connectivity in restrictive networks

## Security Considerations

### WebRTC Security
- All audio is encrypted end-to-end
- No audio data passes through the signaling server
- Server only handles connection coordination

### Room Security
- Room IDs are based on public token addresses
- Anyone with the extension can join any room
- Consider adding authentication for private rooms

## Future Enhancements
- Video chat support
- Screen sharing
- Chat messages
- Room passwords
- User roles and permissions
- Better UI/UX improvements 