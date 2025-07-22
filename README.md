# MoonMic Chrome Extension

A beautiful voice chat Chrome extension with a dark purple theme, inspired by modern UI design.

## Features

- 🎤 Simple microphone activation interface
- 🎨 Beautiful dark purple theme
- 📱 Responsive popup design
- 🎧 Interactive headphone icon
- 📊 User count display
- ⤢ Expand functionality (ready for implementation)

## Installation

### Extension Setup
1. **Download or clone this repository**
   ```bash
   git clone <repository-url>
   cd MoonMic
   ```

2. **Set up the icons (optional)**
   ```bash
   ./icon_setup.sh
   ```
   This will regenerate the PNG icons from the SVG source. Requires ImageMagick to be installed.

3. **Open Chrome and navigate to Extensions**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `MoonMic` folder
   - The extension should now appear in your extensions list

5. **Access the extension**
   - Click the MoonMic icon in your Chrome toolbar
   - The popup will appear with the beautiful dark purple interface

### Voice Chat Server Setup
For full voice chat functionality, you need to deploy the signaling server:

1. **Quick Setup**: Run `./deploy.sh` for guided deployment
2. **Manual Setup**: See `DEPLOYMENT.md` for detailed instructions
3. **Update Extension**: Set your server URL in `content.js`

**Recommended Platforms:**
- Railway (easiest): https://railway.app
- Render: https://render.com
- Heroku: https://heroku.com
- DigitalOcean: https://cloud.digitalocean.com/apps

## Usage

- **Start Mic**: Click the "Start Mic" button to activate microphone functionality
- **Stop Mic**: Click "Stop Mic" to deactivate
- **Headphone Icon**: Click for visual feedback
- **Expand Icon**: Click to expand (functionality can be implemented)
- **Title**: Shows as draggable (functionality can be implemented)

## File Structure

```
MoonMic/
├── manifest.json      # Extension configuration
├── popup.html         # Main popup interface
├── popup.css          # Styling and theme
├── popup.js           # JavaScript functionality
├── icons/             # Extension icons (16px, 48px, 128px)
│   ├── icon.svg       # Source SVG icon
│   ├── icon16.png     # 16x16 icon
│   ├── icon48.png     # 48x48 icon
│   └── icon128.png    # 128x128 icon
└── README.md          # This file
```

## Customization

### Colors
The extension uses a dark purple theme:
- Background: `#2C004F`
- Button: `#5F1A9B`
- Button Hover: `#7B2BC7`
- Active Button: `#E74C3C`

### Features to Add
- Actual microphone functionality using `navigator.mediaDevices.getUserMedia()`
- Real-time voice chat capabilities
- User authentication
- Expand to full window functionality
- Draggable popup interface

## Development

To modify the extension:
1. Edit the files in the `MoonMic` directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the MoonMic extension
4. Test your changes

## Browser Compatibility

- Chrome 88+ (Manifest V3)
- Other Chromium-based browsers (Edge, Brave, etc.)

## License

This project is open source and available under the MIT License. 