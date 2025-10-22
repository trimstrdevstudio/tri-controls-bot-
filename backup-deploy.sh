#!/bin/bash

# TRI CONTROLS BOT - Backup Deployment Script
# Use this if Render deployment fails

echo "🚀 TRI CONTROLS BOT - Alternative Deployment"
echo "============================================="

# Check Node.js version
echo "🔍 Checking Node.js version..."
node --version
npm --version

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
PORT=8000
MEGA_EMAIL=irokzmusicworld@gmail.com
MEGA_PASSWORD=Tri@369069786
NODE_ENV=production
EOL
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Test the application
echo "🧪 Testing application..."
if node -e "require('./index.js')" > /dev/null 2>&1; then
    echo "✅ Application test passed"
else
    echo "❌ Application test failed"
    exit 1
fi

# Start the application
echo "🎯 Starting TRI CONTROLS BOT..."
echo "📍 Server will run on: http://localhost:8000"
echo "🤖 Bot Name: TRI CONTROLS BOT"
echo "👤 Developer: GHOSTTRI"
echo "🏢 Company: TRI MSTR DEV STUDIO"
echo "============================================="

npm start