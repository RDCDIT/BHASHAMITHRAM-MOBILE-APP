/**
 * @file english_malayalam_controller.js
 * @description Express controller actions handling operations for english_malayalam_controller.
 */


/**
 * @file english_malayalam_controller.js
 * @description Express controller actions handling CRUD operations and queries for the English-Malayalam dictionary.
 */

const EnglishMalayalamDictionary = require(
  "../models/english_malayalam_dictionary"
);
const { idQuery } = require("../utils/idQuery");

// Browse / Search
/**
 * Fetches and filters English words starting with a search query, with their Malayalam meanings.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.query - URL query parameters.
 * @param {string} req.query.query - Query string to filter words (starts-with match).
 * @param {Object} res - Express response object.
 */
exports.browseEnglishWords = async (req, res) => {
  try {
    const { query = "" } = req.query;
    const { searchSqliteWords } = require("../config/dbService");
    let words = [];

    const mongoose = require("mongoose");
    try {
      if (mongoose.connection.readyState === 1) {
        const filter = query && query.trim()
          ? { word: { $regex: "^" + query.trim(), $options: "i" } }
          : {};

        words = await EnglishMalayalamDictionary.find(filter)
          .select("_id word Category meanings")
          .sort({ word: 1 });
      }
    } catch (err) {
      console.warn("MongoDB query failed, falling back to SQLite:", err.message);
    }

    if (!words || words.length === 0) {
      words = await searchSqliteWords("english_malayalam", query || "a");
    }

    const formattedWords = (words || []).map(item => {
      let meaningsList = [];

      if (Array.isArray(item.Category)) {
        item.Category.forEach(c => {
          const text = c.meanings || c.meaning || '';
          if (text.trim()) {
            meaningsList.push({
              meaning: text,
              context_usage: c.context_usage || c.context || ''
            });
          }
        });
      }

      if (meaningsList.length === 0 && Array.isArray(item.meanings)) {
        item.meanings.forEach(m => {
          const text = typeof m === 'string' ? m : (m.meaning || '');
          if (text.trim()) {
            meaningsList.push({
              meaning: text,
              context_usage: typeof m === 'object' ? (m.context_usage || '') : ''
            });
          }
        });
      }

      if (meaningsList.length === 0 && item.meaning && item.meaning.trim()) {
        meaningsList.push({
          meaning: item.meaning.trim(),
          context_usage: ''
        });
      }

      return {
        _id: item._id || item.id,
        id: item._id || item.id,
        word: item.word || '',
        meanings: meaningsList
      };
    });

    res.status(200).json(formattedWords);
  } catch (error) {
    console.error("Browse English Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Details
/**
 * Retrieves detailed dictionary entry record (including proverbs and categories) for a specific word ID.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.params - URL route parameters.
 * @param {string} req.params.id - Unique ID of the dictionary entry.
 * @param {Object} res - Express response object.
 */
exports.getWordDetails = async (req, res) => {
  try {
    // Collections hold mixed numeric/ObjectId _id values — match either form
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid word ID." });
    }

    const word = await EnglishMalayalamDictionary.findOne(query);

    if (!word) {
      return res.status(404).json({ success: false, message: "Word not found" });
    }

    const categoryValue = word.Category || word.category || [];
    const formattedCategories = Array.isArray(categoryValue)
      ? categoryValue.map((cat, categoryIndex) => ({
          id: categoryIndex + 1,
          category: cat.category || "",
          meanings: cat.meanings || cat.meaning || "",
          context: cat.context || cat.context_usage || "",
        }))
      : [];

    if (formattedCategories.length === 0 && word.meanings && word.meanings.length > 0) {
      word.meanings.forEach((m, idx) => {
        formattedCategories.push({
          id: idx + 1,
          category: "",
          meanings: m.meaning || "",
          context: m.context_usage || ""
        });
      });
    }

    const formattedWord = {
      ...word.toObject(),
      _id: word._id,
      id: word._id,
      gender: word.gender || word.Gender || "",
      categories: formattedCategories,
      proverbs: (word.proverbs || []).map((p, index) => ({
        id: index + 1,
        proverb: p.proverb,
        context_usage: p.context_usage || "",
      })),
    };

    res.status(200).json(formattedWord);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create
/**
 * Creates and stores a new English-Malayalam word entry in the database.
 * 
 * @param {Object} req - Express request object containing word data in body.
 * @param {Object} res - Express response object.
 */
exports.createWord = async (req, res) => {
  try {
    const word = await EnglishMalayalamDictionary.create(
      req.body
    );

    res.status(201).json(word);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update
/**
 * Updates an existing English-Malayalam word entry by its unique ID.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.params.id - ID of the word to update.
 * @param {Object} req.body - Object containing fields to update.
 * @param {Object} res - Express response object.
 */
exports.updateWord = async (req, res) => {
  try {
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid word ID." });
    }
    const word =
      await EnglishMalayalamDictionary.findOneAndUpdate(
        query,
        req.body,
        { new: true }
      );

    res.status(200).json(word);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete
/**
 * Deletes a word entry from the English-Malayalam dictionary by ID.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.params.id - ID of the word to delete.
 * @param {Object} res - Express response object.
 */
exports.deleteWord = async (req, res) => {
  try {
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid word ID." });
    }
    await EnglishMalayalamDictionary.findOneAndDelete(query);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

