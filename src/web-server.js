import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.WEB_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Simple authentication middleware
const authenticate = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const providedPassword = req.headers['x-admin-password'] || req.query.password;
  
  if (req.path === '/' || req.path === '/login.html') {
    return next();
  }
  
  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
};

app.use('/api', authenticate);

// API Routes
app.get('/api/journalists', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config/journalists.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    res.json(config.journalists);
  } catch (error) {
    logger.error('Error loading journalists:', error);
    res.status(500).json({ error: 'Failed to load journalists' });
  }
});

app.post('/api/journalists', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config/journalists.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    
    const newJournalist = {
      id: Date.now().toString(),
      ...req.body,
      specialPhrases: req.body.specialPhrases || [],
      active: req.body.active !== false
    };
    
    config.journalists.push(newJournalist);
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    res.json(newJournalist);
  } catch (error) {
    logger.error('Error adding journalist:', error);
    res.status(500).json({ error: 'Failed to add journalist' });
  }
});

app.put('/api/journalists/:username', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config/journalists.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    
    const journalistIndex = config.journalists.findIndex(j => j.username === req.params.username);
    
    if (journalistIndex === -1) {
      return res.status(404).json({ error: 'Journalist not found' });
    }
    
    config.journalists[journalistIndex] = {
      ...config.journalists[journalistIndex],
      ...req.body
    };
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    res.json(config.journalists[journalistIndex]);
  } catch (error) {
    logger.error('Error updating journalist:', error);
    res.status(500).json({ error: 'Failed to update journalist' });
  }
});

app.delete('/api/journalists/:username', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config/journalists.json');
    const data = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(data);
    
    config.journalists = config.journalists.filter(j => j.username !== req.params.username);
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting journalist:', error);
    res.status(500).json({ error: 'Failed to delete journalist' });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'logs/combined.log');
    const logData = await fs.readFile(logPath, 'utf8');
    const logs = logData.split('\n')
      .filter(line => line.trim())
      .slice(-100) // Last 100 logs
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, timestamp: new Date().toISOString() };
        }
      });
    
    res.json(logs.reverse());
  } catch (error) {
    logger.error('Error loading logs:', error);
    res.json([]);
  }
});

app.listen(PORT, () => {
  logger.info(`Web server running on port ${PORT}`);
  console.log(`Dashboard available at: http://localhost:${PORT}`);
});