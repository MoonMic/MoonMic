# MoonMic Voice Chat Server Deployment Guide

## Overview
This guide will help you deploy the MoonMic voice chat signaling server to production so users can actually communicate with each other.

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)
1. **Fork/Clone the repository**
2. **Go to [Railway.app](https://railway.app)**
3. **Connect your GitHub repository**
4. **Deploy the `server` folder**
5. **Get your WebSocket URL** (e.g., `wss://your-app.railway.app`)

### Option 2: Render
1. **Go to [Render.com](https://render.com)**
2. **Create a new Web Service**
3. **Connect your repository**
4. **Set build command**: `cd server && npm install`
5. **Set start command**: `cd server && npm start`
6. **Get your WebSocket URL**

### Option 3: Heroku
1. **Install Heroku CLI**
2. **Navigate to server folder**: `cd server`
3. **Create Heroku app**: `heroku create your-moonmic-app`
4. **Deploy**: `git push heroku main`
5. **Get your WebSocket URL**: `wss://your-moonmic-app.herokuapp.com`

### Option 4: DigitalOcean App Platform
1. **Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)**
2. **Create new app from GitHub**
3. **Select the server folder**
4. **Deploy and get your URL**

## Manual Server Setup

### Prerequisites
- Node.js 16+ installed
- Domain name (optional but recommended)
- SSL certificate (for WSS)

### Installation
```bash
# Clone the repository
git clone <your-repo>
cd moonmic/server

# Install dependencies
npm install

# Create environment file
cp env.example .env
# Edit .env with your settings

# Start the server
npm start
```

### Environment Variables
```bash
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://axiom.trade,https://neo.bullx.io
```

## Update Extension for Production

### 1. Update Server URL
In `content.js`, change:
```javascript
const PRODUCTION_SERVER_URL = 'wss://your-deployed-server.com';
```

### 2. Test the Connection
1. **Deploy your server**
2. **Update the extension with the new server URL**
3. **Load the extension in Chrome**
4. **Test on a memecoin page**

## Production Considerations

### Security
- ✅ CORS configured for Axiom and BullX
- ✅ Helmet.js for security headers
- ✅ Input validation and sanitization
- ✅ Rate limiting (optional)

### Performance
- ✅ Efficient WebSocket handling
- ✅ Room cleanup on disconnect
- ✅ Memory leak prevention
- ✅ Graceful shutdown

### Monitoring
- ✅ Health check endpoint: `/health`
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ Connection tracking

## Testing the Deployment

### 1. Health Check
```bash
curl https://your-server.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. WebSocket Connection
```javascript
// Test in browser console
const ws = new WebSocket('wss://your-server.com');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
```

### 3. Extension Testing
1. **Load extension with production server URL**
2. **Navigate to a memecoin page on Axiom or BullX**
3. **Click "Join Voice Chat"**
4. **Enter username and join**
5. **Test with multiple users**

## Troubleshooting

### Common Issues

**Connection Failed**
- Check server URL is correct
- Ensure server is running
- Verify CORS settings

**No Audio**
- Check microphone permissions
- Verify WebRTC is working
- Check browser console for errors

**Users Not Joining Same Room**
- Verify room ID generation
- Check URL detection logic
- Ensure same token address

### Debug Mode
Set `TEST_MODE = true` in `content.js` to test UI without server.

## Next Steps

1. **Deploy the server** using one of the options above
2. **Update the extension** with your server URL
3. **Test thoroughly** with multiple users
4. **Monitor server logs** for any issues
5. **Scale as needed** based on usage

## Support

If you encounter issues:
1. Check server logs
2. Verify WebSocket connection
3. Test with browser console
4. Check extension console for errors 