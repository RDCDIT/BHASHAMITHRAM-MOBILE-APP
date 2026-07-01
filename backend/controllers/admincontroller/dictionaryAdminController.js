const MalayalamMalayalamDictionary = require("../../models/malayalam_malayalam_dictionary");
const MalayalamEnglishDictionary = require("../../models/malayalam_english_dictionary");
const EnglishMalayalamDictionary = require("../../models/english_malayalam_dictionary");
const EnglishEnglishDictionary = require("../../models/english-english-dictionary");
const MalayalamSynonyms = require("../../models/malayalam_synonyms");

// Import word manually into specified dictionary
exports.importManualWord = async (req, res) => {
  const startTime = Date.now();
  console.log(`\n📥 [Incoming Request] POST /api/admin/dictionary/import-manual`);

  try {
    const {
      targetDictionary,
      word,
      category,
      gender,
      root,
      phonetic_transcription,
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
      pronunciation,
      equivalents,
      meanings,
      proverbs,
    } = req.body;

    if (!targetDictionary) {
      return res.status(400).json({ error: "targetDictionary is required." });
    }
    if (!word || word.trim() === "") {
      return res.status(400).json({ error: "word is required." });
    }

    const trimmedWord = word.trim();

    // Select the correct Model
    let Model;
    switch (targetDictionary) {
      case "malayalam-malayalam":
        Model = MalayalamMalayalamDictionary;
        break;
      case "malayalam-english":
        Model = MalayalamEnglishDictionary;
        break;
      case "english-malayalam":
        Model = EnglishMalayalamDictionary;
        break;
      case "english-english":
        Model = EnglishEnglishDictionary;
        break;
      case "malayalam-synonym":
        Model = MalayalamSynonyms;
        break;
      default:
        return res.status(400).json({ error: `Invalid dictionary selected: ${targetDictionary}` });
    }

    // Auto-increment integer ID
    const maxDoc = await Model.findOne().sort({ _id: -1 });
    const nextId = maxDoc && typeof maxDoc._id === "number" ? maxDoc._id + 1 : 1;

    // Helper to clean comma-separated strings to array of strings
    const toArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input.map((item) => item.trim()).filter(Boolean);
      return input.split(",").map((item) => item.trim()).filter(Boolean);
    };

    // Helper to format meanings/proverbs
    const formatMeanings = (mList) => {
      if (!Array.isArray(mList)) return [];
      return mList
        .filter((m) => m && m.meaning && m.meaning.trim() !== "")
        .map((m, idx) => ({
          id: idx + 1,
          meaning: m.meaning.trim(),
          context_usage: m.context_usage ? m.context_usage.trim() : "",
          category_id: m.category_id || undefined
        }));
    };

    const formatProverbs = (pList) => {
      if (!Array.isArray(pList)) return [];
      return pList
        .filter((p) => p && p.proverb && p.proverb.trim() !== "")
        .map((p, idx) => ({
          id: idx + 1,
          proverb: p.proverb.trim(),
          context_usage: p.context_usage ? p.context_usage.trim() : ""
        }));
    };

    let documentData = {
      _id: nextId,
      word: trimmedWord,
    };

    // Populate data based on schema rules
    if (targetDictionary === "malayalam-malayalam") {
      documentData = {
        ...documentData,
        category: category ? category.trim() : "",
        gender: gender ? gender.trim() : "",
        root: root ? root.trim() : "",
        phonetic_transcription: phonetic_transcription ? phonetic_transcription.trim() : "",
        etymology: etymology ? etymology.trim() : "",
        cultural_note: cultural_note ? cultural_note.trim() : "",
        inflections: inflections ? inflections.trim() : "",
        similar_word: toArray(similar_word),
        novel_words: toArray(novel_words),
        synonyms: toArray(synonyms),
        antonyms: toArray(antonyms),
        dialects: toArray(dialects),
        cross_reference: toArray(cross_reference),
        equivalents: {
          english: equivalents?.english ? equivalents.english.trim() : "",
          tamil: equivalents?.tamil ? equivalents.tamil.trim() : "",
          kannada: equivalents?.kannada ? equivalents.kannada.trim() : "",
          telugu: equivalents?.telugu ? equivalents.telugu.trim() : "",
          tulu: equivalents?.tulu ? equivalents.tulu.trim() : "",
        },
        meanings: formatMeanings(meanings),
        proverbs: formatProverbs(proverbs),
      };
    } else if (targetDictionary === "malayalam-english") {
      documentData = {
        ...documentData,
        Category: category ? category.trim() : "",
        Gender: gender ? gender.trim() : "",
        root: root ? root.trim() : "",
        phonetic_transcription: phonetic_transcription ? phonetic_transcription.trim() : "",
        meanings: formatMeanings(meanings),
        proverbs: formatProverbs(proverbs),
        status: {
          approved: true,
          superuser_approved: true,
          done_by_user: true,
        },
      };
    } else if (targetDictionary === "english-malayalam") {
      // Validate gender for enum rule if present
      const allowedGenders = ["പുല്ലിംഗം", "സ്ത്രീലിംഗം", "നപുംസകലിംഗം", "ഉഭയലിംഗം"];
      const finalGender = gender && allowedGenders.includes(gender.trim()) ? gender.trim() : undefined;

      documentData = {
        ...documentData,
        category: category ? category.trim() : "",
        gender: finalGender,
        root: root ? root.trim() : "",
        phonetic_transcription: phonetic_transcription ? phonetic_transcription.trim() : "",
        meanings: formatMeanings(meanings),
        proverbs: formatProverbs(proverbs),
        status: {
          superuser_approved: true,
          done_by_user: true,
        },
      };
    } else if (targetDictionary === "english-english") {
      documentData = {
        ...documentData,
        phonetic_transcription: phonetic_transcription ? phonetic_transcription.trim() : "",
        root: root ? root.trim() : "",
        etymology: etymology ? etymology.trim() : "",
        cultural_note: cultural_note ? cultural_note.trim() : "",
        synonyms: synonyms ? synonyms.toString().trim() : "",
        antonyms: antonyms ? antonyms.toString().trim() : "",
        dialects: dialects ? dialects.toString().trim() : "",
        proverb: proverb ? proverb.toString().trim() : "",
        similar_word: similar_word ? similar_word.toString().trim() : "",
        novel_words: novel_words ? novel_words.toString().trim() : "",
        pronunciation: pronunciation ? pronunciation.trim() : "",
        cross_reference: cross_reference ? cross_reference.toString().trim() : "",
        inflections: inflections ? inflections.trim() : "",
        equivalents: {
          malayalam: equivalents?.malayalam ? equivalents.malayalam.trim() : "",
          tamil: equivalents?.tamil ? equivalents.tamil.trim() : "",
          kannada: equivalents?.kannada ? equivalents.kannada.trim() : "",
          telugu: equivalents?.telugu ? equivalents.telugu.trim() : "",
        },
        status: {
          approved: true,
          superuser_approved: true,
          done_by_user: true,
        },
        meanings: formatMeanings(meanings),
        proverbs: formatProverbs(proverbs),
      };
    } else if (targetDictionary === "malayalam-synonym") {
      documentData = {
        ...documentData,
        synonyms: toArray(synonyms),
      };
    }

    const newDoc = new Model(documentData);
    const savedDoc = await newDoc.save();

    const duration = Date.now() - startTime;
    console.log(`✅ [Import Success] Manual word imported to ${targetDictionary} (ID: ${savedDoc._id}) in ${duration}ms.`);

    return res.status(201).json({
      message: "Word record successfully added to the dictionary.",
      data: savedDoc,
    });
  } catch (error) {
    console.error("🚨 [Manual Import Error]:", error);
    return res.status(500).json({ error: error.message });
  }
};
