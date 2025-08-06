#!/bin/bash

# View Football Twitter Bot logs

echo "📋 Football Twitter Bot Logs"
echo "=============================="
echo ""
echo "Choose log type:"
echo "1. Bot logs (real-time)"
echo "2. Web dashboard logs"
echo "3. All logs"
echo "4. Error logs only"
echo "5. Bot log file"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "📊 Showing bot logs (Ctrl+C to exit)..."
        pm2 logs football-bot
        ;;
    2)
        echo "🌐 Showing web dashboard logs (Ctrl+C to exit)..."
        pm2 logs football-web
        ;;
    3)
        echo "📋 Showing all logs (Ctrl+C to exit)..."
        pm2 logs
        ;;
    4)
        echo "❌ Showing error logs..."
        pm2 logs --err
        ;;
    5)
        echo "📄 Showing bot log file..."
        tail -f logs/combined.log
        ;;
    *)
        echo "Invalid choice"
        ;;
esac