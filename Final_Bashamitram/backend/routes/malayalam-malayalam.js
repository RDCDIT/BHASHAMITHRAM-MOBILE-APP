/**
 * @file malayalam-malayalam.js
 * @description Express API routes routing definitions for malayalam-malayalam.
 */

const express = require("express");
const router = express.Router();
const MalayalamMalayalamDictionary = require("../models/malayalam_malayalam_dictionary");
const { searchSqliteWords } = require('../config/dbService');

const {
  getAllWords,
  getWordById,
  searchWord,
  createWord,
  updateWord,
  deleteWord,
} = require("../controllers/malayalam_malayalamcontroller");

router.get("/", getAllWords);

router.get("/browse-malayalam", async (req, res) => {
  const { query } = req.query;
  try {
    let words = [];
    try {
      let searchQuery = { word: { $exists: true, $ne: "" } };

      if (query && query.trim() !== "") {
        const trimmedQuery = query.trim();
        searchQuery.word = trimmedQuery === 'അ'
          ? { $regex: '^അ(?!ം)', $options: 'i' }
          : { $regex: `^${trimmedQuery}`, $options: 'i' };
      }

      words = await MalayalamMalayalamDictionary.find(searchQuery)
        .sort({ word: 1 })
        .select('_id word meanings images')
        .lean();
    } catch (err) {
      console.warn('MongoDB query failed, falling back to SQLite:', err.message);
    }

    if (!words || words.length === 0) {
      words = await searchSqliteWords('malayalam_malayalam', query || 'അ');
    }

    const filtered = (words || []).filter(w => w.word && w.word.trim().length > 0);
    res.status(200).json(filtered);
  } catch (error) {
    console.error('Browse Error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", searchWord);

router.get("/:id", getWordById);

router.post("/", createWord);

router.put("/:id", updateWord);

router.delete("/:id", deleteWord);

module.exports = router;
