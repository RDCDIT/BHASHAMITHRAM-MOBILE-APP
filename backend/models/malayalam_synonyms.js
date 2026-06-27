const mongoose = require('mongoose');

const SynonymSchema = new mongoose.Schema({
  _id: { type: Number, required: true }, // Numeric ID from the CSV
  word: { type: String, required: true, unique: true, index: true }, // Index for fast word-based lookups
  synonyms: { type: Array } // Stored as an array of trimmed strings for clean searching
}, { 
  timestamps: true ,
  collection: "Malayalam_Synonyms"
});

module.exports = mongoose.model('Malayalam_Synonyms', SynonymSchema);