const EnglishDictionary = require("../models/english-english-dictionary");

// Get all words (or browse with query)
// Get all words
exports.getAllWords = async (req, res) => {
  const { query } = req.query;

  try {
    let searchCriteria = {};

    if (query && query.trim() !== "") {
      searchCriteria.word = {
        $regex: `^${query.trim()}`,
        $options: "i",
      };
    }

    const words = await EnglishDictionary.find(searchCriteria).sort({ word: 1 });

    const formattedList = words.map((item) => ({
      id: item._id,
      english_equivalent: item.word || "",
      word: "",
      primary_malayalam_meaning:
        item.Category?.flatMap((category) => {
          if (Array.isArray(category.meanings)) {
            return category.meanings.map((meaning) => meaning.meaning);
          }
          if (typeof category.meanings === "string") {
            return [category.meanings];
          }
          if (typeof category.meaning === "string") {
            return [category.meaning];
          }
          return [];
        })
          .filter(Boolean)
          .join(", ") || "",
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

    const detailsObj = word.toObject();

    const formattedDetails = {
      ...detailsObj,

      id: detailsObj._id,

      root: detailsObj.root || "",

      gender: detailsObj.gender || detailsObj.Gender || "",

      categories: formattedCategories,

      proverbs: (detailsObj.proverbs || []).map((p, index) => ({
        id: index + 1,
        proverb: p.proverb || "",
        context_usage: p.context_usage || "",
      })),

      images: detailsObj.images || [],
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