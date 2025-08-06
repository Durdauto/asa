import puppeteer from 'puppeteer';
import logger from '../utils/logger.js';

class TwitterPoster {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: true, // Always headless on VPS
        executablePath: puppeteer.executablePath(),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      this.page = await this.browser.newPage();
      
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      logger.info('Twitter poster initialized');
    } catch (error) {
      logger.error('Failed to initialize Twitter poster:', error);
      throw error;
    }
  }

  async login() {
    try {
      if (!this.page) {
        await this.initialize();
      }

      await this.page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

      // Fill in login credentials
      await this.page.waitForSelector('input[name="text"]');
      await this.page.type('input[name="text"]', process.env.BOT_USERNAME);
      
      await this.page.click('[role="button"]:has-text("Next")');
      
      await this.page.waitForSelector('input[name="password"]');
      await this.page.type('input[name="password"]', process.env.BOT_PASSWORD);
      
      await this.page.click('[role="button"]:has-text("Log in")');
      
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      this.isLoggedIn = true;
      logger.info('Successfully logged into Twitter');
    } catch (error) {
      logger.error('Failed to login to Twitter:', error);
      throw error;
    }
  }

  async postTweet(content) {
    try {
      if (!this.isLoggedIn) {
        logger.info(`🔐 Not logged in, attempting login...`);
        await this.login();
      }

      logger.info(`📱 Navigating to Twitter compose page...`);
      await this.page.goto('https://twitter.com/compose/tweet', { waitUntil: 'networkidle2' });
      
      // Wait for the tweet compose area
      logger.info(`⌨️ Waiting for tweet compose area...`);
      await this.page.waitForSelector('[data-testid="tweetTextarea_0"]');
      
      // Clear and type the tweet content
      logger.info(`📝 Typing tweet content...`);
      await this.page.click('[data-testid="tweetTextarea_0"]');
      await this.page.keyboard.selectAll();
      await this.page.keyboard.press('Delete');
      await this.page.type('[data-testid="tweetTextarea_0"]', content);
      
      // Post the tweet
      logger.info(`🚀 Posting tweet...`);
      await this.page.click('[data-testid="tweetButtonInline"]');
      
      // Wait for tweet to be posted
      await this.page.waitForTimeout(3000);
      
      logger.info('✅ Tweet posted successfully to Twitter');
      return true;
    } catch (error) {
      logger.error('❌ Failed to post tweet:', error.message);
      return false;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('Twitter poster closed');
    }
  }
}

export default TwitterPoster;