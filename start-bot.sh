#!/bin/bash

# Start Football Twitter Bot on Ubuntu VPS

echo "🚀 Starting Football Twitter Bot..."

# Check if .env file exists and is configured
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure it:"
    echo "cp .env.example .env && nano .env"
    exit 1
fi

# Check if required environment variables are set
if ! grep -q "BOT_USERNAME=" .env || ! grep -q "BOT_PASSWORD=" .env; then
    echo "⚠️  Please configure your .env file with Twitter credentials:"
    echo "nano .env"
    exit 1
fi

# Start with PM2
echo "🔄 Starting bot processes with PM2..."
pm2 start ecosystem.config.js

echo ""
echo "✅ Bot started successfully!"
echo ""
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs"
echo "🌐 Dashboard: http://$(curl -s ifconfig.me):3000"
echo "🛑 Stop bot: pm2 stop all"
echo ""