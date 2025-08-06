#!/bin/bash

# Football Twitter Bot - Ubuntu VPS Installation Script
# For Ubuntu 20.04+ (tested on IONOS VPS)

set -e

echo "🚀 Starting Football Twitter Bot installation on Ubuntu VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource repository)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install required system dependencies for Puppeteer
echo "📦 Installing Chrome dependencies..."
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Install PM2 for process management
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2

# Create bot directory
echo "📁 Creating bot directory..."
mkdir -p ~/football-bot
cd ~/football-bot

# Download or clone the bot files (assuming they're in current directory)
echo "📥 Setting up bot files..."
if [ -f "../package.json" ]; then
    cp -r ../* . 2>/dev/null || true
    cp -r ../.[^.]* . 2>/dev/null || true
else
    echo "⚠️  Please ensure bot files are in the parent directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Chrome for Puppeteer
echo "🌐 Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your credentials:"
    echo "   nano .env"
    echo ""
    echo "You need to configure:"
    echo "- BOT_USERNAME (your Twitter bot username)"
    echo "- BOT_PASSWORD (your Twitter bot password)"
    echo "- BOT_EMAIL (your Twitter bot email)"
    echo "- HUGGINGFACE_API_KEY (free from huggingface.co)"
    echo "- ADMIN_PASSWORD (choose a secure password)"
    echo ""
fi

# Create PM2 ecosystem file
echo "📝 Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'football-bot',
      script: 'src/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_file: 'logs/pm2-combined.log',
      time: true
    },
    {
      name: 'football-web',
      script: 'src/web-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        WEB_PORT: 3000
      },
      error_file: 'logs/web-error.log',
      out_file: 'logs/web-out.log',
      log_file: 'logs/web-combined.log',
      time: true
    }
  ]
};
EOF

# Create systemd service for auto-start on boot
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/football-bot.service > /dev/null << EOF
[Unit]
Description=Football Twitter Bot
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=$HOME/football-bot
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable football-bot

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit your .env file: nano .env"
echo "2. Configure your Twitter bot credentials and API keys"
echo "3. Start the bot: ./start-bot.sh"
echo "4. View logs: ./view-logs.sh"
echo "5. Access dashboard: http://your-server-ip:3000"
echo ""
echo "📁 Bot installed in: $HOME/football-bot"
echo "🔧 Use PM2 commands: pm2 status, pm2 logs, pm2 restart football-bot"
echo ""