#!/bin/bash

# Prepare MoonMic for Railway Deployment
echo "🚂 Preparing MoonMic for Railway Deployment"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "server/package.json" ]; then
    echo "❌ Error: Please run this script from the moonmic root directory"
    exit 1
fi

echo "✅ Server files found"
echo ""
echo "🎯 Railway Setup Steps:"
echo ""
echo "1. 📁 Go to https://railway.app"
echo "2. 🔗 Sign in with GitHub"
echo "3. ➕ Click 'New Project'"
echo "4. 📦 Select 'Deploy from GitHub repo'"
echo "5. 🎯 Choose your MoonMic repository"
echo "6. ⚙️  Set Root Directory to 'server'"
echo "7. 🔧 Add environment variables:"
echo "   - PORT=3000"
echo "   - NODE_ENV=production"
echo "8. 🚀 Deploy and get your URL"
echo ""
echo "📋 Your server files are ready:"
echo "   ✅ server/package.json"
echo "   ✅ server/server.js"
echo "   ✅ server/env.example"
echo ""
echo "🔗 After deployment, your WebSocket URL will be:"
echo "   wss://your-app.railway.app"
echo ""
echo "📝 Update content.js with:"
echo "   const PRODUCTION_SERVER_URL = 'wss://your-app.railway.app';"
echo ""
echo "🧪 Test your deployment:"
echo "   curl https://your-app.railway.app/health"
echo ""
echo "📚 See RAILWAY_SETUP.md for detailed instructions" 