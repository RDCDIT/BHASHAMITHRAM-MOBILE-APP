const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectMySQL } = require('./config/mysql');
const path = require('path');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Prevent server crash on unhandled async rejections or exceptions
process.on('uncaughtException', (err) => {
  console.error('🚨 [Server Error Handled - Uncaught Exception]:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('🚨 [Server Error Handled - Unhandled Rejection]:', reason);
});

// Security & Rate Limiting Middleware
const suggestionRateLimits = new Map();
const suggestionRateLimiter = (req, res, next) => {
  if (req.method === 'POST' && (req.originalUrl.includes('/api/words/suggest') || req.originalUrl.includes('/api/words/dataview') || req.originalUrl.includes('/api/suggest-word'))) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes window
    const maxRequests = 25; // max 25 suggestions per 15 minutes per IP

    const record = suggestionRateLimits.get(clientIp) || { count: 0, resetTime: now + windowMs };
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }
    suggestionRateLimits.set(clientIp, record);

    if (record.count > maxRequests) {
      console.warn(`🚨 [Security Alert] IP ${clientIp} exceeded suggestion submission rate limit.`);
      return res.status(429).json({
        error: "Too many suggestions submitted. Please wait 15 minutes before trying again."
      });
    }
  }
  next();
};

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-signature', 'x-timestamp'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(suggestionRateLimiter);
app.use('/public', express.static(path.join(__dirname, 'public')));

// Root health-check endpoint for Cloudflare / Render load balancers
app.get(['/', '/health'], (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Bhashamithram II API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Public Privacy Policy Endpoint for Google Play Store / App Store compliance
app.get(['/privacy', '/privacy-policy'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// Suggested Words Administration Web Portal
app.get(['/suggestions', '/admin/suggestions', '/suggestions.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'suggestions.html'));
});

// Request logger middleware
app.use((req, res, next) => {
  console.log(`📡 [Incoming HTTP Request] ${req.method} ${req.url}`);
  next();
});

// Import routes
const wordRoutes = require('./routes/wordroute');
const malayalamMalayalamRoutes = require('./routes/malayalam-malayalam');
const englishEnglishRoutes = require('./routes/english_english');
const englishMalayalamRoutes = require('./routes/english_malayalam');
const malayalamEnglishRoutes = require('./routes/malayalam_english');
const malayalamSynonymRoutes = require('./routes/malayalam_synonym');
const audioRoutes = require('./routes/audioRoutes');
const speechRoutes = require('./routes/speechRoutes');
const suggestedWordRoute = require('./routes/adminRoutes/suggestedWordRoute');
const migrationRoute = require('./routes/adminRoutes/migrationRoute');
const pronunciationRoutes = require('./routes/pronunciationRoutes');
const dictionaryAdminRoute = require('./routes/adminRoutes/dictionaryAdminRoute');
const { suggestWord, getSuggestions } = require('./controllers/suggest_word');

// Direct endpoints for Mobile App Word Suggestion & Web Management
app.post(['/api/suggest-word', '/api/words/suggest'], suggestWord);
app.get(['/api/suggest-word', '/api/words/suggestions'], getSuggestions);

// Mount routes
app.use('/api/words', wordRoutes);
app.use('/api/malayalam-malayalam', malayalamMalayalamRoutes);
app.use('/api/english-english', englishEnglishRoutes);
app.use('/api/english-malayalam', englishMalayalamRoutes);
app.use('/api/malayalam-english', malayalamEnglishRoutes);
app.use('/api/synonyms', malayalamSynonymRoutes);
app.use('/api/pronounce', audioRoutes);
app.use('/api/speech-to-text', speechRoutes);
app.use('/api/admin/suggestions', suggestedWordRoute);
app.use('/api/admin/migrate', migrationRoute);
app.use('/api/admin/dictionary', dictionaryAdminRoute);
app.use('/api/pronunciation', pronunciationRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('🚨 [Server Error Handled]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});



// ------------------------------------------------------------
// 1. DATABASE CONNECTIVITY (MySQL Primary Engine + Local SQLite Fallback)
// ------------------------------------------------------------
const { initSqlite } = require('./config/dbService');

// Initialize local SQLite fallback database
initSqlite();

// Connect to MySQL database
connectMySQL()
  .then((connected) => {
    if (connected) {
      console.log('✅ [Database] MySQL connection established successfully.');
    } else {
      console.warn('💡 [Database] Running in Resilient Local SQLite Fallback Mode.');
    }
  })
  .catch((err) => {
    console.warn('⚠️ [Database] MySQL connection error:', err.message);
    console.warn('💡 [Database] Running in Resilient Local SQLite Fallback Mode.');
  });

// ------------------------------------------------------------
// 2. SERVER PORT BOUNDARY LOGS
// ------------------------------------------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 [Server] Environment running in mode: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 [Server] Listening on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile URL: http://192.168.3.148:${PORT}`);
});