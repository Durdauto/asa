# Football Twitter Bot

A comprehensive Twitter bot that monitors football journalists, analyzes their posts, and reposts them with reliability scores. Uses free APIs and services to keep costs minimal.

## Features

- **Automated Monitoring**: Tracks multiple football journalists simultaneously
- **AI Content Analysis**: Determines if posts are football-related using free Hugging Face models
- **Intelligent Rewriting**: Rewrites posts for better engagement while preserving key information
- **Reliability Scoring**: Assigns and displays reliability scores for each journalist
- **Transfer Detection**: Automatically detects completed transfers and adds appropriate formatting
- **Web Dashboard**: Easy-to-use interface for managing journalists and viewing logs
- **Error Reporting**: Webhook notifications for errors and issues
- **Free to Run**: Uses only free APIs and services (excluding hosting)

## Setup Instructions

### Quick Ubuntu VPS Setup (IONOS/DigitalOcean/etc.)

For Ubuntu 20.04+ VPS, use the automated installer:

```bash
# Download and run the installer
chmod +x install-ubuntu.sh
./install-ubuntu.sh

# Configure your credentials
nano .env

# Start the bot
./start-bot.sh
```

**Management Commands:**
- `./start-bot.sh` - Start the bot
- `./stop-bot.sh` - Stop the bot  
- `./view-logs.sh` - View logs
- `./update-bot.sh` - Update the bot
- `pm2 status` - Check bot status

---

### 1. Prerequisites

- Node.js 18+ installed
- A Twitter/X account for the bot
- Hugging Face account (free)
- Discord webhook URL (optional, for error notifications)

### 2. Installation

```bash
# Clone and setup
git clone <repository-url>
cd football-twitter-bot
npm install

# Install Chrome for Puppeteer
npm run setup

# Create logs directory
mkdir logs

# Copy environment variables
cp .env.example .env
```

### 3. Environment Configuration

Edit `.env` file with your credentials:

```env
# Bot Configuration
WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
BOT_USERNAME=your_twitter_bot_username    # Twitter username for your bot account
BOT_PASSWORD=your_twitter_bot_password    # Twitter password for your bot account  
BOT_EMAIL=your_twitter_bot_email@example.com    # Twitter email for your bot account

# Hugging Face (Free AI API)
HUGGINGFACE_API_KEY=your_huggingface_token    # Free API key from huggingface.co

# Web Dashboard
WEB_PORT=3000    # Port for the web dashboard (can be any available port)
ADMIN_PASSWORD=dashboard123    # Password to protect your dashboard (choose any secure password)

# Bot Settings
CHECK_INTERVAL_MINUTES=5    # How often to check for new tweets (in minutes)
MAX_POSTS_PER_RUN=10    # Maximum tweets to process per check
```

### 4. Get Hugging Face API Key (Free)

1. Visit [Hugging Face](https://huggingface.co) and create a free account
2. Go to Settings → Access Tokens
3. Create a new token with "Read" permissions
4. Add it to your `.env` file

### 5. Running the Bot

#### Start the Bot
```bash
npm start
```

#### Start the Web Dashboard
```bash
npm run web
```

Then visit `http://localhost:3000` to access the dashboard.

#### Development Mode (with auto-reload)
```bash
npm run dev
```

## How It Works

### 1. Monitoring
- Uses Nitter (free Twitter frontend) to scrape tweets
- Avoids Twitter's paid API restrictions
- Monitors journalists every 5 minutes by default

### 2. AI Processing
- Hugging Face's free inference API for content analysis
- Detects football-related content automatically
- Rewrites content for better engagement
- Identifies completed transfers

### 3. Posting
- Browser automation with Puppeteer to post tweets
- Adds reliability scores and source attribution
- Formats tweets appropriately for each journalist tier

### 4. Management
- Web-based dashboard for easy journalist management
- Real-time logs and monitoring
- Easy configuration updates

## Journalist Configuration

The bot comes pre-configured with major football journalists:

- **🟢 Highly Reliable (75-100%)**: Fabrizio Romano (99.9%), David Ornstein (99.5%), Di Marzio (85.0%)
- **🟡 Mixed/Decent (50-74%)**: Sky Sports News (65.0%)
- **🟠 Questionable (25-49%)**: talkSPORT (35.0%)
- **🔴 Probably Waffle (<25%)**: The Sun (20.0%)

### Adding New Journalists

Use the web dashboard or manually edit `src/config/journalists.json`:

```json
{
  "username": "journalist_twitter_handle",
  "displayName": "Display Name",
  "reliability": 85.0,
  "tier": "🟢",
  "specialPhrases": ["HERE WE GO"],
  "active": true
}
```

## Tweet Format Examples

### High-Tier Journalist (Fabrizio Romano)
```
🚨 HERE WE GO 🚨

Kylian Mbappé has officially signed for Real Madrid. All documents are completed, and the club will announce the transfer next week.

Source - @FabrizioRomano
[ 🟢 (99.9%) - Highly Reliable ]
```

### Medium-Tier Journalist
```
🚨 TRANSFER COMPLETED 🚨

Manchester United have agreed terms with Ajax for defender Lisandro Martinez. Medical scheduled for this week.

Source - @SkySportsNews
[ 🟡 (65.0%) - Mixed/Decent ]
```

## Free Services Used

- **Twitter Scraping**: Nitter (free Twitter frontend)
- **AI Processing**: Hugging Face Inference API (free tier)
- **Content Posting**: Puppeteer browser automation
- **Hosting**: Can be deployed on free platforms like Railway, Render, or Heroku

## Troubleshooting

### Common Issues

1. **Twitter Login Fails**
   - Ensure correct credentials in `.env`
   - Check if account needs additional verification
   - Try disabling 2FA temporarily

2. **AI Processing Errors**
   - Verify Hugging Face API key is correct
   - Check if you've exceeded free tier limits
   - Try alternative models if rate limited

3. **Scraping Issues**
   - Nitter instances may be down, bot will retry
   - Rate limiting may cause delays
   - Check logs for specific error messages

### Logs

All activities are logged to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output - Real-time monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to modify and distribute as needed.

## Disclaimer

This bot is for educational and personal use. Ensure compliance with Twitter's Terms of Service and applicable laws. The authors are not responsible for any misuse or violations.