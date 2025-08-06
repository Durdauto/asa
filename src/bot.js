import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import TwitterScraper from './services/twitter-scraper.js';
import AIProcessor from './services/ai-processor.js';
import TwitterPoster from './services/twitter-poster.js';
import logger from './utils/logger.js';
import { sendWebhookNotification } from './utils/webhook.js';

dotenv.config();

class FootballBot {
  constructor() {
    this.scraper = new TwitterScraper();
    this.aiProcessor = new AIProcessor();
    this.poster = new TwitterPoster();
    this.processedTweets = new Set();
    this.journalists = [];
  }

  async initialize() {
    try {
      await this.loadJournalists();
      await this.scraper.initialize();
      await this.poster.initialize();
      logger.info('Football bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize bot:', error);
      await sendWebhookNotification(`Bot initialization failed: ${error.message}`);
      throw error;
    }
  }

  async loadJournalists() {
    try {
      const configPath = path.join(process.cwd(), 'src/config/journalists.json');
      const data = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(data);
      this.journalists = config.journalists.filter(j => j.active);
      logger.info(`Loaded ${this.journalists.length} active journalists`);
    } catch (error) {
      logger.error('Failed to load journalists config:', error);
      throw error;
    }
  }

  async processJournalist(journalist) {
    try {
      logger.info(`🔍 Scraping latest tweets from @${journalist.username}...`);
      
      const tweets = await this.scraper.getLatestTweets(journalist.username);
      
      if (tweets.length === 0) {
        logger.info(`📭 No tweets found for @${journalist.username}`);
        return;
      }
      
      logger.info(`📨 Found ${tweets.length} tweets from @${journalist.username}`);
      
      for (const tweet of tweets) {
        logger.info(`🔎 Analyzing tweet: "${tweet.text.substring(0, 100)}..."`);
        
        if (this.processedTweets.has(tweet.id)) {
          logger.info(`⏭️ Tweet already processed, skipping...`);
          continue;
        }

        const isFootballRelated = await this.aiProcessor.isFootballRelated(tweet.text);
        
        if (!isFootballRelated) {
          logger.info(`⚽ Tweet not football-related, skipping...`);
          this.processedTweets.add(tweet.id);
          continue;
        }

        logger.info(`⚽ Football-related tweet detected! Processing...`);
        
        const isTransferComplete = this.aiProcessor.detectTransferComplete(tweet.text);
        logger.info(`📋 Transfer complete: ${isTransferComplete ? 'Yes' : 'No'}`);
        
        const rewrittenText = await this.aiProcessor.rewriteText(
          tweet.text, 
          journalist.username, 
          isTransferComplete
        );
        
        logger.info(`✏️ Text rewritten successfully`);

        const finalTweet = this.formatTweet(rewrittenText, journalist);
        logger.info(`📝 Final tweet formatted: "${finalTweet.substring(0, 100)}..."`);
        
        const posted = await this.poster.postTweet(finalTweet);
        
        if (posted) {
          this.processedTweets.add(tweet.id);
          logger.info(`✅ Successfully posted tweet from @${journalist.username}`);
          
          // Wait between posts to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
          logger.error(`❌ Failed to post tweet from @${journalist.username}`);
      }
    } catch (error) {
      logger.error(`❌ Error processing @${journalist.username}:`, error);
      await sendWebhookNotification(`Error processing @${journalist.username}: ${error.message}`);
    }
  }

  formatTweet(content, journalist) {
    const tierDescription = this.getTierDescription(journalist.tier, journalist.reliability);
    
    return `${content}

Source - @${journalist.username}
[ ${journalist.tier} (${journalist.reliability}%) - ${tierDescription} ]`;
  }

  getTierDescription(tier, reliability) {
    if (reliability >= 75) return "Highly Reliable";
    if (reliability >= 50) return "Mixed/Decent";
    if (reliability >= 25) return "Questionable";
    return "Probably Waffle";
  }

  async run() {
    try {
      logger.info('Starting bot run...');
      
      for (const journalist of this.journalists) {
        await this.processJournalist(journalist);
      }
      
      logger.info('Bot run completed');
    } catch (error) {
      logger.error('Error during bot run:', error);
      await sendWebhookNotification(`Bot run failed: ${error.message}`);
    }
  }

  async cleanup() {
    try {
      await this.scraper.close();
      await this.poster.close();
      logger.info('Bot cleanup completed');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  startScheduler() {
    const interval = process.env.CHECK_INTERVAL_MINUTES || 5;
    
    cron.schedule(`*/${interval} * * * *`, async () => {
      logger.info(`⏰ Scheduled check triggered (every ${interval} minutes)`);
      await this.run();
    });
    
    logger.info(`🕐 Bot scheduler started - will check every ${interval} minutes`);
    logger.info(`👥 Monitoring ${this.journalists.length} journalists: ${this.journalists.map(j => `@${j.username}`).join(', ')}`);
  }
}

// Main execution
async function main() {
  const bot = new FootballBot();
  
  try {
    await bot.initialize();
    
    // Run once immediately
    await bot.run();
    
    // Start the scheduler
    bot.startScheduler();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down bot...');
      await bot.cleanup();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start bot:', error);
    await sendWebhookNotification(`Bot startup failed: ${error.message}`);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default FootballBot;