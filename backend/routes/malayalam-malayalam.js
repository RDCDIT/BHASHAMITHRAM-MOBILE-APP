
const express = require("express");

const router = express.Router();
const MalayalamMalayalamDictionary = require("../models/malayalam_malayalam_dictionary");

const {
  getAllWords,
  getWordById,
  searchWord,
  createWord,
  updateWord,
  deleteWord,
} = require("../controllers/malayalam_malayalamcontroller"); // Use correct filename

router.get("/", getAllWords);

router.get("/browse-malayalam", async (req, res) => {
  const { query } = req.query;
  try {
    const searchCriteria = { "status.approved": true };
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      const searchRegex = trimmedQuery === "അ"
        ? new RegExp("^അ(?!ം)", "i")
        : new RegExp(`^${trimmedQuery}`, "i");
      searchCriteria.word = searchRegex;
    }
    const words = await MalayalamMalayalamDictionary.find(searchCriteria).sort({ word: 1 });
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", searchWord);

router.get("/:id", getWordById);

router.post("/", createWord);

router.put("/:id", updateWord);

router.delete("/:id", deleteWord);

module.exports = router;

