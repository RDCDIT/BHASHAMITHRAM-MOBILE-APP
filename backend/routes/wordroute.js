const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const MalayalamMalayalamDictionary = require("../models/malayalam_malayalam_dictionary");
const EnglishDictionary = require("../models/english-english-dictionary");

const {
  suggestWord,
  getSuggestions,
  saveDataviewCollection,
  getDataviewCollection,
} = require("../controllers/suggest_word");

const MALAYALAM_ALPHABET = [
  "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "അം",
  "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ",
  "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന",
  "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ",
  "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
];

// GET /api/words/browse-malayalam?query=...
router.get("/browse-malayalam", async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/browse-malayalam | Query: "${query || 'undefined'}"`);

  try {
    const searchCriteria = {
      $or: [
        { 'status.approved': true },
        { 'status': { $exists: false } }
      ]
    };
    if (query && query.trim() !== '') {
      const trimmedQuery = query.trim();
      const searchRegex = trimmedQuery === 'അ' 
        ? new RegExp('^അ(?!ം)', 'i') 
        : new RegExp(`^${trimmedQuery}`, 'i');
      searchCriteria.word = searchRegex;
    }
    
    const list = await MalayalamMalayalamDictionary.find(
      searchCriteria,
      { _id: 1, equivalents: 1, word: 1, meanings: 1 }
    ).sort({ word: 1 });

    const formattedList = list.map(item => ({
      _id: item._id,
      id: item._id,
      english_equivalent: item.equivalents?.english || '',
      word: item.word,
      primary_malayalam_meaning: item.meanings?.[0]?.meaning || ''
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved ${formattedList.length} documents matching query "${query || ''}".`);
    return res.status(200).json(formattedList);
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to retrieve Malayalam master list:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/words/browse-synonyms?query=...
router.get("/browse-synonyms", async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/browse-synonyms | Query: "${query || 'undefined'}"`);

  try {
    const searchCriteria = { 
      $or: [
        { 'status.approved': true },
        { 'status': { $exists: false } }
      ],
      synonyms: { $exists: true, $ne: [] } 
    };
    if (query && query.trim() !== '') {
      const trimmedQuery = query.trim();
      const searchRegex = trimmedQuery === 'അ'
        ? new RegExp('^അ(?!ം)', 'i')
        : new RegExp(`^${trimmedQuery}`, 'i');
      searchCriteria.word = searchRegex;
    }

    const list = await MalayalamMalayalamDictionary.find(
      searchCriteria,
      { _id: 1, word: 1, synonyms: 1 }
    ).sort({ word: 1 });

    const formattedList = list.map(item => ({
      _id: item._id,
      id: item._id,
      word: item.word,
      synonyms: Array.isArray(item.synonyms) ? item.synonyms.join(", ") : item.synonyms
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved ${formattedList.length} synonym documents matching query "${query || ''}".`);
    return res.status(200).json(formattedList);
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to retrieve Malayalam synonyms list:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/words/browse-nanaarth?query=...
router.get("/browse-nanaarth", async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/browse-nanaarth | Query: "${query || 'undefined'}"`);

  try {
    const searchCriteria = {
      $or: [
        { 'status.approved': true },
        { 'status': { $exists: false } }
      ],
      'meanings.1': { $exists: true } // word has multiple meanings
    };

    if (query && query.trim() !== '') {
      const trimmedQuery = query.trim();
      const searchRegex = trimmedQuery === 'അ'
        ? new RegExp('^അ(?!ം)', 'i')
        : new RegExp(`^${trimmedQuery}`, 'i');
      searchCriteria.word = searchRegex;
    }

    const list = await MalayalamMalayalamDictionary.find(
      searchCriteria,
      { _id: 1, word: 1, meanings: 1 }
    ).sort({ word: 1 });

    const formattedList = list.map(item => ({
      _id: item._id,
      id: item._id,
      word: item.word,
      meanings: item.meanings || []
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved ${formattedList.length} nanaarth documents matching query "${query || ''}".`);
    return res.status(200).json(formattedList);
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to retrieve Malayalam nanaarth list:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/words/details/:id
router.get("/details/:id", async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  const { type } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/details | Word ID: "${id}" | Type: "${type || 'malayalam'}"`);

  if (!id) {
    return res.status(400).json({ message: "Word ID parameter is required." });
  }

  try {
    let wordDetails;
    let categoryNames = [];

    if (type === 'english') {
      wordDetails = await EnglishDictionary.findOne({ 
        _id: Number(id), 
        $or: [
          { 'status.approved': true },
          { 'status': { $exists: false } }
        ]
      });
      if (wordDetails) {
        const categoryIds = wordDetails.categories || [];
        if (categoryIds.length > 0) {
          try {
            const categoriesList = await mongoose.connection.db.collection('Category_english')
              .find({ _id: { $in: categoryIds.map(Number) } })
              .toArray();
            categoryNames = categoriesList.map(c => c.category);
          } catch (err) {
            console.error("Failed to fetch Category_english:", err);
          }
        }
      }
    } else {
      const queryId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
      wordDetails = await MalayalamMalayalamDictionary.findOne({ 
        _id: queryId, 
        $or: [
          { 'status.approved': true },
          { 'status': { $exists: false } }
        ]
      });
      if (wordDetails && wordDetails.category) {
        categoryNames = [wordDetails.category];
      }
    }

    if (!wordDetails) {
      return res.status(404).json({ message: "Word details not found." });
    }



    const formattedDetails = {
      ...wordDetails.toObject(),
      _id: wordDetails._id,
      id: wordDetails._id,
      category_names: categoryNames,
      meanings: (wordDetails.meanings || []).map((m, idx) => ({
        id: idx + 1,
        meaning: m.meaning,
        context_usage: m.context_usage
      })),
      proverbs: (wordDetails.proverbs || []).map((p, idx) => ({
        id: idx + 1,
        proverb: p.proverb,
        context_usage: p.context_usage
      }))
    };

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved details for "${wordDetails.word}". Processed in ${duration}ms.`);
    return res.status(200).json(formattedDetails);
  } catch (error) {
    console.error(`🚨 [Execution Error] Failed to retrieve full word details:`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Suggestions and Dataview routes
router.get("/suggestions", getSuggestions);
router.post("/suggest", suggestWord);
router.post("/dataview", saveDataviewCollection);
router.get("/dataview", getDataviewCollection);

module.exports = router;
