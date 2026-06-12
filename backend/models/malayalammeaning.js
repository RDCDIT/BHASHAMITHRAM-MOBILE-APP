const mongoose = require("mongoose");

const MalayalamCharacterSchema = new mongoose.Schema(
  {
    character: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    pronunciation: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Search Indexes
MalayalamCharacterSchema.index({
  character: "text",
  pronunciation: "text",
  description: "text",
});

module.exports = mongoose.model(
  "MalayalamCharacter",
  MalayalamCharacterSchema
);