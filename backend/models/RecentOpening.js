const mongoose = require("mongoose");

const RecentOpeningSchema = new mongoose.Schema(
  {
    wordId: {
      type: Number,
      required: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
      index: true,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RecentOpening",
  RecentOpeningSchema
);
