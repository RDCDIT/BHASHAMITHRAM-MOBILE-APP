/**
 * @file suggestedwordAdminController.js
 * @description Controller actions for administrators to review, approve, reject, edit, or delete user-suggested dictionary words using MySQL.
 * Includes resilient dual-tier persistence (MySQL Database + Local queue fallback).
 */

const fs = require('fs');
const path = require('path');
const { SuggestedWord, Dictionary, getMySQLStatus } = require('../../config/mysql');
const {
  checkWordInDatabase,
  batchCheckSuggestions,
  mergeOrInsertWord
} = require('../../services/dictionarySyncService');

// Local storage fallback paths
const DATA_DIR = path.join(__dirname, '../../data');
const PENDING_SUGGESTIONS_FILE = path.join(DATA_DIR, 'pending_suggestions.json');

function readLocalSuggestions() {
  try {
    if (fs.existsSync(PENDING_SUGGESTIONS_FILE)) {
      return JSON.parse(fs.readFileSync(PENDING_SUGGESTIONS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error("Error reading local suggestions:", e);
  }
  return [];
}

function writeLocalSuggestions(suggestions) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PENDING_SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error("Error writing local suggestions:", e);
  }
  return false;
}

// Helper function to format DB suggestions to frontend requirements
const formatSuggestion = (item) => {
  const obj = item.toJSON ? item.toJSON() : { ...item };
  const id = obj.id || obj._id;

  let statusString = obj.status || "pending";
  if (typeof obj.status === 'object') {
    if (obj.status.approved) statusString = "approved";
    else if (obj.status.rejected) statusString = "rejected";
    else statusString = "pending";
  }

  const englishWord = obj.word || obj.equivalents_english || (obj.equivalents && obj.equivalents.english) || "";

  let malayalamMeaning = obj.meaning || "";
  if (!malayalamMeaning && obj.meanings_json) {
    try {
      const parsed = JSON.parse(obj.meanings_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        malayalamMeaning = parsed.map(m => m.meaning || m).join(', ');
      }
    } catch (_) {}
  }

  return {
    ...obj,
    id: id,
    _id: String(id),
    englishWord: englishWord,
    malayalamMeaning: malayalamMeaning || "No meaning provided",
    meaning: malayalamMeaning || "",
    status: statusString,
    contributor: {
      name: obj.contributor_name || (obj.contributor && obj.contributor.name) || "Anonymous",
      email: obj.contributor_email || (obj.contributor && obj.contributor.email) || "",
    },
  };
};

/**
 * Fetches all word suggestions submitted by users from MySQL.
 */
exports.getAllSuggestions = async (req, res) => {
  try {
    let sqlSuggestions = [];
    if (getMySQLStatus()) {
      try {
        sqlSuggestions = await SuggestedWord.findAll({
          order: [['created_at', 'DESC']],
        });
      } catch (err) {
        console.warn("MySQL fetch suggestions error:", err.message);
      }
    }

    const localSuggestions = readLocalSuggestions();
    const combined = [...sqlSuggestions.map(s => s.toJSON())];
    const seenIds = new Set(combined.map(s => String(s.id || s._id)));

    for (const local of localSuggestions) {
      const lid = String(local.id || local._id);
      if (!seenIds.has(lid)) {
        combined.push(local);
      }
    }

    const formatted = combined.map(formatSuggestion);
    const enriched = await batchCheckSuggestions(formatted);
    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch suggestions",
      error: error.message,
    });
  }
};

/**
 * Fetches only the pending suggestions awaiting administrator moderation.
 */
exports.getPendingSuggestions = async (req, res) => {
  try {
    let sqlPending = [];
    if (getMySQLStatus()) {
      try {
        sqlPending = await SuggestedWord.findAll({
          where: { status: 'pending' },
          order: [['created_at', 'DESC']],
        });
      } catch (err) {
        console.warn("MySQL pending suggestions fetch error:", err.message);
      }
    }

    const localSuggestions = readLocalSuggestions().filter(s => {
      const st = s.status;
      if (typeof st === 'string') return st === 'pending';
      return !st?.approved && !st?.rejected;
    });

    const combined = [...sqlPending.map(s => s.toJSON())];
    const seenIds = new Set(combined.map(s => String(s.id || s._id)));

    for (const local of localSuggestions) {
      const lid = String(local.id || local._id);
      if (!seenIds.has(lid)) {
        combined.push(local);
      }
    }

    const formatted = combined.map(formatSuggestion);
    const enriched = await batchCheckSuggestions(formatted);
    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch pending suggestions",
      error: error.message,
    });
  }
};

/**
 * Retrieves a detailed suggestion entry document by ID from MySQL.
 */
exports.getSuggestionById = async (req, res) => {
  try {
    const { id } = req.params;
    let found = null;

    if (getMySQLStatus()) {
      try {
        found = await SuggestedWord.findByPk(id);
      } catch (err) {}
    }

    if (!found) {
      const localSuggestions = readLocalSuggestions();
      found = localSuggestions.find(s => String(s.id || s._id) === String(id));
    }

    if (!found) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    return res.status(200).json(formatSuggestion(found));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch suggestion details",
      error: error.message,
    });
  }
};

/**
 * Manually updates a suggestion's fields in MySQL.
 */
exports.updateSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      word,
      meaning,
      root,
      etymology,
      cultural_note,
      synonyms,
      antonyms,
      dialects,
      proverb,
      phonetic_transcription,
      gender,
      language_type,
      status,
      equivalents
    } = req.body;

    let updated = null;

    if (getMySQLStatus()) {
      try {
        const item = await SuggestedWord.findByPk(id);
        if (item) {
          const updateData = {};
          if (word !== undefined) updateData.word = word;
          if (meaning !== undefined) updateData.meaning = meaning;
          if (root !== undefined) updateData.root = root;
          if (etymology !== undefined) updateData.etymology = etymology;
          if (cultural_note !== undefined) updateData.cultural_note = cultural_note;
          if (synonyms !== undefined) updateData.synonyms = Array.isArray(synonyms) ? synonyms.join(', ') : synonyms;
          if (antonyms !== undefined) updateData.antonyms = Array.isArray(antonyms) ? antonyms.join(', ') : antonyms;
          if (dialects !== undefined) updateData.dialects = Array.isArray(dialects) ? dialects.join(', ') : dialects;
          if (proverb !== undefined) updateData.proverb = proverb;
          if (phonetic_transcription !== undefined) updateData.phonetic_transcription = phonetic_transcription;
          if (gender !== undefined) updateData.gender = gender;
          if (language_type !== undefined) updateData.language_type = language_type;
          if (status !== undefined) updateData.status = status;
          if (equivalents !== undefined) {
            updateData.equivalents_kannada = equivalents.kannada || '';
            updateData.equivalents_tamil = equivalents.tamil || '';
            updateData.equivalents_telugu = equivalents.telugu || '';
            updateData.equivalents_tulu = equivalents.tulu || '';
            updateData.equivalents_english = equivalents.english || '';
          }

          await item.update(updateData);
          updated = item;
        }
      } catch (err) {
        console.warn("MySQL update error:", err.message);
      }
    }

    const localSuggestions = readLocalSuggestions();
    const localIdx = localSuggestions.findIndex(s => String(s.id || s._id) === String(id));
    if (localIdx !== -1) {
      const item = localSuggestions[localIdx];
      if (word !== undefined) item.word = word;
      if (meaning !== undefined) item.meaning = meaning;
      if (root !== undefined) item.root = root;
      if (etymology !== undefined) item.etymology = etymology;
      if (cultural_note !== undefined) item.cultural_note = cultural_note;
      if (synonyms !== undefined) item.synonyms = Array.isArray(synonyms) ? synonyms.join(', ') : synonyms;
      if (antonyms !== undefined) item.antonyms = Array.isArray(antonyms) ? antonyms.join(', ') : antonyms;
      if (dialects !== undefined) item.dialects = Array.isArray(dialects) ? dialects.join(', ') : dialects;
      if (proverb !== undefined) item.proverb = proverb;
      if (status !== undefined) item.status = status;
      localSuggestions[localIdx] = item;
      writeLocalSuggestions(localSuggestions);
      if (!updated) updated = item;
    }

    if (!updated) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    return res.status(200).json({
      message: "Suggestion updated successfully in MySQL",
      suggestion: formatSuggestion(updated)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update suggestion",
      error: error.message
    });
  }
};

/**
 * Checks live database status for a specific word and meaning.
 */
exports.checkWordDbStatus = async (req, res) => {
  try {
    const { word, meaning } = req.query;
    if (!word) {
      return res.status(400).json({ message: "Word parameter is required" });
    }
    const result = await checkWordInDatabase(word, meaning || '');
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check word in database",
      error: error.message
    });
  }
};

/**
 * Approves a user suggested word:
 * - Checks if the word already exists in the database.
 * - If it exists and meaning is new/different, merges the new meaning into the existing entry.
 * - If it does not exist, inserts it as a new word in the dictionary.
 */
exports.approveSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    let targetItem = null;
    let sqlItem = null;

    // Check MySQL
    if (getMySQLStatus()) {
      try {
        sqlItem = await SuggestedWord.findByPk(id);
        if (sqlItem) {
          targetItem = sqlItem.toJSON ? sqlItem.toJSON() : sqlItem;
        }
      } catch (err) {
        console.warn('MySQL lookup error during approval:', err.message);
      }
    }

    // Check local storage fallback
    const localSuggestions = readLocalSuggestions();
    const localIdx = localSuggestions.findIndex(s => String(s.id || s._id) === String(id));
    if (localIdx !== -1 && !targetItem) {
      targetItem = localSuggestions[localIdx];
    }

    if (!targetItem) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    const targetTypes = (req.body && Array.isArray(req.body.targetTypes) && req.body.targetTypes.length > 0)
      ? req.body.targetTypes
      : null;

    // Perform database existence check & intelligent merge or creation across selected dictionary types
    const mergeResult = await mergeOrInsertWord(targetItem, targetTypes);

    // Update status in MySQL
    if (sqlItem) {
      try {
        await sqlItem.update({
          status: 'approved',
          superuser_approved: true
        });
      } catch (err) {
        console.warn('MySQL status update error:', err.message);
      }
    }

    // Update status in local storage
    if (localIdx !== -1) {
      localSuggestions[localIdx].status = 'approved';
      localSuggestions[localIdx].added_to_dictionary = true;
      localSuggestions[localIdx].merge_action = mergeResult.action;
      localSuggestions[localIdx].target_dictionary_types = mergeResult.selectedTypes;
      writeLocalSuggestions(localSuggestions);
      targetItem = localSuggestions[localIdx];
    } else {
      targetItem.status = 'approved';
    }

    return res.status(200).json({
      message: mergeResult.message,
      mergeResult: mergeResult,
      suggestion: formatSuggestion(targetItem),
      addedToDictionary: true,
      action: mergeResult.action,
    });
  } catch (error) {
    console.error("Approval error:", error);
    return res.status(500).json({
      message: "Failed to approve suggestion",
      error: error.message,
    });
  }
};

/**
 * Rejects a word suggestion in MySQL.
 */
exports.rejectSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    let updated = null;

    if (getMySQLStatus()) {
      try {
        const item = await SuggestedWord.findByPk(id);
        if (item) {
          await item.update({ status: 'rejected' });
          updated = item;

          // If word was previously in Dictionary, deactivate it
          if (Dictionary && item.word) {
            try {
              const existingDict = await Dictionary.findOne({ where: { word: item.word } });
              if (existingDict) {
                await existingDict.update({ approved: '0', superuser_approved: '0' });
                console.log(`ℹ️ [MySQL Dictionary] Deactivated dictionary entry for rejected word: "${item.word}"`);
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        console.warn('MySQL reject error:', err.message);
      }
    }

    const localSuggestions = readLocalSuggestions();
    const localIdx = localSuggestions.findIndex(s => String(s.id || s._id) === String(id));
    if (localIdx !== -1) {
      localSuggestions[localIdx].status = 'rejected';
      localSuggestions[localIdx].added_to_dictionary = false;
      writeLocalSuggestions(localSuggestions);
      if (!updated) updated = localSuggestions[localIdx];
    }

    if (!updated) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    return res.status(200).json({
      message: "വാക്ക് നിരസിച്ചു. നിഘണ്ടുവിൽ ചേർക്കപ്പെടില്ല. (Word rejected. Will not be added to dictionary)",
      suggestion: formatSuggestion(updated),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reject suggestion",
      error: error.message,
    });
  }
};

/**
 * Permanently removes a suggested word entry from MySQL.
 */
exports.deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = false;

    if (getMySQLStatus()) {
      try {
        const item = await SuggestedWord.findByPk(id);
        if (item) {
          await item.destroy();
          deleted = true;
        }
      } catch (err) {
        console.warn('MySQL delete error:', err.message);
      }
    }

    const localSuggestions = readLocalSuggestions();
    const filtered = localSuggestions.filter(s => String(s.id || s._id) !== String(id));
    if (filtered.length !== localSuggestions.length) {
      writeLocalSuggestions(filtered);
      deleted = true;
    }

    if (!deleted) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    return res.status(200).json({
      message: "Suggestion deleted successfully from MySQL",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete suggestion",
      error: error.message,
    });
  }
};

/**
 * Direct API to check any word and meaning against the dictionary database
 * GET /api/admin/suggestions/check-word?word=...&meaning=...
 */
exports.checkWordDbStatus = async (req, res) => {
  try {
    const word = req.query.word || (req.body && req.body.word) || '';
    const meaning = req.query.meaning || (req.body && req.body.meaning) || '';
    if (!word) {
      return res.status(400).json({ error: "Word parameter is required" });
    }
    const result = await checkWordInDatabase(word, meaning);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Check word DB error:", error);
    return res.status(500).json({ error: error.message });
  }
};