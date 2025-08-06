import axios from 'axios';
import logger from '../utils/logger.js';

class AIProcessor {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
  }

  async isFootballRelated(text) {
    try {
      logger.info(`🤖 Analyzing text for football content...`);
      
      const footballKeywords = [
        'transfer', 'signing', 'contract', 'deal', 'fee', 'club', 'player',
        'football', 'soccer', 'manchester', 'liverpool', 'chelsea', 'arsenal',
        'barcelona', 'madrid', 'psg', 'bayern', 'juventus', 'milan',
        'here we go', 'done deal', 'confirmed', 'official', 'announce'
      ];

      const lowercaseText = text.toLowerCase();
      const hasFootballKeywords = footballKeywords.some(keyword => 
        lowercaseText.includes(keyword.toLowerCase())
      );

      logger.info(`⚽ Football keywords found: ${hasFootballKeywords ? 'Yes' : 'No'}`);
      return hasFootballKeywords;
    } catch (error) {
      logger.error('❌ Error checking if text is football related:', error.message);
      return false;
    }
  }

  async rewriteText(originalText, journalistName, isTransferComplete = false) {
    try {
      logger.info(`✏️ Rewriting text using AI...`);
      
      const prompt = `Rewrite this football transfer news in a clear, concise format. Keep the main facts but make it more engaging and easier to read. Original text: "${originalText}"`;

      const response = await axios.post(
        `${this.baseUrl}/google/flan-t5-large`,
        {
          inputs: prompt,
          parameters: {
            max_length: 280,
            temperature: 0.7
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let rewrittenText = response.data[0]?.generated_text || originalText;
      logger.info(`🤖 AI rewrite completed`);

      // Add transfer completion indicators
      if (isTransferComplete) {
        if (['FabrizioRomano', 'David_Ornstein'].includes(journalistName)) {
          rewrittenText = `🚨 HERE WE GO 🚨\n\n${rewrittenText}`;
          logger.info(`🎯 Added "HERE WE GO" for ${journalistName}`);
        } else {
          rewrittenText = `🚨 TRANSFER COMPLETED 🚨\n\n${rewrittenText}`;
          logger.info(`🎯 Added "TRANSFER COMPLETED" for ${journalistName}`);
        }
      } else {
        // Add appropriate emoji for breaking news
        rewrittenText = `🚨 ${rewrittenText}`;
        logger.info(`🚨 Added breaking news emoji`);
      }

      return rewrittenText;
    } catch (error) {
      logger.error('❌ Error rewriting text, using fallback:', error.message);
      // Fallback to simple formatting
      let formatted = originalText;
      if (isTransferComplete) {
        if (['FabrizioRomano', 'David_Ornstein'].includes(journalistName)) {
          formatted = `🚨 HERE WE GO 🚨\n\n${formatted}`;
        } else {
          formatted = `🚨 TRANSFER COMPLETED 🚨\n\n${formatted}`;
        }
      } else {
        formatted = `🚨 ${formatted}`;
      }
      return formatted;
    }
  }

  detectTransferComplete(text) {
    const completionKeywords = [
      'signed', 'completed', 'done deal', 'confirmed', 'official',
      'announced', 'here we go', 'sealed', 'finalized'
    ];

    return completionKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}

export default AIProcessor;