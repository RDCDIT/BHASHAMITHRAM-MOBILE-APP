const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

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
// 1. DATABASE CONNECTIVITY LOGS
// ------------------------------------------------------------
const { initSqlite } = require('./config/dbService');

// Initialize local SQLite fallback database
initSqlite();

connectDB()
  .then(() => {
    console.log('✅ [Database] MongoDB Atlas connection established successfully.');
  })
  .catch((err) => {
    console.warn('⚠️ [Database] Could not connect to MongoDB Atlas cluster.');
    console.warn(`Reason: ${err.message}`);
    console.warn('💡 [Database] Running in Local SQLite Fallback Mode.');
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 [Server] Environment running in mode: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 [Server] Listening on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile URL: http://192.168.3.148:${PORT}`);
});