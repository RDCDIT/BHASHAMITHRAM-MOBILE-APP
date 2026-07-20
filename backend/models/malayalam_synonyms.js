const mongoose = require('mongoose');

const SynonymSchema = new mongoose.Schema({
  // Collection holds mixed _id types: numeric ids (MySQL migration) and
  // ObjectIds (direct JSON uploads). Mixed type + no default prevents
  // Mongoose from casting incoming numeric ids to ObjectId.
  _id: {
    type: mongoose.Schema.Types.Mixed,
  },
  word: { type: String, required: true, unique: true, index: true },
  synonyms: { type: Array }
}, {
  timestamps: true,
  collection: "Malayalam_Synonyms",
  id: false, // disable virtual id getter — _id is Mixed, not ObjectId
});

module.exports = mongoose.model('Malayalam_Synonyms', SynonymSchema);
