
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
      .select("word Category meanings")
      .sort({ word: 1 });

    const formattedWords = words.map(item => {
      let meaningsList = [];
      if (Array.isArray(item.Category)) {
        item.Category.forEach(c => {
          if (c.meanings) meaningsList.push({ meaning: c.meanings });
          else if (c.meaning) meaningsList.push({ meaning: c.meaning });
        });
      }
      return {
        _id: item._id,
        id: item._id,
        word: item.word,
        meanings: meaningsList
      };
    });

    res.status(200).json(formattedWords);
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
    const word = await EnglishMalayalamDictionary.findById(req.params.id);

    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Word not found",
      });
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

    const genderValue = word.gender || word.Gender || "";

    const formattedWord = {
      ...word.toObject(),

      _id: word._id,
      id: word._id,

      gender: genderValue,

      categories: formattedCategories,

      proverbs: (word.proverbs || []).map((p, index) => ({
        id: index + 1,
        proverb: p.proverb,
        context_usage: p.context_usage || "",
      })),
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

