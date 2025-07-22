# 🌙 MoonMic v1.0.0 - Initial Release

## 🎉 What's New

MoonMic is a Chrome extension that enables real-time voice chat on memecoin pages across Axiom and BullX platforms. This initial release includes a complete voice chat system with a beautiful dark purple UI.

## ✨ Key Features

### 🎤 Voice Chat System
- **Real-time WebRTC audio** - Peer-to-peer voice communication
- **Smart room management** - Users on the same token join the same voice chat
- **Mute/unmute functionality** - Full audio control during sessions
- **Multiple participants** - Support for 10+ concurrent users per room

### 🎯 Platform Detection
- **Axiom Support** - Detects `/meme/` and `/token/` pages
- **BullX Support** - Detects `/terminal?chainId=` with `address=` parameter
- **Automatic room creation** - Based on token address for unique rooms

### 🎨 User Interface
- **Dark purple theme** - Modern, sleek design
- **Draggable overlay** - Position anywhere on the page
- **Responsive design** - Works on all screen sizes
- **Beautiful animations** - Smooth transitions and effects

### 🖥️ Server Infrastructure
- **Production-ready server** - Complete Node.js signaling server
- **Multiple hosting options** - Railway, Glitch, Render, Heroku
- **Free deployment guides** - Step-by-step instructions
- **Security features** - CORS, Helmet.js, input validation

## 🚀 Quick Start

### 1. Install Extension
```bash
git clone https://github.com/MoonMic/MoonMic.git
cd MoonMic
# Load in Chrome: chrome://extensions/ → Developer mode → Load unpacked
```

### 2. Deploy Server
```bash
# Railway (Recommended - 5 minutes)
./prepare-railway.sh
# Visit: https://railway.app

# Or Glitch (Always Free - 2 minutes)
./prepare-glitch.sh
# Visit: https://glitch.com
```

### 3. Update Extension
```javascript
// In content.js, set your server URL:
const PRODUCTION_SERVER_URL = 'wss://your-server-url.com';
```

### 4. Start Chatting!
1. Navigate to a memecoin page on Axiom or BullX
2. Click the MoonMic extension icon
3. Click "Join Voice Chat"
4. Enter username and connect!

## 📁 What's Included

### Extension Files
- `manifest.json` - Chrome extension configuration
- `content.js` - Main overlay and voice chat logic
- `background.js` - Background script
- `popup.html/js/css` - Extension popup interface
- `overlay.css` - Overlay styling
- `icons/` - Extension icons (16px, 48px, 128px)

### Server Files
- `server/package.json` - Server dependencies
- `server/server.js` - Voice chat signaling server
- `server/env.example` - Environment variables template

### Documentation
- `README.md` - Comprehensive setup guide
- `DEPLOYMENT.md` - Complete deployment instructions
- `RAILWAY_SETUP.md` - Railway-specific setup
- `FREE_DEPLOYMENT.md` - Free hosting options
- `ICON_SETUP.md` - Icon setup instructions

### Scripts
- `deploy.sh` - Deployment helper
- `prepare-railway.sh` - Railway preparation
- `prepare-glitch.sh` - Glitch preparation
- `test-local.sh` - Local testing

## 🎯 Supported Platforms

| Platform | URL Pattern | Detection |
|----------|-------------|-----------|
| **Axiom** | `axiom.trade/meme/` or `axiom.trade/token/` | ✅ Automatic |
| **BullX** | `neo.bullx.io/terminal?chainId=` with `address=` | ✅ Automatic |

## 🚀 Deployment Options

### Free Hosting
| Platform | Setup Time | Free Limits | Sleep | Best For |
|----------|------------|-------------|-------|----------|
| **Railway** | 5 min | 500 hours/month | No | Production |
| **Glitch** | 2 min | Unlimited | Yes | Testing |
| **Render** | 10 min | 750 hours/month | Yes | Development |

### Production Hosting
- **Railway** - $5/month for unlimited
- **DigitalOcean** - $7/month for always-on
- **Heroku** - $7/month for hobby tier

## 🧪 Testing

### Local Testing
```bash
# Test server locally
./test-local.sh

# Test WebSocket connection
node test-server.js
```

### Production Testing
```bash
# Health check
curl https://your-server.com/health

# WebSocket test (browser console)
const ws = new WebSocket('wss://your-server.com');
ws.onopen = () => console.log('✅ Connected!');
```

## 🔧 Technical Details

### Architecture
- **Frontend**: Chrome Extension (Manifest V3)
- **Backend**: Node.js + WebSocket signaling server
- **Audio**: WebRTC peer-to-peer communication
- **Security**: CORS, Helmet.js, input validation

### Performance
- **Latency**: <100ms typical
- **Quality**: High-quality audio
- **Concurrent Users**: 10+ per room
- **Bandwidth**: ~50kbps per user

### Browser Support
- **Chrome**: 88+ (Manifest V3)
- **Edge**: Chromium-based versions
- **Brave**: Full support
- **Other Chromium browsers**: Compatible

## 🐛 Known Issues

- **First connection**: May take 2-3 seconds to establish WebRTC
- **Browser permissions**: Requires microphone access
- **Network restrictions**: Some corporate networks may block WebRTC

## 🔮 Roadmap

### v1.1.0 (Planned)
- [ ] Mobile app version
- [ ] Video chat support
- [ ] Screen sharing
- [ ] Custom themes

### v1.2.0 (Future)
- [ ] User profiles
- [ ] Chat history
- [ ] Push notifications
- [ ] Advanced audio controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
- **Connection Failed**: Check server URL and CORS settings
- **No Audio**: Verify microphone permissions and WebRTC
- **Users Not Joining**: Check room ID generation and URL detection

### Getting Help
- Check the deployment guides in the repository
- Test with the provided scripts
- Monitor server logs for errors
- Verify extension console for connection issues

## 🙏 Acknowledgments

- **WebRTC** - For peer-to-peer audio communication
- **Chrome Extensions** - For the extension platform
- **Node.js** - For the server runtime
- **Open Source Community** - For inspiration and tools

---

**Made with ❤️ for the memecoin community**

**Download**: [MoonMic v1.0.0](https://github.com/MoonMic/MoonMic/releases/tag/v1.0.0) 