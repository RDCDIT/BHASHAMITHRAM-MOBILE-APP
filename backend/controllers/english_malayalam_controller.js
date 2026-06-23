
const EnglishMalayalamDictionary = require(
  "../models/english_malayalam_dictionary"
);

// Browse / Search
exports.browseEnglishWords = async (req, res) => {
  try {
    const { query = "" } = req.query;

    const filter = query
      ? {
          word: {
            $regex: "^" + query,
            $options: "i",
          },
        }
      : {};

    const words = await EnglishMalayalamDictionary.find(filter)
      .select("word meanings")
      .sort({ word: 1 });

    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Details
exports.getWordDetails = async (req, res) => {
  try {
    const word = await EnglishMalayalamDictionary.findById(
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

// Create
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
exports.updateWord = async (req, res) => {
  try {
    const word =
      await EnglishMalayalamDictionary.findByIdAndUpdate(
        req.params.id,
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
exports.deleteWord = async (req, res) => {
  try {
    await EnglishMalayalamDictionary.findByIdAndDelete(
      req.params.id
    );

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

