const mongoose = require("mongoose");

const englishPronunciationSchema = new mongoose.Schema(
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
    collection: "English_pronounciation",
    versionKey: false,
  }
);

module.exports = mongoose.model(
  "English_pronounciation",
  englishPronunciationSchema
);