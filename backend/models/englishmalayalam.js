const mongoose = require('mongoose');

const dictionarySchema = new mongoose.Schema({
  _id: { 
    type: Number, 
    required: true 
  },
  word: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  phonetic_transcription: { type: String, trim: true },
  root: { type: String, trim: true },
  etymology: { type: String, trim: true },
  cultural_note: { type: String, trim: true },
  synonyms: { type: String, trim: true },
  antonyms: { type: String, trim: true },
  dialects: { type: String, trim: true },
  proverb: { type: String, trim: true },
  similar_word: { type: String, trim: true },
  novel_words: { type: String, trim: true },
  pronunciation: { type: String, trim: true },
  cross_reference: { type: String, trim: true },
  inflections: { type: String, trim: true },
  
  equivalents: {
    kannada: { type: String, trim: true },
    tamil: { type: String, trim: true },
    telugu: { type: String, trim: true },
    tulu: { type: String, trim: true },
    english: { type: String, trim: true, index: true }
  },
  
  status: {
    approved: { type: Boolean, default: false, index: true },
    superuser_approved: { type: Boolean, default: false },
    done_by_user: { type: Boolean, default: false }
  },
  
  metadata: mongoose.Schema.Types.Mixed,
  categories: [Number],
  images: [String],
  meanings: [{
    id: Number,
    meaning: String,
    context_usage: String,
    category_id: Number
  }],
  proverbs: [{
    id: Number,
    proverb: String,
    context_usage: String
  }]
}, {
  collection: 'dictionary',
  timestamps: true
});

// Compound Index: Accelerates browsing English characters alphabetically for approved entries
dictionarySchema.index({ 'equivalents.english': 1, 'status.approved': 1 });

module.exports = mongoose.model('Dictionary', dictionarySchema);