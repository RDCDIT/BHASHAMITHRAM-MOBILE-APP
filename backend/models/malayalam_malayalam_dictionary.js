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

const EquivalentSchema = new mongoose.Schema(
  {
    tulu: {
      type: String,
      default: "",
    },
    english: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const MalayalamDictionarySchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },

    word: {
      type: String,
      required: true,
      index: true,
      trim: true,
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

    etymology: {
      type: String,
      default: "",
    },

    cultural_note: {
      type: String,
      default: "",
    },

    synonyms: {
      type: [String],
      default: [],
    },

    dialects: {
      type: String,
      default: "",
    },

    inflections: {
      type: String,
      default: "",
    },

    equivalents: {
      type: EquivalentSchema,
      default: {},
    },

    images: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "malayalam_malayalam_dictionary",
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MalayalamMalayalamDictionary",
  MalayalamDictionarySchema
);