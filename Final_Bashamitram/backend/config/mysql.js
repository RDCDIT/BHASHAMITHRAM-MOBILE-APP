/**
 * @file mysql.js
 * @description MySQL Database Connection & ORM Initialization with Sequelize.
 * Replaces MongoDB with high-performance, relational MySQL database management.
 */

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Resolve connection credentials from environment
const DB_HOST = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || process.env.MYSQL_PORT || 3306;
const DB_USER = process.env.DB_USER || process.env.MYSQL_USER || 'root';
const DB_PASS = process.env.DB_PASS !== undefined ? process.env.DB_PASS : (process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : '');
const DB_NAME = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'bhashamithram_db';

let sequelize;

if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  sequelize = new Sequelize(connectionUrl, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

// -------------------------------------------------------------
// MySQL Model Definitions
// -------------------------------------------------------------

// 1. Suggested Words Table
const SuggestedWord = sequelize.define('SuggestedWord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  word: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  meaning: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  language_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'malayalam',
  },
  root: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  etymology: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cultural_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  synonyms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  antonyms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  dialects: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  proverb: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  similar_word: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  novel_words: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cross_reference: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  inflections: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  phonetic_transcription: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  pronunciation: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  equivalents_kannada: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  equivalents_tamil: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  equivalents_telugu: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  equivalents_tulu: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  equivalents_english: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  equivalent_languages: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contributor_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  contributor_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  receive_emails: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  },
  superuser_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  meanings_json: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  security_content_hash: {
    type: DataTypes.STRING(128),
    allowNull: true,
  },
  security_signature_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'suggested_words',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
});

// 2. Dataview Suggestions Table (Contributor Log)
const DataviewSuggestion = sequelize.define('DataviewSuggestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  word_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  word: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  submitted_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  receive_emails: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'dataview_suggestions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
});

// 3. Dataview Collection Table
const DataviewCollection = sequelize.define('DataviewCollection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  word: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'dataview_collection',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
});

// 4. Dictionary Table (Relational Dictionary Lookups)
const Dictionary = sequelize.define('Dictionary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  word: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  meaning: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  english_equivalent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tamil_equivalent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  kannada_equivalent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  telugu_equivalent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tulu_equivalent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  context_usage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approved: {
    type: DataTypes.STRING(10),
    defaultValue: '0',
  },
  superuser_approved: {
    type: DataTypes.STRING(10),
    defaultValue: '0',
  },
  gender: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  root: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phonetic_transcription: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  proverb: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  synonyms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'dictionary',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
});

let isConnected = false;

/**
 * Connects to MySQL and synchronizes all application tables.
 */
async function connectMySQL() {
  try {
    await sequelize.authenticate();
    console.log(`✅ [MySQL] Successfully connected to MySQL database: ${DB_NAME} at ${DB_HOST}:${DB_PORT}`);
    
    // Automatically create tables if they do not exist
    await sequelize.sync({ alter: false });
    console.log('✅ [MySQL] Database tables synchronized (suggested_words, dataview_suggestions, dictionary).');
    isConnected = true;
    return true;
  } catch (error) {
    console.warn(`⚠️ [MySQL] Could not connect to MySQL server: ${error.message}`);
    console.warn('💡 [MySQL Info] To connect MySQL: configure DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env');
    console.warn('💡 [MySQL Fallback] Operating in Resilient Offline Queue Mode.');
    isConnected = false;
    return false;
  }
}

function getMySQLStatus() {
  return isConnected;
}

module.exports = {
  sequelize,
  connectMySQL,
  getMySQLStatus,
  SuggestedWord,
  DataviewSuggestion,
  DataviewCollection,
  Dictionary,
};
