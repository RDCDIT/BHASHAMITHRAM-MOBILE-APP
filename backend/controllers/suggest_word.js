const SuggestedWord = require('../models/SuggestedWord');

/**
 * POST /api/words/suggest
 * Creates a new word suggestion entry in the Suggested_words collection.
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
      contributor,
      meanings,
      proverbs
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

    const newSuggestion = new SuggestedWord({
      _id: nextId,
      word: word.trim(),
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
      equivalents: {
        kannada: equivalents?.kannada ? equivalents.kannada.trim() : '',
        tamil: equivalents?.tamil ? equivalents.tamil.trim() : '',
        telugu: equivalents?.telugu ? equivalents.telugu.trim() : '',
        tulu: equivalents?.tulu ? equivalents.tulu.trim() : '',
        english: equivalents?.english ? equivalents.english.trim() : ''
      },
      contributor: {
        name: contributor?.name ? contributor.name.trim() : '',
        email: contributor?.email ? contributor.email.trim() : ''
      },
      status: {
        approved: false,
        superuser_approved: false,
        done_by_user: false
      },
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

    const savedDoc = await newSuggestion.save();

    const duration = Date.now() - startTime;
    console.log(`✅ [Database Success] Word suggestion for "${savedDoc.word}" successfully saved (ID: ${savedDoc._id}).`);
    console.log(`⚡ [Performance] Request lifecycle resolved in ${duration}ms.`);

    return res.status(201).json({
      message: "Suggestion submitted successfully.",
      data: savedDoc
    });
  } catch (error) {
    console.error(`🚨 [Execution Error] Failed to process word suggestion.`);
    console.error(`Details: ${error.stack}`);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { suggestWord };
