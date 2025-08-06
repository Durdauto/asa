import puppeteer from 'puppeteer';
import logger from '../utils/logger.js';

class TwitterScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
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
      
      // Set user agent to avoid detection
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      logger.info('Twitter scraper initialized');
    } catch (error) {
      logger.error('Failed to initialize Twitter scraper:', error);
      throw error;
    }
  }

  async getLatestTweets(username, count = 5) {
    try {
      if (!this.page) {
        await this.initialize();
      }

      logger.info(`🌐 Navigating to Nitter page for @${username}`);
      const url = `https://nitter.net/${username}`;
      await this.page.goto(url, { waitUntil: 'networkidle2' });

      logger.info(`📄 Page loaded, extracting tweets...`);
      const tweets = await this.page.evaluate(() => {
        const tweetElements = document.querySelectorAll('.timeline-item');
        const tweets = [];

        for (let i = 0; i < Math.min(tweetElements.length, 5); i++) {
          const tweet = tweetElements[i];
          const textElement = tweet.querySelector('.tweet-content');
          const timeElement = tweet.querySelector('.tweet-date');
          const linkElement = tweet.querySelector('.tweet-link');

          if (textElement && timeElement) {
            tweets.push({
              text: textElement.innerText.trim(),
              time: timeElement.getAttribute('title'),
              link: linkElement ? linkElement.href : '',
              id: linkElement ? linkElement.href.split('/').pop() : Math.random().toString()
            });
          }
        }

        return tweets;
      });

      logger.info(`📊 Successfully scraped ${tweets.length} tweets from @${username}`);
      
      if (tweets.length > 0) {
        logger.info(`📝 Latest tweet: "${tweets[0].text.substring(0, 100)}..."`);
      }
      
      return tweets;
    } catch (error) {
      logger.error(`❌ Failed to scrape tweets from @${username}:`, error.message);
      return [];
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('Twitter scraper closed');
    }
  }
}

export default TwitterScraper;