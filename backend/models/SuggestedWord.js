const mongoose = require('mongoose');

const suggestedWordSchema = new mongoose.Schema({
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
  language_type: {
    type: String,
    trim: true,
    default: "malayalam"
  },
  root: { type: String, trim: true },
  etymology: { type: String, trim: true },
  cultural_note: { type: String, trim: true },
  synonyms: { type: String, trim: true },
  antonyms: { type: String, trim: true },
  dialects: { type: String, trim: true },
  proverb: { type: String, trim: true },
  similar_word: { type: String, trim: true },
  novel_words: { type: String, trim: true },
  cross_reference: { type: String, trim: true },
  inflections: { type: String, trim: true },
  gender: { type: String, trim: true },
  phonetic_transcription: { type: String, trim: true },
  pronunciation: { type: String, trim: true },
  equivalents: {
    kannada: { type: String, trim: true, default: "" },
    tamil: { type: String, trim: true, default: "" },
    telugu: { type: String, trim: true, default: "" },
    tulu: { type: String, trim: true, default: "" },
    english: { type: String, trim: true, default: "" }
  },
  equivalent_languages: [{
    language: { type: String, trim: true },
    translation: { type: String, trim: true }
  }],
  contributor: {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" }
  },
  status: {
    approved: { type: Boolean, default: false },
    superuser_approved: { type: Boolean, default: false },
    done_by_user: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false }
  },
  categories: { type: [Number], default: [] },
  images: { type: [String], default: [] },
  meanings: [{
    id: Number,
    meaning: String,
    context_usage: String
  }],
  proverbs: [{
    id: Number,
    proverb: String,
    context_usage: String
  }]
}, {
  collection: 'Suggested_words',
  timestamps: true
});



module.exports = mongoose.model('SuggestedWord', suggestedWordSchema);
