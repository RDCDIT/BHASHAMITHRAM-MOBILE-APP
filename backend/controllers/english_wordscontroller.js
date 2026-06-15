const mongoose = require('mongoose');
const EnglishDictionary = require('../models/englishdictionary');
const RecentSearch = require('../models/RecentSearches');

const ENGLISH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * GET /api/words/browse-english
 * Fetches English words starting with the query, formatted for the mobile client.
 */
const getEnglishMasterList = async (req, res) => {
  const startTime = Date.now();
  const { query } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/browse-english | Query: "${query || 'undefined'}"`);

  try {
    const searchCriteria = { 'status.approved': true };
    if (query && query.trim() !== '') {
      const searchRegex = new RegExp(`^${query.trim()}`, 'i');
      searchCriteria.word = searchRegex;
      console.log(`🔍 [Database Query] Searching for English words starting with: /^${query.trim()}/i ...`);

      const trimmedQuery = query.trim();
      const isCharacterOnly = trimmedQuery.length === 1 || ENGLISH_ALPHABET.includes(trimmedQuery.toUpperCase());

      // Record recent search only if it is a full word search
      if (!isCharacterOnly) {
        RecentSearch.findOneAndUpdate(
          { title: trimmedQuery, itemType: 'character_english' },
          { $setOnInsert: { itemId: new mongoose.Types.ObjectId() }, searchedAt: new Date() },
          { upsert: true, new: true }
        ).catch(err => console.error('Failed to log recent search:', err));
      }
    } else {
      console.log(`🔍 [Database Query] Query is empty. Fetching all approved English words ...`);
    }

    const list = await EnglishDictionary.find(
      searchCriteria,
      { _id: 1, equivalents: 1, word: 1, meanings: 1 }
    ).sort({ word: 1 });

    const formattedList = list.map(item => ({
      id: item._id,
      english_equivalent: item.word || '',
      word: item.equivalents?.malayalam || '',
      primary_malayalam_meaning: item.meanings?.[0]?.meaning || ''
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved ${formattedList.length} documents matching query "${query || ''}".`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(200).json(formattedList);
  } catch (err) {
    console.error(`🚨 [Execution Error] Failed to retrieve English master list.`);
    console.error(`Details: ${err.stack}`);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEnglishMasterList
};
