const express = require("express");
const router = express.Router();
const EnglishMalayalam = require("../models/englishmalayalam");
const { getEnglishMasterList } = require("../controllers/dictionary_word");
const { suggestWord } = require("../controllers/suggest_word");

// GET /api/words/browse?letter=A - Fetch words filtered by starting letter
router.get("/browse", getEnglishMasterList);

// POST /api/words/suggest - Submit a suggested word
router.post("/suggest", suggestWord);

// GET /api/words - Get all English to Malayalam entries (legacy endpoint)
router.get("/", async (req, res) => {
  try {
    const entries = await EnglishMalayalam.find().sort({ 'equivalents.english': 1 });
    const formattedEntries = entries.map(item => ({
      ...item.toObject(),
      id: item._id,
      english_equivalent: item.equivalents?.english || '',
      primary_malayalam_meaning: item.meanings?.[0]?.meaning || ''
    }));
    res.json(formattedEntries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;