const mongoose = require('mongoose');
const Dictionary = require('../models/englishmalayalam');
const RecentSearch = require('../models/RecentSearches');
const RecentOpening = require('../models/RecentOpening');

/**
 * GET /api/words/details/:id
 * ഒരു പ്രത്യേക വാക്കിന്റെ എല്ലാ വിവരങ്ങളും (Meanings, Images, Proverbs) ഒന്നിച്ച് ഫെച്ച് ചെയ്യുന്നു.
 */
const getWordDetails = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;

  console.log(`\n📥 [Incoming Request] GET /api/words/details | Word ID: "${id}"`);

  if (!id) {
    console.log('⚠️ [Validation Failed] Client omitted the required word ID.');
    return res.status(400).json({ message: "Word ID parameter is required." });
  }

  try {
    console.log(`🔍 [Database Query] Fetching detailed document for ID: ${id} ...`);
    
    // ഡാറ്റാബേസിൽ നിന്ന് ID അടിസ്ഥാനമാക്കി വാക്ക് കണ്ടെത്തുന്നു
    const wordDetails = await Dictionary.findOne({ _id: Number(id), 'status.approved': true });

    if (!wordDetails) {
      console.log(`⚠️ [Not Found] No approved document found with ID: ${id}`);
      return res.status(404).json({ message: "Word details not found." });
    }

    // പദത്തിന്റെ വ്യാകരണ വിഭാഗങ്ങൾ (Categories) കണ്ടെത്തുന്നു
    const categoryIds = wordDetails.categories || [];
    let categoryNames = [];
    if (categoryIds.length > 0) {
      const categoriesList = await mongoose.connection.db.collection('Category')
        .find({ _id: { $in: categoryIds.map(Number) } })
        .toArray();
      categoryNames = categoriesList.map(c => c.category);
    }

    // Record this word opening
    RecentOpening.findOneAndUpdate(
      { wordId: wordDetails._id },
      { word: wordDetails.word, openedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).catch(err => console.error('Failed to log recent opening:', err));

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved "${wordDetails.word}" with categories [${categoryNames.join(', ')}].`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    // Map _id to id to maintain compatibility with the mobile client
    const formattedDetails = {
      ...wordDetails.toObject(),
      id: wordDetails._id,
      category_names: categoryNames
    };

    // എല്ലാ വിവരങ്ങളും അടങ്ങിയ ഒബ്ജക്റ്റ് ഫ്രണ്ട്എൻഡിലേക്ക് അയക്കുന്നു
    return res.status(200).json(formattedDetails);
  } catch (error) {
    console.error(`🚨 [Execution Error] Failed to retrieve full word details.`);
    console.error(`Details: ${error.stack}`);
    return res.status(500).json({ error: error.message });
  }
};

const getMalayalamMasterList = async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/browse-malayalam | Query: "${query || 'undefined'}"`);

  const MALAYALAM_ALPHABET = [
    "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ",
    "ക", "ഖ", "ഗ", "ഘ", "ച", "ഛ", "ജ", "ഝ", "ട", "ഠ", "ഡ", "ഢ",
    "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര",
    "ല", "വ", "ശ", "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
  ];

  try {
    const searchCriteria = { 'status.approved': true };
    if (query && query.trim() !== '') {
      const searchRegex = new RegExp(`^${query.trim()}`, 'i');
      searchCriteria.word = searchRegex;
      console.log(`🔍 [Database Query] Searching for Malayalam words starting with: /^${query.trim()}/i ...`);

      const trimmedQuery = query.trim();
      const isCharacterOnly = trimmedQuery.length === 1 || MALAYALAM_ALPHABET.includes(trimmedQuery);

      // Record recent search only if it is a full word search
      if (!isCharacterOnly) {
        RecentSearch.findOneAndUpdate(
          { title: trimmedQuery, itemType: 'character' },
          { $setOnInsert: { itemId: new mongoose.Types.ObjectId() }, searchedAt: new Date() },
          { upsert: true, new: true }
        ).catch(err => console.error('Failed to log recent search:', err));
      }
    } else {
      console.log(`🔍 [Database Query] Query is empty. Fetching all approved Malayalam words ...`);
    }
    
    const list = await Dictionary.find(
      searchCriteria,
      { _id: 1, equivalents: 1, word: 1, meanings: 1 }
    ).sort({ word: 1 });

    const formattedList = list.map(item => ({
      id: item._id,
      english_equivalent: item.equivalents?.english || '',
      word: item.word,
      primary_malayalam_meaning: item.meanings?.[0]?.meaning || ''
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved ${formattedList.length} documents matching query "${query || ''}".`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(200).json(formattedList);
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to retrieve Malayalam master list.`);
    console.error(`Details: ${err.stack}`);
    return res.status(500).json({ error: err.message });
  }
};

const getMalayalamSynonymsList = async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/browse-synonyms | Query: "${query || 'undefined'}"`);

  const MALAYALAM_ALPHABET = [
    "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ",
    "ക", "ഖ", "ഗ", "ഘ", "ച", "ഛ", "ജ", "ഝ", "ട", "ഠ", "ഡ", "ഢ",
    "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര",
    "ല", "വ", "ശ", "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
  ];

  try {
    const searchCriteria = { 
      'status.approved': true, 
      synonyms: { $exists: true, $ne: "" } 
    };
    if (query && query.trim() !== '') {
      const searchRegex = new RegExp(`^${query.trim()}`, 'i');
      searchCriteria.word = searchRegex;
      console.log(`🔍 [Database Query] Searching for Malayalam words with synonyms starting with: /^${query.trim()}/i ...`);

      const trimmedQuery = query.trim();
      const isCharacterOnly = trimmedQuery.length === 1 || MALAYALAM_ALPHABET.includes(trimmedQuery);

      // Record recent search only if it is a full word search
      if (!isCharacterOnly) {
        RecentSearch.findOneAndUpdate(
          { title: trimmedQuery, itemType: 'synonym' },
          { $setOnInsert: { itemId: new mongoose.Types.ObjectId() }, searchedAt: new Date() },
          { upsert: true, new: true }
        ).catch(err => console.error('Failed to log recent search:', err));
      }
    } else {
      console.log(`🔍 [Database Query] Query is empty. Fetching all Malayalam words with synonyms ...`);
    }

    const list = await Dictionary.find(
      searchCriteria,
      { _id: 1, word: 1, synonyms: 1 }
    ).sort({ word: 1 });

    const formattedList = list.map(item => ({
      id: item._id,
      word: item.word,
      synonyms: item.synonyms
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved ${formattedList.length} synonym documents matching query "${query || ''}".`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(200).json(formattedList);
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to retrieve Malayalam synonyms list.`);
    console.error(`Details: ${err.stack}`);
    return res.status(500).json({ error: err.message });
  }
};

const getRecentActivity = async (req, res) => {
  const startTime = Date.now();
  console.log(`\n📥 [Incoming Request] GET /api/words/recent-activity`);

  const MALAYALAM_ALPHABET = [
    "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ",
    "ക", "ഖ", "ഗ", "ഘ", "ച", "ഛ", "ജ", "ഝ", "ട", "ഠ", "ഡ", "ഢ",
    "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര",
    "ല", "വ", "ശ", "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
  ];

  try {
    const rawSearches = await RecentSearch.find()
      .sort({ searchedAt: -1 })
      .limit(50);

    const recentSearches = rawSearches
      .filter(s => s.title && s.title.trim().length > 1 && !MALAYALAM_ALPHABET.includes(s.title.trim()))
      .slice(0, 10);

    const recentOpenings = await RecentOpening.find()
      .sort({ openedAt: -1 })
      .limit(10);

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved ${recentSearches.length} recent searches and ${recentOpenings.length} recent openings.`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(200).json({
      recentSearches,
      recentOpenings
    });
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to retrieve recent activity list.`);
    console.error(`Details: ${err.stack}`);
    return res.status(500).json({ error: err.message });
  }
};

const clearRecentActivity = async (req, res) => {
  const startTime = Date.now();
  const { type } = req.body; // 'searches', 'openings', or 'all'
  console.log(`\n📥 [Incoming Request] POST /api/words/clear-recent-activity | Type: "${type || 'all'}"`);

  try {
    if (type === 'searches') {
      await RecentSearch.deleteMany({});
      console.log('🗑️ [Database] Cleared all recent searches.');
    } else if (type === 'openings') {
      await RecentOpening.deleteMany({});
      console.log('🗑️ [Database] Cleared all recent openings.');
    } else {
      await RecentSearch.deleteMany({});
      await RecentOpening.deleteMany({});
      console.log('🗑️ [Database] Cleared all recent activity.');
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Activity cleared successfully.`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(200).json({ message: 'Activity cleared successfully.' });
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to clear recent activity.`);
    console.error(`Details: ${err.stack}`);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  getMalayalamMasterList, 
  getWordDetails,
  getMalayalamSynonymsList,
  getRecentActivity,
  clearRecentActivity
};