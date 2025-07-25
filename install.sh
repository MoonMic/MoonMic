#!/bin/bash

echo "🎤 MoonMic Chrome Extension Installer"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found!"
    echo "Please run this script from the MoonMic directory."
    exit 1
fi

echo "✅ Found MoonMic extension files"
echo ""

# Check if Chrome is installed
if command -v google-chrome &> /dev/null; then
    CHROME_CMD="google-chrome"
elif command -v chromium-browser &> /dev/null; then
    CHROME_CMD="chromium-browser"
elif command -v chrome &> /dev/null; then
    CHROME_CMD="chrome"
else
    echo "⚠️  Chrome not found in PATH"
    echo "Please install Chrome or Chromium to use this extension"
    exit 1
fi

echo "✅ Chrome found: $CHROME_CMD"
echo ""

# Get current directory
CURRENT_DIR=$(pwd)
echo "📁 Extension location: $CURRENT_DIR"
echo ""

echo "📋 Installation Steps:"
echo "1. Open Chrome browser"
echo "2. Navigate to: chrome://extensions/"
echo "3. Enable 'Developer mode' (toggle in top right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this directory: $CURRENT_DIR"
echo "6. The MoonMic extension should now appear in your extensions list"
echo ""

# Ask if user wants to open Chrome extensions page
read -p "Would you like to open Chrome extensions page now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Opening Chrome extensions page..."
    $CHROME_CMD chrome://extensions/
fi

echo ""
echo "🎉 Installation guide completed!"
echo "Click the MoonMic icon in your Chrome toolbar to start using the extension."
echo ""
echo "For more information, see README.md" 