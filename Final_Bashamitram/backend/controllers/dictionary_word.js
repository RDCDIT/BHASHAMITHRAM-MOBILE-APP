/**
 * @file dictionary_word.js
 * @description Controller for general dictionary word lookups, specifically handling
 * the retrieval of English-equivalent words beginning with a specified letter.
 */

const Dictionary = require('../models/englishmalayalam');

/**
 * GET /api/words/browse
 * Fetches all dictionary items starting with a specific English character (using a prefix regex match)
 * with approved status, returning their English equivalents, primary Malayalam meanings, and IDs.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.query - URL query parameters.
 * @param {string} req.query.letter - The character prefix used to filter words.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} JSON response containing the list of formatted dictionary entries or error messages.
 */
const getEnglishMasterList = async (req, res) => {
  const startTime = Date.now();
  const { letter } = req.query;

  console.log(`\n📥 [Incoming Request] GET /api/words/browse | Query Param: letter="${letter || 'undefined'}"`);

  if (!letter) {
    console.log('⚠️ [Validation Failed] Client omitted the required alphabet filter parameter.');
    return res.status(400).json({ message: "Character parameter is required." });
  }

  try {
    const searchRegex = new RegExp(`^${letter}`, 'i');
    
    console.log(`🔍 [Database Query] Scanning 'dictionary' collection for English words starting with: /^${letter}/i ...`);
    
    const wordsList = await Dictionary.find(
      { 
        'equivalents.english': searchRegex,
        'status.approved': true
      },
      { 
        _id: 1, 
        equivalents: 1, 
        word: 1, 
        meanings: 1 
      }
    ).sort({ 'equivalents.english': 1 });

    // Format database records to layout format expected by the mobile client
    const formattedList = wordsList.map(item => ({
      id: item._id,
      english_equivalent: item.equivalents?.english || '',
      word: item.word,
      primary_malayalam_meaning: item.meanings?.[0]?.meaning || ''
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Retrieved ${formattedList.length} dictionary documents matching criteria.`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(200).json(formattedList);
  } catch (error) {
    console.error(`🚨 [Execution Error] Failed to complete data collection lookup pattern.`);
    console.error(`Details: ${error.stack}`);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getEnglishMasterList };