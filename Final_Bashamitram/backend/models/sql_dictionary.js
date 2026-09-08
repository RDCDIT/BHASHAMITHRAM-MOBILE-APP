const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const SQLDictionary = sequelize.define('Dictionary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  word: {
    type: DataTypes.STRING,
    allowNull: false
  },
  english_equivalent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tamil_equivalent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  kannada_equivalent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telugu_equivalent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tulu_equivalent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meaning: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  context_usage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved: {
    type: DataTypes.STRING,
    defaultValue: "0"
  },
  superuser_approved: {
    type: DataTypes.STRING,
    defaultValue: "0"
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  root: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phonetic_transcription: {
    type: DataTypes.STRING,
    allowNull: true
  },
  proverb: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  synonyms: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'dictionary',
  timestamps: false // The JSON shows created_at etc, but let's ignore timestamps for now to avoid mapping issues
});

module.exports = SQLDictionary;
