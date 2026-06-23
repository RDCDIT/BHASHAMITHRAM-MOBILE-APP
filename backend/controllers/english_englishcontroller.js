const mongoose = require('mongoose');
const EnglishDictionary = require("../models/english-english-dictionary");

// Get all words (or browse with query)
exports.getAllWords = async (req, res) => {
  const { query } = req.query;
  try {
    let searchCriteria = {};
    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(`^${query.trim()}`, "i");
      searchCriteria.word = searchRegex;
    }

    const words = await EnglishDictionary.find(searchCriteria).sort({ word: 1 });

    const formattedList = words.map(item => ({
      id: item._id,
      english_equivalent: item.word || '',
      word: '', // Only English words, no Malayalam Words
      primary_malayalam_meaning: item.meanings?.map(m => m.meaning).filter(Boolean).join(", ") || ''
    }));

    res.status(200).json(formattedList);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get word by id
exports.getWordById = async (req, res) => {
  try {
    const word = await EnglishDictionary.findById(req.params.id);

    if (!word) {
      return res.status(404).json({
        message: "Word not found",
      });
    }

    // Resolve category names from Category_english if needed
    const categoryIds = word.categories || [];
    let categoryNames = [];
    try {
      if (categoryIds.length > 0) {
        const categoriesList = await mongoose.connection.db.collection('Category_english')
          .find({ _id: { $in: categoryIds.map(Number) } })
          .toArray();
        categoryNames = categoriesList.map(c => c.category);
      }
    } catch (dbErr) {
      console.error("Failed to fetch category names:", dbErr);
    }

    const detailsObj = word.toObject ? word.toObject() : word;
    const formattedDetails = {
      ...detailsObj,
      id: detailsObj._id,
      root: detailsObj.root || '',
      gender: detailsObj.gender || '',
      category_names: categoryNames,
      meanings: (detailsObj.meanings || []).map((m, idx) => ({
        id: m.id || idx,
        meaning: m.meaning || '',
        context_usage: m.context_usage || ''
      })),
      proverbs: (detailsObj.proverbs || []).map((p, idx) => ({
        id: p.id || idx,
        proverb: p.proverb || '',
        context_usage: p.context_usage || ''
      }))
    };

    res.status(200).json(formattedDetails);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Search by word
exports.searchWord = async (req, res) => {
  try {
    const { word } = req.query;

    const result = await EnglishDictionary.findOne({
      word: {
        $regex: new RegExp(`^${word}$`, "i"),
      },
    });

    if (!result) {
      return res.status(404).json({
        message: "Word not found",
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Create word
exports.createWord = async (req, res) => {
  try {
    const word = await EnglishDictionary.create(req.body);

    res.status(201).json(word);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Update word
exports.updateWord = async (req, res) => {
  try {
    const word = await EnglishDictionary.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!word) {
      return res.status(404).json({
        message: "Word not found",
      });
    }

    res.status(200).json(word);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete word
exports.deleteWord = async (req, res) => {
  try {
    const word = await EnglishDictionary.findByIdAndDelete(
      req.params.id
    );

    if (!word) {
      return res.status(404).json({
        message: "Word not found",
      });
    }

    res.status(200).json({
      message: "Word deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};