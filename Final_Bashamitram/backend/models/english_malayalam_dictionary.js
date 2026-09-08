const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    meaning: String,
    meanings: String,
    context: String,
    context_usage: String,
  },
  { _id: false }
);

const MeaningSchema = new mongoose.Schema(
  {
    meaning: {
      type: String,
      required: true,
      trim: true,
    },
    context_usage: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const ProverbSchema = new mongoose.Schema(
  {
    proverb: {
      type: String,
      required: true,
      trim: true,
    },
    context_usage: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const EnglishMalayalamDictionarySchema = new mongoose.Schema(
  {
    // Collection holds mixed _id types: numeric ids (MySQL migration) and
    // ObjectIds (direct JSON uploads). Mixed type + no default prevents
    // Mongoose from casting incoming numeric ids to ObjectId.
    _id: {
      type: mongoose.Schema.Types.Mixed,
    },

    word: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    Category: {
      type: [CategorySchema],
      default: [],
    },

    gender: {
      type: String,
      default: "",
    },

    root: {
      type: String,
      default: "",
    },

    phonetic_transcription: {
      type: String,
      default: "",
    },

    meanings: {
      type: [MeaningSchema],
      default: [],
    },

    proverbs: {
      type: [ProverbSchema],
      default: [],
    },
  },
  {
    collection: "English-malayalam_dictionary",
    timestamps: true,
    id: false, // disable virtual id getter — _id is Mixed, not ObjectId
  }
);

module.exports = mongoose.model(
  "EnglishMalayalamDictionary",
  EnglishMalayalamDictionarySchema
);
