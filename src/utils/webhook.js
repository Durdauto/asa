import axios from 'axios';
import logger from './logger.js';

export async function sendWebhookNotification(message, type = 'error') {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      logger.warn('No webhook URL configured');
      return;
    }

    const payload = {
      content: `**Football Bot ${type.toUpperCase()}**\n${message}`,
      timestamp: new Date().toISOString()
    };

    await axios.post(webhookUrl, payload);
    logger.info(`Webhook notification sent: ${type}`);
  } catch (error) {
    logger.error('Failed to send webhook notification:', error.message);
  }
}