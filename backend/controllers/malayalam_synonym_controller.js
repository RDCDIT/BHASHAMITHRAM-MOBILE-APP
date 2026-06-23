const Synonym = require('../models/malayalam_synonyms');

// Utility helper to clean and convert comma-separated string inputs into clean string arrays
const parseSynonyms = (input) => {
  if (Array.isArray(input)) return input.map(s => s.trim());
  if (typeof input === 'string') {
    return input.split(/,|\n|\r/)
                .map(s => s.trim())
                .filter(s => s.length > 0);
  }
  return [];
};

// @desc    Get all synonyms (with optional query filters & pagination)
// @route   GET /api/synonyms
const getSynonyms = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const trimmedSearch = search.trim();
      const MALAYALAM_ALPHABET = [
        "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "അം",
        "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ",
        "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന",
        "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ",
        "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
      ];
      const isLetter = trimmedSearch.length === 1 || MALAYALAM_ALPHABET.includes(trimmedSearch);
      
      if (isLetter) {
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

    const records = await Synonym.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Synonym.countDocuments(query);

    res.status(200).json({
      records,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalEntries: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get synonyms for a specific word by ID
// @route   GET /api/synonyms/:id
const getSynonymById = async (req, res) => {
  try {
    const queryId = !isNaN(Number(req.params.id)) ? Number(req.params.id) : req.params.id;
    const record = await Synonym.findById(queryId);
    if (!record) {
      return res.status(404).json({ message: 'Synonym entry not found' });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new synonym mapping
// @route   POST /api/synonyms
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
const updateSynonym = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Format if synonyms field is present in the update payload
    if (updates.synonyms) {
      updates.synonyms = parseSynonyms(updates.synonyms);
    }

    const updatedRecord = await Synonym.findByIdAndUpdate(
      req.params.id,
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
const deleteSynonym = async (req, res) => {
  try {
    const deletedRecord = await Synonym.findByIdAndDelete(req.params.id);
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