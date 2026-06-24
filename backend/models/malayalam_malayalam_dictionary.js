
const mongoose = require("mongoose");

const MeaningSchema = new mongoose.Schema(
  {
    meaning: String,
    context_usage: String,
  },
  { _id: false }
);

const ProverbSchema = new mongoose.Schema(
  {
    proverb: String,
    context_usage: String,
  },
  { _id: false }
);

const MalayalamMalayalamDictionarySchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },

    word: {
      type: String,
      required: true,
      index: true,
    },

    category: String,
    Category: String,

    gender: {
      type: String,
    },
    Gender: String,

    root: String,

    phonetic_transcription: String,

    meanings: [MeaningSchema],

    proverbs: [ProverbSchema],

    etymology: String,

    cultural_note: String,

    similar_word: [String],

    novel_words: [String],

    synonyms: [String],

    antonyms: [String],

    dialects: [String],

    cross_reference: [String],

    inflections: String,

    equivalents: {
      english: String,
      tamil: String,
      kannada: String,
      telugu: String,
      tulu: String,
    },

    images: [String],
  },
  {
    timestamps: true,
    collection: "malayalam_malayalam_dictionary",
  }
);

module.exports = mongoose.model(
  "MalayalamMalayalamDictionary",
  MalayalamMalayalamDictionarySchema
);
