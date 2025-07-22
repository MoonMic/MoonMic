#!/bin/bash

# MoonMic Icon Setup Script
# This script converts the SVG icon to the required PNG sizes for Chrome extension

echo "🎙️ Setting up MoonMic icons..."

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/"
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p icons

# Convert your actual moonmic.png to different PNG sizes
echo "🔄 Converting moonmic.png to PNG files..."

# 16x16 icon
magick icons/moonmic.png -background transparent -resize 16x16 -quality 100 icons/icon16.png
echo "✅ Created icon16.png"

# 48x48 icon
magick icons/moonmic.png -background transparent -resize 48x48 -quality 100 icons/icon48.png
echo "✅ Created icon48.png"

# 128x128 icon
magick icons/moonmic.png -background transparent -resize 128x128 -quality 100 icons/icon128.png
echo "✅ Created icon128.png"

echo "🎉 All icons have been generated successfully!"
echo "📁 Icons are located in the 'icons' directory"
echo "🔧 Your manifest.json is already configured to use these icons" 