#!/bin/bash

# MoonMic Voice Chat Server Deployment Script
echo "🚀 MoonMic Voice Chat Server Deployment"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "server/package.json" ]; then
    echo "❌ Error: Please run this script from the moonmic root directory"
    exit 1
fi

# Navigate to server directory
cd server

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env exists, if not create from example
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your production settings"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Edit server/.env with your production settings"
echo "2. Deploy to your preferred platform:"
echo "   - Railway: https://railway.app"
echo "   - Render: https://render.com"
echo "   - Heroku: heroku create && git push heroku main"
echo "   - DigitalOcean: https://cloud.digitalocean.com/apps"
echo ""
echo "3. Update content.js with your server URL:"
echo "   const PRODUCTION_SERVER_URL = 'wss://your-server.com';"
echo ""
echo "4. Test the connection and reload the extension"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions" 