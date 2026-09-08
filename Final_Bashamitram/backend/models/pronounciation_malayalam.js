const mongoose = require("mongoose");

const malayalamPronunciationSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    Pronounciation: {
      type: Buffer, // Stored as BSON Binary in MongoDB
      required: true,
    },
  },
  {
    collection: "malayalam_pronounciation",
    versionKey: false,
  }
);

module.exports = mongoose.model(
  "malayalam_pronounciation",
  malayalamPronunciationSchema
);