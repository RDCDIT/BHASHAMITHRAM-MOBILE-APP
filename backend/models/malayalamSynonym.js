const mongoose = require("mongoose");

const MalayalamSynonymSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    synonyms: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Search Indexes
MalayalamSynonymSchema.index({
  word: "text",
  synonyms: "text",
});

module.exports = mongoose.model(
  "MalayalamSynonym",
  MalayalamSynonymSchema
);