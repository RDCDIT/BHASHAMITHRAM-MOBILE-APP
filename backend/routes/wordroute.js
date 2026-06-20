const express = require("express");
const router = express.Router();
const EnglishMalayalam = require("../models/englishmalayalam");
const { getEnglishMasterList } = require("../controllers/dictionary_word");
const { getEnglishMasterList: getEnglishMasterListNew } = require("../controllers/english_wordscontroller");
const { suggestWord, getSuggestions, saveDataviewCollection, getDataviewCollection } = require("../controllers/suggest_word");

// GET /api/words/browse?letter=A - Fetch words filtered by starting letter
router.get("/browse", getEnglishMasterList);

// GET /api/words/browse-english?query=... - Fetch English words starting with query
router.get("/browse-english", getEnglishMasterListNew);

// GET /api/words/suggestions - Fetch all suggested words with contributor info
router.get("/suggestions", getSuggestions);

// POST /api/words/suggest - Submit a suggested word
router.post("/suggest", suggestWord);

// POST /api/words/dataview - Submit record to Dataview_collection
router.post("/dataview", saveDataviewCollection);

// GET /api/words/dataview - Get all records from Dataview_collection
router.get("/dataview", getDataviewCollection);

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