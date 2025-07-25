#!/bin/bash

echo "🚀 Preparing MoonMic v1.0.0 Release"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the MoonMic directory."
    exit 1
fi

# Verify version is 1.0.0
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
if [ "$VERSION" != "1.0.0" ]; then
    echo "❌ Error: Version in manifest.json is not 1.0.0 (current: $VERSION)"
    exit 1
fi

echo "✅ Version verified: $VERSION"

# Create release directory
RELEASE_DIR="moonmic-v1.0.0"
echo "📁 Creating release directory: $RELEASE_DIR"

if [ -d "$RELEASE_DIR" ]; then
    rm -rf "$RELEASE_DIR"
fi

mkdir "$RELEASE_DIR"

# Copy all necessary files
echo "📋 Copying files..."
cp manifest.json "$RELEASE_DIR/"
cp content.js "$RELEASE_DIR/"
cp background.js "$RELEASE_DIR/"
cp overlay.css "$RELEASE_DIR/"
cp popup.html "$RELEASE_DIR/"
cp popup.js "$RELEASE_DIR/"
cp popup.css "$RELEASE_DIR/"
cp window.html "$RELEASE_DIR/"
cp window.js "$RELEASE_DIR/"
cp README.md "$RELEASE_DIR/"
cp RELEASE_NOTES.md "$RELEASE_DIR/"
cp install.sh "$RELEASE_DIR/"
cp icon_setup.sh "$RELEASE_DIR/"
cp ICON_SETUP.md "$RELEASE_DIR/"

# Copy icons directory
if [ -d "icons" ]; then
    cp -r icons "$RELEASE_DIR/"
fi

# Create zip file
echo "📦 Creating release zip..."
zip -r "moonmic-v1.0.0.zip" "$RELEASE_DIR"

# Clean up
rm -rf "$RELEASE_DIR"

echo ""
echo "🎉 Release preparation complete!"
echo "=================================="
echo "📦 Release package: moonmic-v1.0.0.zip"
echo "📄 Release notes: RELEASE_NOTES.md"
echo ""
echo "📋 Next steps for GitHub release:"
echo "1. Go to your GitHub repository"
echo "2. Click 'Releases' → 'Create a new release'"
echo "3. Tag: v1.0.0"
echo "4. Title: MoonMic v1.0.0 - Final Release"
echo "5. Description: Copy content from RELEASE_NOTES.md"
echo "6. Upload: moonmic-v1.0.0.zip"
echo "7. Publish release!"
echo ""
echo "🚀 MoonMic v1.0.0 is ready for release!" 