/**
 * @file suggest_word.js
 * @description Controller handles incoming suggestions from users proposing new words/meanings.
 */

const SuggestedWord = require('../models/SuggestedWord');
const DataviewSuggestion = require('../models/DataviewSuggestion');
const DataviewCollection = require('../models/DataviewCollection');
const { sendSuggestionReceivedMail } = require('../services/mailService');

/**
 * POST /api/words/suggest
 * Creates a new word suggestion entry in the Suggested_words collection
 * and contributor records in the DataviewSuggestions collection.
 */
/**
 * Adds a new word suggestion entry into the suggestions database collection.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const suggestWord = async (req, res) => {
  const startTime = Date.now();
  console.log(`\n📥 [Incoming Request] POST /api/words/suggest`);

  try {
    const {
      word,
      root,
      etymology,
      cultural_note,
      synonyms,
      antonyms,
      dialects,
      proverb,
      similar_word,
      novel_words,
      cross_reference,
      inflections,
      gender,
      phonetic_transcription,
      equivalents,
      equivalent_languages,
      contributor,
      meanings,
      proverbs,
      images,
      pronunciation,
      language_type
    } = req.body;

    // Validation
    if (!word || word.trim() === '') {
      console.log('⚠️ [Validation Failed] Client omitted required word parameter.');
      return res.status(400).json({ error: "Word is required." });
    }

    console.log(`🔍 [Database Query] Determining next integer ID for SuggestedWord...`);
    
    // Find the maximum _id to auto-increment sequentially
    const maxDoc = await SuggestedWord.findOne().sort({ _id: -1 });
    const nextId = maxDoc && typeof maxDoc._id === 'number' ? maxDoc._id + 1 : 1;

    console.log(`🔄 [Database] Auto-increment ID resolved to: ${nextId}`);

    // Create the suggested word entry
    const newSuggestion = new SuggestedWord({
      _id: nextId,
      word: word.trim(),
      language_type: language_type ? language_type.trim() : 'malayalam',
      root: root ? root.trim() : '',
      etymology: etymology ? etymology.trim() : '',
      cultural_note: cultural_note ? cultural_note.trim() : '',
      synonyms: synonyms ? synonyms.trim() : '',
      antonyms: antonyms ? antonyms.trim() : '',
      dialects: dialects ? dialects.trim() : '',
      proverb: proverb ? proverb.trim() : '',
      similar_word: similar_word ? similar_word.trim() : '',
      novel_words: novel_words ? novel_words.trim() : '',
      cross_reference: cross_reference ? cross_reference.trim() : '',
      inflections: inflections ? inflections.trim() : '',
      gender: gender ? gender.trim() : '',
      phonetic_transcription: phonetic_transcription ? phonetic_transcription.trim() : '',
      pronunciation: pronunciation ? pronunciation.trim() : '',
      equivalents: {
        kannada: equivalents?.kannada ? equivalents.kannada.trim() : '',
        tamil: equivalents?.tamil ? equivalents.tamil.trim() : '',
        telugu: equivalents?.telugu ? equivalents.telugu.trim() : '',
        tulu: equivalents?.tulu ? equivalents.tulu.trim() : '',
        english: equivalents?.english ? equivalents.english.trim() : ''
      },
      equivalent_languages: Array.isArray(equivalent_languages) ? equivalent_languages.map(el => ({
        language: el.language ? el.language.trim() : '',
        translation: el.translation ? el.translation.trim() : ''
      })) : [],
      contributor: {
        name: contributor?.name ? contributor.name.trim() : '',
        email: contributor?.email ? contributor.email.trim() : ''
      },
      status: {
        approved: false,
        superuser_approved: false,
        done_by_user: false
      },
      images: Array.isArray(images) ? images : [],
      meanings: Array.isArray(meanings) ? meanings.filter(m => m.meaning && m.meaning.trim() !== '').map((m, idx) => ({
        id: idx + 1,
        meaning: m.meaning.trim(),
        context_usage: m.context_usage ? m.context_usage.trim() : ''
      })) : [],
      proverbs: Array.isArray(proverbs) ? proverbs.filter(p => p.proverb && p.proverb.trim() !== '').map((p, idx) => ({
        id: idx + 1,
        proverb: p.proverb.trim(),
        context_usage: p.context_usage ? p.context_usage.trim() : ''
      })) : []
    });

    const savedWord = await newSuggestion.save();

    // Create the DataviewSuggestions contributor record
    const newDataviewSuggestion = new DataviewSuggestion({
      name: contributor?.name ? contributor.name.trim() : 'Anonymous',
      email: contributor?.email ? contributor.email.trim() : 'anonymous@example.com',
      word: word.trim(),
      submitted_text: word.trim(),
      wordId: nextId,
      receive_emails: contributor?.receive_emails || false
    });

    const savedDataview = await newDataviewSuggestion.save();

    // Send the acknowledgment email using the newly designed Malayalam HTML layout
    if (contributor?.email) {
      try {
        await sendSuggestionReceivedMail(
          contributor.email.trim(),
          contributor.name ? contributor.name.trim() : "",
          word.trim()
        );
        console.log(`✉️ [Mail Success] Suggestion acknowledgment email sent to ${contributor.email}`);
      } catch (mailErr) {
        console.error("⚠️ [Mail Error] Failed to send acknowledgment email:", mailErr.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Word suggestion saved (ID: ${savedWord._id}) and contributor details logged to DataviewSuggestions (ID: ${savedDataview._id}).`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(201).json({
      message: "Suggestion submitted successfully.",
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
    const wordSuggestions = await SuggestedWord.find().sort({ createdAt: -1 });
    const dataviewSuggestions = await DataviewSuggestion.find();

    const combined = wordSuggestions.map(wordDoc => {
      const dvDoc = dataviewSuggestions.find(d => d.wordId === wordDoc._id);
      return {
        ...wordDoc.toObject(),
        contributor: dvDoc ? {
          name: dvDoc.name,
          email: dvDoc.email,
          createdAt: dvDoc.createdAt
        } : wordDoc.contributor
      };
    });

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
    if (!name || !name.trim() || !email || !email.trim() || !word || !word.trim()) {
      return res.status(400).json({ error: "name, email, and word are required." });
    }
    const newDoc = new DataviewCollection({
      name: name.trim(),
      email: email.trim(),
      word: word.trim()
    });
    const saved = await newDoc.save();
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
    const data = await DataviewCollection.find().sort({ timestamp: -1 });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { suggestWord, getSuggestions, saveDataviewCollection, getDataviewCollection };
