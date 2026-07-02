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
      default: "",
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

const MalayalamEnglishDictionarySchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
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

    Gender: {
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

    images: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "Malayalam_English_Dictionary",
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MalayalamEnglishDictionary",
  MalayalamEnglishDictionarySchema
);