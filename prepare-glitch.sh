#!/bin/bash

# Prepare MoonMic for Glitch Deployment
echo "🎨 Preparing MoonMic for Glitch Deployment"
echo "=========================================="

# Create glitch-ready directory
GLITCH_DIR="glitch-deploy"

if [ -d "$GLITCH_DIR" ]; then
    echo "🗑️  Removing existing glitch-deploy directory..."
    rm -rf "$GLITCH_DIR"
fi

echo "📁 Creating glitch-deploy directory..."
mkdir "$GLITCH_DIR"

# Copy server files
echo "📦 Copying server files..."
cp server/package.json "$GLITCH_DIR/"
cp server/server.js "$GLITCH_DIR/"
cp server/env.example "$GLITCH_DIR/"

# Create .env file
echo "⚙️  Creating .env file..."
cat > "$GLITCH_DIR/.env" << EOF
PORT=3000
NODE_ENV=production
EOF

# Create README for Glitch
echo "📝 Creating Glitch README..."
cat > "$GLITCH_DIR/README.md" << EOF
# MoonMic Voice Chat Server

This is the signaling server for the MoonMic Chrome extension.

## Quick Setup
1. Import this project to Glitch
2. Glitch will auto-deploy
3. Get your URL from the top of the editor
4. Update your extension with: \`wss://your-project.glitch.me\`

## Files
- \`server.js\` - Main server file
- \`package.json\` - Dependencies
- \`.env\` - Environment variables

## Testing
Visit: https://your-project.glitch.me/health
Should return: \`{"status":"ok","timestamp":"..."}\`
EOF

echo ""
echo "✅ Glitch deployment files ready!"
echo ""
echo "📁 Files created in: $GLITCH_DIR/"
echo "📋 Files to upload to Glitch:"
echo "   - package.json"
echo "   - server.js"
echo "   - .env"
echo "   - README.md"
echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://glitch.com"
echo "2. Create 'New Project' → 'Import from GitHub'"
echo "3. Or create manually and upload these files"
echo "4. Get your URL and update content.js"
echo ""
echo "💡 Your WebSocket URL will be: wss://your-project-name.glitch.me" 