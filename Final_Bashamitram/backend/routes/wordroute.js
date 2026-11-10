/**
 * @file wordroute.js
 * @description Express API routes for word suggestions, browsing, and details using MySQL and local fallback.
 */

const express = require("express");
const router = express.Router();
const { Dictionary, getMySQLStatus, sequelize } = require("../config/mysql");
const { Op } = require("sequelize");

const {
  suggestWord,
  getSuggestions,
  saveDataviewCollection,
  getDataviewCollection,
} = require("../controllers/suggest_word");

// GET /api/words/browse-malayalam?query=...
router.get("/browse-malayalam", async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/browse-malayalam | Query: "${query || ''}"`);

  try {
    let formattedList = [];

    if (getMySQLStatus()) {
      try {
        const whereClause = {
          word: { [Op.ne]: "" },
        };
        if (query && query.trim() !== "") {
          whereClause.word = { [Op.like]: `${query.trim()}%` };
        }

        const rows = await Dictionary.findAll({
          where: whereClause,
          attributes: ['id', 'word', 'meaning', 'english_equivalent'],
          order: [['word', 'ASC']],
          limit: 200,
        });

        formattedList = rows.map((r) => ({
          _id: r.id,
          id: r.id,
          word: r.word,
          english_equivalent: r.english_equivalent || "",
          primary_malayalam_meaning: r.meaning || "",
        }));
      } catch (err) {
        console.warn("MySQL browse error, using fallback:", err.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [MySQL/Local] Retrieved ${formattedList.length} documents. Processed in ${duration}ms.`);
    return res.status(200).json(formattedList);
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to retrieve Malayalam list:`, err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/words/browse-synonyms?query=...
router.get("/browse-synonyms", async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  try {
    let formattedList = [];

    if (getMySQLStatus()) {
      try {
        const whereClause = {
          synonyms: { [Op.ne]: null },
        };
        if (query && query.trim() !== "") {
          whereClause.word = { [Op.like]: `${query.trim()}%` };
        }

        const rows = await Dictionary.findAll({
          where: whereClause,
          attributes: ['id', 'word', 'synonyms'],
          order: [['word', 'ASC']],
          limit: 200,
        });

        formattedList = rows.map((r) => ({
          _id: r.id,
          id: r.id,
          word: r.word,
          synonyms: r.synonyms || "",
        }));
      } catch (err) {
        console.warn("MySQL browse synonyms error:", err.message);
      }
    }

    return res.status(200).json(formattedList);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/words/details/:id
router.get("/details/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Word ID parameter is required." });
  }

  try {
    let wordDetails = null;

    if (getMySQLStatus()) {
      try {
        const row = await Dictionary.findByPk(id);
        if (row) {
          wordDetails = row.toJSON();
        }
      } catch (err) {
        console.warn("MySQL details error:", err.message);
      }
    }

    if (!wordDetails) {
      return res.status(404).json({ message: "Word details not found." });
    }

    return res.status(200).json({
      ...wordDetails,
      _id: wordDetails.id,
      meanings: [{ id: 1, meaning: wordDetails.meaning || "" }],
      proverbs: wordDetails.proverb ? [{ id: 1, proverb: wordDetails.proverb }] : [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Suggestions and Dataview routes (Full MySQL Implementation)
router.get("/suggestions", getSuggestions);
router.post("/suggest", suggestWord);
router.post("/dataview", saveDataviewCollection);
router.get("/dataview", getDataviewCollection);

module.exports = router;
