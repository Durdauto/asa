#!/bin/bash

# Update Football Twitter Bot

echo "🔄 Updating Football Twitter Bot..."

# Stop the bot
echo "🛑 Stopping bot..."
pm2 stop all

# Update dependencies
echo "📦 Updating dependencies..."
npm update

# Reinstall Chrome if needed
echo "🌐 Updating Chrome..."
npx puppeteer browsers install chrome

# Restart the bot
echo "🚀 Restarting bot..."
pm2 start ecosystem.config.js

echo "✅ Bot updated and restarted successfully!"