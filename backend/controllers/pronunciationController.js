/**
 * @file pronunciationController.js
 * @description Express controller actions handling operations for pronunciationController.
 */

const path = require('path');
/**
 * @file pronunciationController.js
 * @description Controller managing pronunciation file paths, existence checks, and uploading availability.
 */

const fs = require('fs');
const fileManager = require('../utils/fileManager');
const googleTTSService = require('../services/googleTTSService');
const cacheService = require('../services/pronunciationCacheService');

// Static audio directory paths
const AUDIO_DIR = path.join(__dirname, '../public/audio');
fileManager.ensureDirectoryExists(AUDIO_DIR);

/**
 * GET /api/pronunciation/:word
 * Returns cached or newly generated pronunciation details.
 */
/**
 * Retrieves the pronunciation audio URL or local synthesis direction for a target word.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const getPronunciation = async (req, res) => {
  const word = req.params.word;

  if (!word || word.trim() === '') {
    console.log(`⚠️ [Pronunciation Request] Bad request: empty word parameter.`);
    return res.status(400).json({ success: false, message: 'Word parameter is required.' });
  }

  console.log(`🔊 [Pronunciation Request] Received lookup request for word: "${word}"`);

  try {
    // Find word in dictionary collections
    const wordEntry = await cacheService.findWordAndPronunciation(word);
    
    if (!wordEntry) {
      console.log(`⚠️ [Pronunciation Response] Word not found in any dictionary collection: "${word}"`);
      return res.status(404).json({ 
        success: false, 
        message: `Word "${word}" not found in dictionary.` 
      });
    }

    const { document, collectionName } = wordEntry;
    const existing = document.pronunciation || {};

    const hostPrefix = `${req.protocol}://${req.get('host')}`;

    // If custom manual audio exists on server, serve it
    if (existing.audioUrl && existing.source === 'manual') {
      const relativePath = existing.audioUrl;
      const absolutePath = path.join(__dirname, '..', relativePath);

      if (fs.existsSync(absolutePath)) {
        const responseData = {
          success: true,
          audioUrl: `${hostPrefix}${relativePath}`,
          source: 'manual',
          ipa: existing.ipa || null
        };
        console.log(`💾 [Pronunciation Response] Returning manual audio URL for "${word}": ${responseData.audioUrl}`);
        return res.status(200).json(responseData);
      }
    }

    // Otherwise, direct the client to use local device synthesis (expo-speech)
    console.log(`📢 [Pronunciation Response] No manual audio found for "${word}". Directing client to use local device synthesis (expo-speech).`);
    return res.status(200).json({
      success: true,
      audioUrl: null,
      source: null,
      ipa: existing.ipa || null
    });

  } catch (error) {
    console.error(`🚨 [Pronunciation Error] Exception during request handler for "${word}":`, error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during pronunciation lookup.' 
    });
  }
};

/**
 * POST /api/pronunciation/upload
 * Admin tool to upload custom MP3 audio manually for a dictionary word.
 */
/**
 * Uploads a custom MP3 audio pronunciation file for a target word.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const uploadPronunciation = async (req, res) => {
  const { word, ipa } = req.body;

  if (!word || !word.trim()) {
    // Delete uploaded temp file to avoid cluttering if validation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ success: false, message: 'Word is required.' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'MP3 file upload is required.' });
  }

  try {
    // Find word in dictionary collections
    const wordEntry = await cacheService.findWordAndPronunciation(word);
    
    if (!wordEntry) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ 
        success: false, 
        message: `Word "${word}" not found in dictionary.` 
      });
    }

    const { document, collectionName } = wordEntry;
    
    // Move uploaded file to public/audio with sanitized name
    const sanitizedFilename = `manual-${fileManager.sanitizeFilename(word)}-${Date.now()}.mp3`;
    const finalPath = path.join(AUDIO_DIR, sanitizedFilename);
    const relativeAudioUrl = `/public/audio/${sanitizedFilename}`;

    fs.renameSync(req.file.path, finalPath);

    const pronunciationData = {
      audioUrl: relativeAudioUrl,
      source: 'manual',
      ipa: ipa || document.pronunciation?.ipa || null
    };

    // Save update in DB
    await cacheService.updatePronunciation(collectionName, document._id, pronunciationData);

    const hostPrefix = `${req.protocol}://${req.get('host')}`;

    return res.status(200).json({
      success: true,
      message: 'Pronunciation uploaded and bound successfully.',
      pronunciation: {
        audioUrl: `${hostPrefix}${relativeAudioUrl}`,
        source: 'manual',
        ipa: pronunciationData.ipa
      }
    });

  } catch (error) {
    console.error('Error in uploadPronunciation:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during pronunciation upload.' 
    });
  }
};

module.exports = {
  getPronunciation,
  uploadPronunciation
};
