/**
 * @file malayalam_synonym_controller.js
 * @description Controller actions for CRUD and search operations on Malayalam synonyms/thesaurus entries.
 */

const Synonym = require('../models/malayalam_synonyms');
const { idQuery } = require('../utils/idQuery');

// Utility helper to clean and convert comma-separated string inputs into clean string arrays
/**
 * Formats raw synonym input records into flat, clean arrays.
 * 
 * @param {string|string[]} input - Raw synonyms text/data.
 * @returns {string[]} Parsed synonyms list.
 */
const parseSynonyms = (input) => {
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

// @desc    Get all synonyms (with optional query filters & pagination)
// @route   GET /api/synonyms
/**
 * Retrieves lists of Malayalam synonyms matching search filters.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const getSynonyms = async (req, res) => {
  try {
    const { search, page = 1, limit = 500 } = req.query;
    const { searchSqliteWords } = require('../config/dbService');
    const mongoose = require('mongoose');
    let records = [];

    try {
      if (mongoose.connection.readyState === 1) {
        const query = {};
        let isLetterSearch = false;

        if (search && search.trim() !== '') {
          const trimmedSearch = search.trim();
          const MALAYALAM_ALPHABET = [
            "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "അം",
            "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ",
            "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന",
            "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ",
            "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
          ];
          isLetterSearch = MALAYALAM_ALPHABET.includes(trimmedSearch);

          if (isLetterSearch) {
            const searchRegex = trimmedSearch === 'അ'
              ? new RegExp('^അ(?!ം)', 'i')
              : new RegExp(`^${trimmedSearch}`, 'i');
            query.word = searchRegex;
          } else {
            query.$or = [
              { word: { $regex: trimmedSearch, $options: 'i' } },
              { synonyms: { $regex: trimmedSearch, $options: 'i' } }
            ];
          }
        }

        records = isLetterSearch
          ? await Synonym.find(query).sort({ word: 1 }).exec()
          : await Synonym.find(query)
              .limit(Number(limit))
              .skip((Number(page) - 1) * Number(limit))
              .exec();
      }
    } catch (err) {
      console.warn('MongoDB query failed, falling back to SQLite:', err.message);
    }

    if (!records || records.length === 0) {
      const sqliteRecords = await searchSqliteWords('malayalam_thesaurus', search || 'അ');
      records = sqliteRecords.map(item => ({
        _id: item._id,
        word: item.word,
        synonyms: item.meanings ? item.meanings.map(m => m.meaning) : parseSynonyms(item.synonyms)
      }));
    }

    const cleanedRecords = (records || []).map(record => {
      const doc = typeof record.toObject === 'function' ? record.toObject() : record;
      doc.synonyms = parseSynonyms(doc.synonyms);
      return doc;
    });

    res.status(200).json({
      records: cleanedRecords,
      totalPages: 1,
      currentPage: Number(page),
      totalEntries: cleanedRecords.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get synonyms for a specific word by ID
// @route   GET /api/synonyms/:id
/**
 * Retrieves a synonym entry document by ID.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const getSynonymById = async (req, res) => {
  try {
    // Collections hold mixed numeric/ObjectId _id values — match either form
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ message: "Invalid synonym ID." });
    }
    const record = await Synonym.findOne(query);
    if (!record) {
      return res.status(404).json({ message: 'Synonym entry not found' });
    }
    const doc = record.toObject();
    doc.synonyms = parseSynonyms(doc.synonyms);
    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new synonym mapping
// @route   POST /api/synonyms
/**
 * Inserts a new synonym entry into the database.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const createSynonym = async (req, res) => {
  try {
    const { _id, word, synonyms } = req.body;
    
    const formattedSynonyms = parseSynonyms(synonyms);

    const newRecord = new Synonym({
      _id,
      word,
      synonyms: formattedSynonyms
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ message: 'Validation Error', error: error.message });
  }
};

// @desc    Update an existing synonym mapping
// @route   PUT /api/synonyms/:id
/**
 * Updates properties on a specific synonym document.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const updateSynonym = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Format if synonyms field is present in the update payload
    if (updates.synonyms) {
      updates.synonyms = parseSynonyms(updates.synonyms);
    }

    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ message: 'Invalid synonym ID.' });
    }

    const updatedRecord = await Synonym.findOneAndUpdate(
      query,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Synonym entry not found' });
    }
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: 'Update Error', error: error.message });
  }
};

// @desc    Delete a synonym mapping
// @route   DELETE /api/synonyms/:id
/**
 * Deletes a synonym document from the collection by ID.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const deleteSynonym = async (req, res) => {
  try {
    const query = idQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ message: 'Invalid synonym ID.' });
    }
    const deletedRecord = await Synonym.findOneAndDelete(query);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Synonym entry not found' });
    }
    res.status(200).json({ message: 'Synonym entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getSynonyms,
  getSynonymById,
  createSynonym,
  updateSynonym,
  deleteSynonym
};