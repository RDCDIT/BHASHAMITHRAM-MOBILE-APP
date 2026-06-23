
const MalayalamMalayalamDictionary = require(
  "../models/malayalam_malayalam_dictionary"
);

// Get all words
exports.getAllWords = async (req, res) => {
  try {
    const words = await MalayalamMalayalamDictionary.find()
      .sort({ word: 1 });

    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get word details
exports.getWordById = async (req, res) => {
  try {
    const word = await MalayalamMalayalamDictionary.findById(
      req.params.id
    );

    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Word not found",
      });
    }

    const categoryVal = word.category || word.Category;
    const categoryNames = categoryVal ? [categoryVal] : [];
    const genderVal = word.gender || word.Gender;

    const formattedWord = {
      ...word.toObject(),
      _id: word._id,
      id: word._id,
      gender: genderVal || '',
      category_names: categoryNames,
      meanings: (word.meanings || []).map((m, idx) => ({
        id: idx + 1,
        meaning: m.meaning,
        context_usage: m.context_usage
      })),
      proverbs: (word.proverbs || []).map((p, idx) => ({
        id: idx + 1,
        proverb: p.proverb,
        context_usage: p.context_usage
      }))
    };

    res.status(200).json(formattedWord);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search word
exports.searchWord = async (req, res) => {
  try {
    const { q } = req.query;

    const words = await MalayalamMalayalamDictionary.find({
      word: {
        $regex: q,
        $options: "i",
      },
    }).limit(50);

    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create word
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
exports.updateWord = async (req, res) => {
  try {
    const word = await MalayalamMalayalamDictionary.findByIdAndUpdate(
      req.params.id,
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
exports.deleteWord = async (req, res) => {
  try {
    await MalayalamMalayalamDictionary.findByIdAndDelete(
      req.params.id
    );

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
