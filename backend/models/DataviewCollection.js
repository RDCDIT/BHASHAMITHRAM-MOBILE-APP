const mongoose = require('mongoose');

const dataviewCollectionSchema = new mongoose.Schema({
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
  }
}, {
  collection: 'Dataview_collection',
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

module.exports = mongoose.model('DataviewCollection', dataviewCollectionSchema);
