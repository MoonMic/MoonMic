#!/bin/bash

# Test MoonMic Server Locally
echo "🧪 Testing MoonMic Server Locally"
echo "================================="

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

echo "✅ Dependencies installed"

echo ""
echo "🚀 Starting server..."
echo "📡 Server will be available at: http://localhost:3000"
echo "🔌 WebSocket URL: ws://localhost:3000"
echo ""
echo "💡 To test the server:"
echo "1. Open another terminal"
echo "2. Run: node ../test-server.js"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start 