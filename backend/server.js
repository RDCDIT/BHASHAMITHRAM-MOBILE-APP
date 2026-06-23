const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Mount routes
app.use('/api/words', wordRoutes);
app.use('/api/malayalam-malayalam', malayalamMalayalamRoutes);
app.use('/api/english-english', englishEnglishRoutes);
app.use('/api/english-malayalam', englishMalayalamRoutes);
app.use('/api/malayalam-english', malayalamEnglishRoutes);
app.use('/api/synonyms', malayalamSynonymRoutes);
app.use('/api/pronounce', audioRoutes);
app.use('/api/speech-to-text', speechRoutes);

// ------------------------------------------------------------
// 1. DATABASE CONNECTIVITY LOGS
// ------------------------------------------------------------
console.log('🔄 [System] Initializing database connection sequence...');

connectDB()
  .catch((err) => {
    console.error('❌ [Database] Connection failure during startup sequence!');
    console.error(`Reason: ${err.message}`);
    process.exit(1);
  });

// Monitor running connection states dynamically
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ [Database] Connection dropped. Attempting automated reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error(`🚨 [Database] Runtime exception encountered: ${err.message}`);
});

// ------------------------------------------------------------
// 2. SERVER PORT BOUNDARY LOGS
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 [Server] Environment running in mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 [Server] Microservice listening for frontend calls on port: ${PORT}`);
  console.log(`📍 [Server] Test local active endpoints at: http://localhost:${PORT}/api/words/browse?letter=A`);
});