/**
 * @file malayalam-malayalam.js
 * @description Express API routes routing definitions for malayalam-malayalam.
 */

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
    let searchQuery = { word: { $exists: true, $ne: "" } };

    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      // "അ" must not match "അം" (anusvara); all other letters use prefix match
      searchQuery.word = trimmedQuery === 'അ'
        ? { $regex: '^അ(?!ം)', $options: 'i' }
        : { $regex: `^${trimmedQuery}`, $options: 'i' };
    }

    // No artificial limit — return ALL words matching the letter/query
    const words = await MalayalamMalayalamDictionary.find(searchQuery)
      .sort({ word: 1 })
      .select('_id word meanings images')
      .lean();

    // Strip any remaining empty-word artifact rows from the source DB
    const filtered = words.filter(w => w.word && w.word.trim().length > 0);

    res.status(200).json(filtered);
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", searchWord);

router.get("/:id", getWordById);

router.post("/", createWord);

router.put("/:id", updateWord);

router.delete("/:id", deleteWord);

module.exports = router;

