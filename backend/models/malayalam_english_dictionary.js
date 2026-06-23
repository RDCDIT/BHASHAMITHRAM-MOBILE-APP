const mongoose = require('mongoose');

// Schema for meanings and context usages
const MeaningSchema = new mongoose.Schema({
  meaning: { type: String, required: true },
  context_usage: { type: String }
});

// Schema for proverbs and context usages
const ProverbSchema = new mongoose.Schema({
  proverb: { type: String },
  context_usage: { type: String }
});

// Main Malayalam-English Dictionary Schema
const DictionarySchema = new mongoose.Schema({
  _id: { type: Number, required: true }, // Using the numeric ID from the CSV
  word: { type: String, required: true, index: true }, // Indexing for faster search
  Category: { type: String },
  Gender: { type: String },
  root: { type: String },
  phonetic_transcription: { type: String },
  meanings: [MeaningSchema],
  proverbs: [ProverbSchema],
  images: [{ type: String }], // Array of image URLs/paths
  status: {
    approved: { type: Boolean, default: false },
    superuser_approved: { type: Boolean, default: false },
    done_by_user: { type: Boolean, default: false }
  },
  metadata: {
    submitted_by_id: { type: Number },
    last_edited_by_id: { type: Number },
    last_edited_at: { type: Date, default: Date.now }
  }
}, { 
  timestamps: true,// Adds createdAt and updatedAt automatic fields
  collection: "Malayalam_English_Dictionary"
});

module.exports = mongoose.model('Malayalam_English_Dictionary', DictionarySchema);