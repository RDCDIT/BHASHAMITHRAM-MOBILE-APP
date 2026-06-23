
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

const EnglishMalayalamDictionarySchema = new mongoose.Schema(
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

    category: String,

    gender: {
      type: String,
      enum: [
        "പുല്ലിംഗം",
        "സ്ത്രീലിംഗം",
        "നപുംസകലിംഗം",
        "ഉഭയലിംഗം",
      ],
    },

    root: String,

    phonetic_transcription: String,

    meanings: [MeaningSchema],

    proverbs: [ProverbSchema],

    images: [String],

    status: {
      superuser_approved: {
        type: Boolean,
        default: false,
      },
      done_by_user: {
        type: Boolean,
        default: false,
      },
    },

    metadata: {
      submitted_by_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      last_edited_by_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      created_at: Date,

      last_edited_at: Date,
    },
  },
  {
    timestamps: true,
    collection: "English-malayalam_dictionary",
  }
);

module.exports = mongoose.model(
  "EnglishMalayalamDictionary",
  EnglishMalayalamDictionarySchema
);
