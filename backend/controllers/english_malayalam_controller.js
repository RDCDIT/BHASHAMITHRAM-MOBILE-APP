
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

      // Primary source: Category array (stores meaning per grammatical category)
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

      // Fallback: meanings[] array (structured meaning + context_usage records)
      if (meaningsList.length === 0 && Array.isArray(item.meanings)) {
        item.meanings.forEach(m => {
          if (m.meaning && m.meaning.trim()) {
            meaningsList.push({
              meaning: m.meaning,
              context_usage: m.context_usage || ''
            });
          }
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

