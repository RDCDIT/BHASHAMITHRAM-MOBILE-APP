/**
 * @file malayalam_english_controllers.js
 * @description Controller actions for Malayalam-English dictionary entries.
 */

const Dictionary = require('../models/malayalam_english_dictionary');
const { idQuery } = require('../utils/idQuery');

// @desc    Get all dictionary entries (with optional search filter & pagination)
// @route   GET /api/dictionary
/**
 * Retrieves a list of Malayalam-English dictionary entries with pagination and queries.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const getWords = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const query = {};

    // Fuzzy search for Malayalam word or English meaning
    if (search) {
      query.$or = [
        { word: { $regex: search, $options: 'i' } },
        { 'meanings.meaning': { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.Category = category;
    }

    const words = await Dictionary.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Dictionary.countDocuments(query);

    res.status(200).json({
      words,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalEntries: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single entry by ID
// @route   GET /api/dictionary/:id
/**
 * Retrieves a single Malayalam-English word details structure by ID.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const getWordById = async (req, res) => {
  try {
    // Collections hold mixed numeric/ObjectId _id values — match either form
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ message: "Invalid word ID." });
    }

    const word = await Dictionary.findOne(query);

    if (!word) {
      return res.status(404).json({ message: "Word not found" });
    }

    res.status(200).json(word);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Browse dictionary entries with prefix / letter filter
// @route   GET /api/dictionary/browse-malayalam
/**
 * Searches and lists words starting with a character/query prefix.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const browseMalayalamWords = async (req, res) => {
  try {
    const { query = "" } = req.query;
    const { searchSqliteWords } = require('../config/dbService');
    let words = [];

    const mongoose = require("mongoose");
    try {
      if (mongoose.connection.readyState === 1) {
        let searchQuery = { word: { $exists: true, $ne: "" } };

        if (query && query.trim() !== "") {
          const trimmedQuery = query.trim();
          const isEnglish = /^[A-Za-z]/.test(trimmedQuery);

          if (isEnglish) {
            searchQuery = { 'meanings.meaning': { $regex: `^${trimmedQuery}`, $options: 'i' } };
          } else {
            searchQuery.word = trimmedQuery === 'അ'
              ? { $regex: '^അ(?!ം)', $options: 'i' }
              : { $regex: `^${trimmedQuery}`, $options: 'i' };
          }
        }

        words = await Dictionary.find(searchQuery)
          .sort({ word: 1 })
          .select('_id word meanings images')
          .lean();
      }
    } catch (err) {
      console.warn('MongoDB query failed, falling back to SQLite:', err.message);
    }

    if (!words || words.length === 0) {
      words = await searchSqliteWords('malayalam_english', query || 'അ');
    }

    const filtered = (words || []).filter(w => w.word && w.word.trim().length > 0);
    res.status(200).json(filtered);
  } catch (error) {
    console.error('Browse Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new dictionary entry
// @route   POST /api/dictionary
/**
 * Creates a brand new dictionary entry.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const createWord = async (req, res) => {
  try {
    const newWord = new Dictionary(req.body);
    const savedWord = await newWord.save();
    res.status(201).json(savedWord);
  } catch (error) {
    res.status(400).json({ message: 'Validation Error', error: error.message });
  }
};

// @desc    Update a dictionary entry
// @route   PUT /api/dictionary/:id
/**
 * Modifies an existing dictionary entry by ID.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const updateWord = async (req, res) => {
  try {
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ message: 'Invalid word ID.' });
    }
    const updatedWord = await Dictionary.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedWord) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.status(200).json(updatedWord);
  } catch (error) {
    res.status(400).json({ message: 'Update Error', error: error.message });
  }
};

// @desc    Delete a dictionary entry
// @route   DELETE /api/dictionary/:id
/**
 * Removes a dictionary entry from the collection by ID.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const deleteWord = async (req, res) => {
  try {
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ message: 'Invalid word ID.' });
    }
    const deletedWord = await Dictionary.findOneAndDelete(query);
    if (!deletedWord) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.status(200).json({ message: 'Word entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getWords,
  getWordById,
  browseMalayalamWords,
  createWord,
  updateWord,
  deleteWord
};