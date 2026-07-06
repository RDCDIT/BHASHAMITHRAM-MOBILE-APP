/**
 * @file gttsFallbackController.js
 * @description Controller for text-to-speech fallback, attempting gTTS first and falling back to MongoDB-stored audio.
 */

const gTTS = require('gtts');
const mongoose = require('mongoose');

// The dictionary collections we search
const DICTIONARY_COLLECTIONS = [
  'malayalam_malayalam_dictionary',
  'English-malayalam_dictionary',
  'Malayalam_English_Dictionary',
  'English_English_Dictionary'
];

/**
 * Attempts to generate pronunciation using gTTS
 * @param {string} word 
 * @param {string} lang 
 * @returns {Promise<Buffer>}
 */
/**
 * Generates audio buffer from text using Google Text-to-Speech (gTTS).
 * 
 * @param {string} word - The term/word to synthesize.
 * @param {string} lang - Language code ('en' or 'ml').
 * @returns {Promise<Buffer>} Generated audio file buffer.
 */
const generateGttsAudio = (word, lang) => {
  return new Promise((resolve, reject) => {
    try {
      const gtts = new gTTS(word, lang);
      const stream = gtts.stream();
      const chunks = [];

      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * GET /api/pronunciation/fallback-gtts
 * 
 * Flow:
 * 1. Try to generate audio using gTTS.
 * 2. If Success -> Return generated audio.
 * 3. If Failed -> Find word in Dictionary collection -> Get _id -> Search pronunciation collection -> Return stored audio.
 */
/**
 * GET endpoint to serve pronunciation audio using gTTS or database cache recovery.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const getPronunciationWithFallback = async (req, res) => {
  const { word, lang } = req.query;

  if (!word || word.trim() === '') {
    return res.status(400).json({ success: false, message: 'Word query parameter is required.' });
  }

  const cleanWord = word.trim();
  const targetLang = lang === 'en' ? 'en' : 'ml';

  console.log(`🔊 [gttsFallbackController] Requested pronunciation for "${cleanWord}" (lang: ${targetLang})`);

  // Step 1 & 2: Try gTTS first
  try {
    const audioBuffer = await generateGttsAudio(cleanWord, targetLang);
    console.log(`📡 [gttsFallbackController] Successfully generated audio using gTTS for "${cleanWord}"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(cleanWord)}.mp3"`);
    return res.status(200).send(audioBuffer);
  } catch (gttsError) {
    console.warn(`⚠️ [gttsFallbackController] gTTS failed for "${cleanWord}": ${gttsError.message}. Triggering database fallback...`);

    // Step 3: Find word in Dictionary collections to get _id
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not initialized.');
      }

      let matchedWordDoc = null;
      let matchedCollection = '';

      // Phase A: Exact Match search
      for (const colName of DICTIONARY_COLLECTIONS) {
        const doc = await db.collection(colName).findOne({ word: cleanWord });
        if (doc) {
          matchedWordDoc = doc;
          matchedCollection = colName;
          break;
        }
      }

      // Phase B: Case Insensitive Fallback Match for English words
      if (!matchedWordDoc) {
        const isMalayalam = /[\u0d00-\u0d7f]/.test(cleanWord);
        if (!isMalayalam) {
          for (const colName of DICTIONARY_COLLECTIONS) {
            const doc = await db.collection(colName).findOne({
              word: { $regex: new RegExp(`^${cleanWord}$`, 'i') }
            });
            if (doc) {
              matchedWordDoc = doc;
              matchedCollection = colName;
              break;
            }
          }
        }
      }

      if (!matchedWordDoc) {
        console.error(`🚨 [gttsFallbackController] Word "${cleanWord}" not found in any dictionary collections.`);
        return res.status(404).json({
          success: false,
          message: `Word "${cleanWord}" not found in dictionaries, and gTTS failed.`
        });
      }

      const wordId = matchedWordDoc._id;
      console.log(`🔍 [gttsFallbackController] Found word "${cleanWord}" (ID: ${wordId}) in collection: "${matchedCollection}"`);

      // Determine which pronunciation collection to search
      // English source keys: English_English_Dictionary, English-malayalam_dictionary
      // Malayalam source keys: malayalam_malayalam_dictionary, Malayalam_English_Dictionary
      let pronounciationColName = '';
      if (
        matchedCollection === 'English-malayalam_dictionary' ||
        matchedCollection === 'English_English_Dictionary'
      ) {
        pronounciationColName = 'English_pronounciation';
      } else {
        pronounciationColName = 'malayalam_pronounciation';
      }

      console.log(`🔍 [gttsFallbackController] Searching pronunciation in collection: "${pronounciationColName}" for ID: ${wordId}`);
      const pronDoc = await db.collection(pronounciationColName).findOne({ _id: wordId });

      if (!pronDoc) {
        // Fallback: If not found in the primary mapped collection, try the other one just in case
        const alternateColName =
          pronounciationColName === 'English_pronounciation'
            ? 'malayalam_pronounciation'
            : 'English_pronounciation';
        console.log(`🔍 [gttsFallbackController] Not found in "${pronounciationColName}". Trying alternate: "${alternateColName}"`);
        const altDoc = await db.collection(alternateColName).findOne({ _id: wordId });
        
        if (altDoc) {
          const audioBuffer = altDoc.Pronounciation || altDoc.pronounciation;
          if (audioBuffer) {
            console.log(`💾 [gttsFallbackController] Found stored audio in alternate collection "${alternateColName}" for ID: ${wordId}`);
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(cleanWord)}.mp3"`);
            return res.status(200).send(audioBuffer.buffer || audioBuffer);
          }
        }

        console.error(`🚨 [gttsFallbackController] No stored pronunciation found for word ID ${wordId}.`);
        return res.status(404).json({
          success: false,
          message: `No stored pronunciation found for "${cleanWord}".`
        });
      }

      const audioBuffer = pronDoc.Pronounciation || pronDoc.pronounciation;
      if (!audioBuffer) {
        console.error(`🚨 [gttsFallbackController] Pronunciation document exists for ID ${wordId} but contains no audio.`);
        return res.status(404).json({
          success: false,
          message: `Stored pronunciation contains no audio for "${cleanWord}".`
        });
      }

      console.log(`💾 [gttsFallbackController] Returning stored audio from "${pronounciationColName}" for word "${cleanWord}" (ID: ${wordId})`);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(cleanWord)}.mp3"`);
      return res.status(200).send(audioBuffer.buffer || audioBuffer);

    } catch (dbError) {
      console.error(`🚨 [gttsFallbackController] Database fallback error:`, dbError);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during pronunciation fallback lookup.',
        error: dbError.message
      });
    }
  }
};

module.exports = {
  getPronunciationWithFallback
};
