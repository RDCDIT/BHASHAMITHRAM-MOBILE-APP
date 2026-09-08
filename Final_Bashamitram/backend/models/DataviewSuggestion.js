const mongoose = require('mongoose');

const dataviewSuggestionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  word: {
    type: String,
    required: true,
    trim: true
  },
  submitted_text: {
    type: String,
    trim: true
  },
  wordId: {
    type: Number,
    required: true
  },
  receive_emails: {
    type: Boolean,
    default: false
  }
}, {
  collection: 'DataviewSuggestions',
  timestamps: true
});

module.exports = mongoose.model('DataviewSuggestion', dataviewSuggestionSchema);
