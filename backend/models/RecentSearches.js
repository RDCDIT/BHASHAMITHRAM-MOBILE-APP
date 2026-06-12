const mongoose = require("mongoose");

const RecentSearchSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    itemType: {
      type: String,
      enum: [
        "english",
        "character",
        "synonym",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      index: true,
    },

    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Search Index
RecentSearchSchema.index({
  title: "text",
});

module.exports = mongoose.model(
  "RecentSearch",
  RecentSearchSchema
);