const Dictionary = require('../models/malayalam_english_dictionary');

// @desc    Get all dictionary entries (with optional search filter & pagination)
// @route   GET /api/dictionary
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
const getWordById = async (req, res) => {
  try {
    const queryId = !isNaN(Number(req.params.id)) ? Number(req.params.id) : req.params.id;
    const wordEntry = await Dictionary.findById(queryId);
    if (!wordEntry) {
      return res.status(404).json({ message: 'Word not found' });
    }
    
    const categoryVal = wordEntry.category || wordEntry.Category;
    const categoryNames = categoryVal ? [categoryVal] : [];
    const genderVal = wordEntry.gender || wordEntry.Gender;

    const formattedWord = {
      ...wordEntry.toObject(),
      _id: wordEntry._id,
      id: wordEntry._id,
      gender: genderVal || '',
      category_names: categoryNames,
      meanings: (wordEntry.meanings || []).map((m, idx) => ({
        id: idx + 1,
        meaning: m.meaning,
        context_usage: m.context_usage
      })),
      proverbs: (wordEntry.proverbs || []).map((p, idx) => ({
        id: idx + 1,
        proverb: p.proverb,
        context_usage: p.context_usage
      }))
    };

    res.status(200).json(formattedWord);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Browse dictionary entries with prefix / letter filter
// @route   GET /api/dictionary/browse-malayalam
const browseMalayalamWords = async (req, res) => {
  try {
    const { query = "" } = req.query;
    const filter = {};
    
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      const isEnglish = /^[A-Za-z]/.test(trimmedQuery);
      if (isEnglish) {
        filter['meanings.meaning'] = { $regex: trimmedQuery, $options: 'i' };
      } else {
        const searchRegex = trimmedQuery === "അ"
          ? new RegExp("^അ(?!ം)", "i")
          : new RegExp("^" + trimmedQuery, "i");
        filter.word = searchRegex;
      }
    }

    const words = await Dictionary.find(filter)
      .select("word meanings")
      .sort({ word: 1 });

    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new dictionary entry
// @route   POST /api/dictionary
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
const updateWord = async (req, res) => {
  try {
    const updatedWord = await Dictionary.findByIdAndUpdate(
      req.params.id,
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
const deleteWord = async (req, res) => {
  try {
    const deletedWord = await Dictionary.findByIdAndDelete(req.params.id);
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