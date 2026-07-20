/**
 * @file malayalam_malayalamcontroller.js
 * @description Controller actions for Malayalam-Malayalam dictionary operations.
 */

const MalayalamMalayalamDictionary = require("../models/malayalam_malayalam_dictionary");
const { idQuery } = require("../utils/idQuery");

/**
 * Utility helper to parse and clean raw query entries into flat arrays of strings.
 * 
 * @param {string|string[]} input - Raw database array or text to parse.
 * @returns {string[]} Formatted clean strings list.
 */
const parseStringArray = (input) => {
  if (Array.isArray(input)) {
    return input.flat(Infinity)
                .map(s => typeof s === 'string' ? s.trim() : String(s).trim())
                .filter(s => s.length > 0);
  }
  if (typeof input === 'string') {
    return input.split(/,|\n|\r/)
                .map(s => s.trim())
                .filter(s => s.length > 0);
  }
  return [];
};

// Get all words
/**
 * Fetches all Malayalam words sorted alphabetically.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.getAllWords = async (req, res) => {
  try {
    const words = await MalayalamMalayalamDictionary.find({})
      .sort({ word: 1 })
      .select('_id word meanings')
      .limit(1000)
      .lean();

    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get word details
/**
 * Gets a Malayalam word details entry and structures categories, synonyms, inflections, and related items.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.getWordById = async (req, res) => {
  try {
    // Collections hold mixed numeric/ObjectId _id values — match either form
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid word ID." });
    }

    const word = await MalayalamMalayalamDictionary.findOne(query);

    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Word not found",
      });
    }

    res.status(200).json(word);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search word
/**
 * Searches Malayalam words by matching queries case-insensitively with a limit of 50.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.searchWord = async (req, res) => {
  try {
    const { q } = req.query;

    const words = await MalayalamMalayalamDictionary.find({
      word: { $regex: q, $options: 'i' }
    })
    .limit(50)
    .lean();

    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create word
/**
 * Creates a new Malayalam word document in the dictionary collection.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.createWord = async (req, res) => {
  try {
    const word = await MalayalamMalayalamDictionary.create(req.body);

    res.status(201).json(word);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update word
/**
 * Updates a Malayalam dictionary document's fields by ID.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.updateWord = async (req, res) => {
  try {
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid word ID." });
    }
    const word = await MalayalamMalayalamDictionary.findOneAndUpdate(
      query,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json(word);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete word
/**
 * Deletes a Malayalam dictionary document by ID.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.deleteWord = async (req, res) => {
  try {
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid word ID." });
    }
    await MalayalamMalayalamDictionary.findOneAndDelete(query);

    res.status(200).json({
      success: true,
      message: "Word deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
