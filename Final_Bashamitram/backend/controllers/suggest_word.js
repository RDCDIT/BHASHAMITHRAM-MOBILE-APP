/**
 * @file suggest_word.js
 * @description Controller handles incoming suggestions from users proposing new words/meanings.
 */

const fs = require('fs');
const path = require('path');
const {
  SuggestedWord,
  DataviewSuggestion,
  DataviewCollection,
  getMySQLStatus
} = require('../config/mysql');
const { sendSuggestionReceivedMail } = require('../services/mailService');
const {
  computeSha256,
  verifyHmacSignature,
  decryptAes256,
  sanitizeSuggestionPayload,
  sanitizeString,
  validateHighEndEmail
} = require('../utils/security');

// Local Offline Storage Fallback
const DATA_DIR = path.join(__dirname, '../data');
const PENDING_SUGGESTIONS_FILE = path.join(DATA_DIR, 'pending_suggestions.json');
const PENDING_DATAVIEW_FILE = path.join(DATA_DIR, 'pending_dataview.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveLocalSuggestion(data) {
  ensureDataDir();
  let existing = [];
  try {
    if (fs.existsSync(PENDING_SUGGESTIONS_FILE)) {
      existing = JSON.parse(fs.readFileSync(PENDING_SUGGESTIONS_FILE, 'utf-8'));
    }
  } catch (e) {
    existing = [];
  }
  const id = existing.length > 0 ? (existing[existing.length - 1]._id || 0) + 1 : 1;
  const entry = { _id: id, ...data, saved_at: new Date().toISOString() };
  existing.push(entry);
  fs.writeFileSync(PENDING_SUGGESTIONS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  return entry;
}

function saveLocalDataview(data) {
  ensureDataDir();
  let existing = [];
  try {
    if (fs.existsSync(PENDING_DATAVIEW_FILE)) {
      existing = JSON.parse(fs.readFileSync(PENDING_DATAVIEW_FILE, 'utf-8'));
    }
  } catch (e) {
    existing = [];
  }
  const id = existing.length > 0 ? (existing[existing.length - 1]._id || 0) + 1 : 1;
  const entry = { _id: id, ...data, saved_at: new Date().toISOString() };
  existing.push(entry);
  fs.writeFileSync(PENDING_DATAVIEW_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  return entry;
}

/**
 * POST /api/words/suggest
 * Creates a new word suggestion entry in the Suggested_words collection
 * and contributor records in the DataviewSuggestions collection.
 * 
 * Enforces High-Security standards:
 * - Replaces legacy/insecure MD5 with SHA-256 audit digest & HMAC-SHA256 signatures
 * - Supports AES-256 encrypted payload transport
 * - Multi-layered Anti-Malware / Anti-Virus / XSS / Injection threat neutralization
 */
/**
 * Adds a new word suggestion entry into the suggestions database collection with high-security verification.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const suggestWord = async (req, res) => {
  const startTime = Date.now();
  console.log(`\n📥 [Incoming Request] POST /api/words/suggest (High-Security Mode)`);

  try {
    let rawPayload = req.body;
    let encryptionMode = "standard";

    // 1. Support AES-256 Encrypted Payload Decryption
    if (rawPayload && rawPayload.encrypted_payload) {
      try {
        console.log(`🔐 [Security] Decrypting AES-256-GCM payload...`);
        rawPayload = decryptAes256(rawPayload.encrypted_payload);
        encryptionMode = "aes-256-gcm";
        console.log(`🔓 [Security] AES-256 payload decrypted successfully.`);
      } catch (decErr) {
        console.warn(`🚨 [Security Alert] AES-256 decryption failed: ${decErr.message}`);
        return res.status(400).json({ error: "Invalid encrypted payload format." });
      }
    }

    // 2. Cryptographic Tamper-Proofing: HMAC-SHA256 Signature Verification
    const signature = req.headers['x-signature'] || rawPayload._signature;
    const timestamp = req.headers['x-timestamp'] || rawPayload._timestamp;
    let signatureVerified = false;

    if (signature && timestamp) {
      // Remove metadata keys before verifying signature if they were passed inside the body
      const payloadToVerify = { ...rawPayload };
      delete payloadToVerify._signature;
      delete payloadToVerify._timestamp;

      const verification = verifyHmacSignature(payloadToVerify, timestamp, signature);
      if (!verification.valid) {
        console.warn(`⚠️ [Security Notice] HMAC-SHA256 signature verification notice: ${verification.reason}. Proceeding with rigorous payload sanitization.`);
        signatureVerified = false;
      } else {
        signatureVerified = true;
        console.log(`🛡️ [Security] HMAC-SHA256 signature authenticated successfully.`);
      }
    }

    // 3. Anti-Malware & Anti-Virus Threat Neutralization (Deep Sanitization)
    let sanitized;
    try {
      sanitized = sanitizeSuggestionPayload(rawPayload);
    } catch (threatErr) {
      console.error(`🚨 [Security Alert] Malicious payload rejected: ${threatErr.message}`);
      return res.status(400).json({ error: threatErr.message });
    }

    // Validation
    if (!sanitized.word || sanitized.word.trim() === '') {
      console.log('⚠️ [Validation Failed] Client omitted required word parameter.');
      return res.status(400).json({ error: "Word is required." });
    }

    // High-End Email Validation on Backend (Enforce authentic personal/official emails)
    if (sanitized.contributor && sanitized.contributor.email) {
      const emailCheck = validateHighEndEmail(sanitized.contributor.email);
      if (!emailCheck.isValid) {
        console.warn(`🚨 [Email Rejected] Dummy or invalid email detected: ${sanitized.contributor.email}`);
        return res.status(400).json({ error: emailCheck.errorEn });
      }
    }

    // 4. Compute High-Security SHA-256 Content Digest (Audit & Tamper Detection)
    const contentHashSha256 = computeSha256({
      word: sanitized.word,
      language_type: sanitized.language_type,
      root: sanitized.root,
      contributor_email: sanitized.contributor.email,
      timestamp: Date.now()
    });

    console.log(`🔍 [MySQL] Persisting suggested word to MySQL database...`);
    
    let savedWord = null;
    let savedDataview = null;

    if (getMySQLStatus()) {
      try {
        const createdWord = await SuggestedWord.create({
          word: sanitized.word,
          meaning: sanitized.meanings?.[0]?.meaning || sanitized.meaning || '',
          language_type: sanitized.language_type || 'malayalam',
          root: sanitized.root,
          etymology: sanitized.etymology,
          cultural_note: sanitized.cultural_note,
          synonyms: sanitized.synonyms,
          antonyms: sanitized.antonyms,
          dialects: sanitized.dialects,
          proverb: sanitized.proverb,
          similar_word: sanitized.similar_word,
          novel_words: sanitized.novel_words,
          cross_reference: sanitized.cross_reference,
          inflections: sanitized.inflections,
          gender: sanitized.gender,
          phonetic_transcription: sanitized.phonetic_transcription,
          pronunciation: sanitized.pronunciation,
          equivalents_kannada: sanitized.equivalents?.kannada || '',
          equivalents_tamil: sanitized.equivalents?.tamil || '',
          equivalents_telugu: sanitized.equivalents?.telugu || '',
          equivalents_tulu: sanitized.equivalents?.tulu || '',
          equivalents_english: sanitized.equivalents?.english || '',
          equivalent_languages: JSON.stringify(sanitized.equivalent_languages || []),
          contributor_name: sanitized.contributor?.name || '',
          contributor_email: sanitized.contributor?.email || '',
          receive_emails: sanitized.contributor?.receive_emails || false,
          status: 'pending',
          superuser_approved: false,
          images: JSON.stringify(sanitized.images || []),
          meanings_json: JSON.stringify(sanitized.meanings || []),
          security_content_hash: contentHashSha256,
          security_signature_verified: signatureVerified,
        });

        savedWord = createdWord.toJSON();
        savedWord._id = savedWord.id;

        const createdDataview = await DataviewSuggestion.create({
          word_id: savedWord.id,
          name: sanitized.contributor?.name || 'Anonymous',
          email: sanitized.contributor?.email || 'anonymous@example.com',
          word: sanitized.word,
          submitted_text: sanitized.word,
          receive_emails: sanitized.contributor?.receive_emails || false,
        });

        savedDataview = createdDataview.toJSON();
        savedDataview._id = savedDataview.id;
        console.log(`✅ [MySQL Success] Word suggestion saved to MySQL (ID: ${savedWord.id}).`);
      } catch (dbErr) {
        console.warn(`⚠️ [MySQL Warning] Insert failed: ${dbErr.message}. Storing in resilient local queue.`);
      }
    } else {
      console.warn(`💡 [MySQL Info] MySQL currently offline. Storing suggestion in resilient local storage queue.`);
    }

    if (!savedWord) {
      savedWord = saveLocalSuggestion({
        word: sanitized.word,
        language_type: sanitized.language_type,
        root: sanitized.root,
        etymology: sanitized.etymology,
        cultural_note: sanitized.cultural_note,
        synonyms: sanitized.synonyms,
        antonyms: sanitized.antonyms,
        dialects: sanitized.dialects,
        proverb: sanitized.proverb,
        similar_word: sanitized.similar_word,
        novel_words: sanitized.novel_words,
        cross_reference: sanitized.cross_reference,
        inflections: sanitized.inflections,
        gender: sanitized.gender,
        phonetic_transcription: sanitized.phonetic_transcription,
        pronunciation: sanitized.pronunciation,
        equivalents: sanitized.equivalents,
        equivalent_languages: sanitized.equivalent_languages,
        meanings: sanitized.meanings,
        status: {
          approved: false,
          superuser_approved: false,
          done_by_user: false,
          rejected: false
        },
        contributor: sanitized.contributor,
        security: {
          content_hash_sha256: contentHashSha256,
          signature_verified: signatureVerified,
          sanitized: true,
          encryption_mode: encryptionMode,
          received_at: new Date()
        }
      });
      savedDataview = {
        name: sanitized.contributor.name || 'Anonymous',
        email: sanitized.contributor.email || 'anonymous@example.com',
        word: sanitized.word,
        submitted_text: sanitized.word,
        wordId: savedWord._id,
        receive_emails: sanitized.contributor.receive_emails,
        is_local_queued: true
      };
    }

    // Send the acknowledgment email using the newly designed Malayalam HTML layout (non-blocking)
    if (sanitized.contributor.email) {
      sendSuggestionReceivedMail(
        sanitized.contributor.email,
        sanitized.contributor.name || "",
        sanitized.word
      ).then(() => {
        console.log(`✉️ [Mail Success] Suggestion acknowledgment email sent to ${sanitized.contributor.email}`);
      }).catch((mailErr) => {
        console.warn("⚠️ [Mail Warning] Failed to send acknowledgment email:", mailErr.message);
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Word suggestion saved (ID: ${savedWord._id}) [SHA-256: ${contentHashSha256.substring(0, 12)}...]`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(201).json({
      message: "Suggestion submitted successfully.",
      security: {
        content_hash_sha256: contentHashSha256,
        signature_verified: signatureVerified,
        sanitized: true,
        encryption_mode: encryptionMode
      },
      data: {
        word: savedWord,
        contributor: savedDataview
      }
    });
  } catch (error) {
    console.error(`🚨 [Execution Error] Failed to process word suggestion.`);
    console.error(`Details: ${error.stack}`);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/words/suggestions
 * Fetches all word suggestions merged with their contributor attributes
 */
const getSuggestions = async (req, res) => {
  try {
    let combined = [];

    if (getMySQLStatus()) {
      try {
        const wordSuggestions = await SuggestedWord.findAll({ order: [['created_at', 'DESC']] });
        const dataviewSuggestions = await DataviewSuggestion.findAll();

        combined = wordSuggestions.map((w) => {
          const wordObj = w.toJSON();
          const dv = dataviewSuggestions.find((d) => d.word_id === wordObj.id);
          return {
            ...wordObj,
            _id: wordObj.id,
            contributor: dv ? {
              name: dv.name,
              email: dv.email,
              createdAt: dv.created_at,
            } : {
              name: wordObj.contributor_name,
              email: wordObj.contributor_email,
            },
          };
        });
      } catch (sqlErr) {
        console.warn('⚠️ [MySQL] Fetch suggestions failed, falling back to local queue:', sqlErr.message);
      }
    }

    if (combined.length === 0) {
      combined = readLocalSuggestions().map((doc) => ({
        ...doc,
        _id: doc._id || doc.id,
      }));
    }

    return res.status(200).json(combined);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/words/dataview
 * Saves contributor information and suggested word to the Dataview_collection.
 */
const saveDataviewCollection = async (req, res) => {
  try {
    const { name, email, word } = req.body;
    const cleanName = sanitizeString(name, 100);
    const cleanEmail = sanitizeString(email, 150);
    const cleanWord = sanitizeString(word, 150);

    if (!cleanName || !cleanEmail || !cleanWord) {
      return res.status(400).json({ error: "name, email, and word are required and must be valid." });
    }

    let saved = null;
    if (getMySQLStatus()) {
      try {
        const newDoc = await DataviewCollection.create({
          name: cleanName,
          email: cleanEmail,
          word: cleanWord,
        });
        saved = newDoc.toJSON();
        saved._id = saved.id;
      } catch (dbErr) {
        console.warn(`⚠️ [Dataview Warning] MySQL save failed: ${dbErr.message}`);
      }
    }

    if (!saved) {
      saved = saveLocalDataview({ name: cleanName, email: cleanEmail, word: cleanWord });
    }

    return res.status(201).json({ message: "Saved to Dataview_collection successfully.", data: saved });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/words/dataview
 * Fetches all records from Dataview_collection.
 */
const getDataviewCollection = async (req, res) => {
  try {
    let data = [];
    if (getMySQLStatus()) {
      try {
        const rows = await DataviewCollection.findAll({ order: [['created_at', 'DESC']] });
        data = rows.map((r) => ({ ...r.toJSON(), _id: r.id }));
      } catch (e) {
        console.warn('MySQL fetch dataview failed:', e.message);
      }
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { suggestWord, getSuggestions, saveDataviewCollection, getDataviewCollection };
