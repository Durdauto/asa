# Football Twitter Bot - Laptop Setup Guide

A Twitter bot that monitors football journalists and reposts their content with reliability scores. Perfect for running on your laptop!

## 🚀 Quick Start (5 minutes)

### Step 1: Download and Setup
```bash
# Clone or download this project
# Open terminal in the project folder

# Install dependencies
npm install

# Install Chrome for the bot
npm run setup

# Create your configuration file
cp .env.example .env
```

### Step 2: Configure Your Bot
Edit the `.env` file with your details:

1. **Twitter Account**: Use a separate Twitter account for your bot
   - `BOT_USERNAME`: Your bot's Twitter username (without @)
   - `BOT_PASSWORD`: Your bot's Twitter password
   - `BOT_EMAIL`: Your bot's Twitter email

2. **AI Processing** (Free):
   - Go to [Hugging Face](https://huggingface.co/settings/tokens)
   - Create a free account and generate a token
   - Add it as `HUGGINGFACE_API_KEY`

3. **Dashboard Password**: Change `ADMIN_PASSWORD` to something secure

### Step 3: Start the Bot
```bash
# Start the bot
npm start
```

The bot will open a browser window to log into Twitter automatically.

### Step 4: Access Dashboard
Open your browser and go to: `http://localhost:3000`

Use the password you set in `.env` to access the dashboard.

## 🎯 What It Does

- **Monitors** football journalists like Fabrizio Romano, David Ornstein
- **Analyzes** their tweets using AI to find football-related content
- **Reposts** with reliability scores (🟢 Highly Reliable, 🟡 Mixed, 🟠 Questionable, 🔴 Waffle)
- **Formats** tweets professionally with source attribution

## 📊 Dashboard Features

- View all monitored journalists
- Add/remove journalists
- Set reliability scores
- View real-time logs
- Enable/disable monitoring

## 🛠 Commands

```bash
npm start          # Start the bot
npm run web        # Start dashboard only
npm run setup      # Install Chrome browser
npm run dev        # Development mode with auto-reload
```

## 🔧 Troubleshooting

**Bot won't start?**
- Make sure you've run `npm run setup`
- Check your `.env` file has all required fields
- Ensure your Twitter account doesn't have 2FA enabled

**Can't access dashboard?**
- Check if port 3000 is available
- Try changing `WEB_PORT` in `.env`

**Twitter login fails?**
- Verify your credentials in `.env`
- Make sure the Twitter account exists and is active
- Try logging in manually first to check for any account issues

## 📝 Example Tweet Output

```
🚨 HERE WE GO 🚨

Kylian Mbappé has officially signed for Real Madrid. 
All documents completed, announcement expected next week.

Source - @FabrizioRomano
[ 🟢 (99.9%) - Highly Reliable ]
```

## ⚙️ Customization

- **Add Journalists**: Use the web dashboard to add new sources
- **Adjust Timing**: Change `CHECK_INTERVAL_MINUTES` in `.env`
- **Modify Reliability**: Update scores through the dashboard

## 🔒 Privacy & Safety

- All data stays on your laptop
- No external servers involved
- Uses free APIs only
- Respects Twitter's rate limits

## 📞 Support

If you encounter issues:
1. Check the logs in the dashboard
2. Verify your `.env` configuration
3. Make sure all dependencies are installed
4. Try restarting the bot

Enjoy monitoring football transfers! ⚽