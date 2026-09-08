/**
 * @file dictionaryAdminController.js
 * @description Admin actions to manage dictionary entries: import, update, read, delete, and upload media attachments.
 */

const MalayalamMalayalamDictionary = require("../../models/malayalam_malayalam_dictionary");
const MalayalamEnglishDictionary = require("../../models/malayalam_english_dictionary");
const EnglishMalayalamDictionary = require("../../models/english_malayalam_dictionary");
const EnglishEnglishDictionary = require("../../models/english-english-dictionary");
const MalayalamSynonyms = require("../../models/malayalam_synonyms");
const EnglishPronunciation = require("../../models/pronounciation_english");
const MalayalamPronunciation = require("../../models/pronounciation_malayalam");
const fs = require("fs");
const path = require("path");
const { idQuery } = require("../../utils/idQuery");

// Import word manually into specified dictionary
/**
 * Manual imports of dictionary terms directly into target collections.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
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

    // Auto-increment integer ID.
    // Restrict to numeric _id docs: collections also contain ObjectId _ids,
    // which sort after numbers in BSON order and would break the max lookup.
    const maxDoc = await Model.findOne({ _id: { $type: "number" } }).sort({ _id: -1 });
    const nextId = maxDoc && typeof maxDoc._id === "number" ? maxDoc._id + 1 : 1;

    // Helper to clean comma-separated strings to array of strings
    const toArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input.map((item) => item.trim()).filter(Boolean);
      return input.split(",").map((item) => item.trim()).filter(Boolean);
    };

    // Helper to format category array
    const formatCategory = (catInput) => {
      if (Array.isArray(catInput)) {
        return catInput.map(c => {
          if (typeof c === 'string') {
            return { meanings: c.trim(), context: "" };
          }
          return {
            meanings: c && (c.meanings || c.meaning || "").trim(),
            context: c && (c.context || c.context_usage || "").trim()
          };
        }).filter(c => c.meanings || c.context);
      }
      if (typeof catInput === 'string' && catInput.trim() !== "") {
        return [{ meanings: catInput.trim(), context: "" }];
      }
      return [];
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
        category: formatCategory(category),
        Category: formatCategory(category),
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
        Category: formatCategory(category),
        category: formatCategory(category),
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
        category: formatCategory(category),
        Category: formatCategory(category),
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
        category: formatCategory(category),
        Category: formatCategory(category),
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

// GET /api/admin/dictionary/words
/**
 * Queries lists of words across various target dictionary collections with pagination.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.getWords = async (req, res) => {
  const startTime = Date.now();
  try {
    const { dictionary, page = 1, limit = 10, search = "" } = req.query;
    if (!dictionary) {
      return res.status(400).json({ error: "dictionary parameter is required." });
    }

    let Model;
    switch (dictionary) {
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
        return res.status(400).json({ error: `Invalid dictionary: ${dictionary}` });
    }

    const query = {};
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { word: searchRegex },
      ];
      if (dictionary === "malayalam-malayalam" || dictionary === "malayalam-english" || dictionary === "english-malayalam" || dictionary === "english-english") {
        query.$or.push({ "meanings.meaning": searchRegex });
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Model.countDocuments(query);
    const records = await Model.find(query)
      .sort({ word: 1 })
      .skip(skip)
      .limit(limitNum);

    const duration = Date.now() - startTime;
    console.log(`✅ [Get Words Success] Fetched ${records.length} records from ${dictionary} in ${duration}ms.`);

    return res.status(200).json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      records,
    });
  } catch (error) {
    console.error("🚨 [Get Words Error]:", error);
    return res.status(500).json({ error: error.message });
  }
};

// PUT /api/admin/dictionary/words/:id
/**
 * Updates dictionary document properties across any dictionary collection.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.updateWord = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  const { targetDictionary, ...updateData } = req.body;

  if (!targetDictionary) {
    return res.status(400).json({ error: "targetDictionary is required." });
  }

  try {
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
        return res.status(400).json({ error: `Invalid dictionary: ${targetDictionary}` });
    }

    const queryId = isNaN(id) ? id : Number(id);

    const toArray = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input.map((item) => item.trim()).filter(Boolean);
      return input.split(",").map((item) => item.trim()).filter(Boolean);
    };

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
      word: updateData.word ? updateData.word.trim() : undefined,
    };

    if (targetDictionary === "malayalam-malayalam") {
      documentData = {
        ...documentData,
        category: updateData.category ? updateData.category.trim() : "",
        gender: updateData.gender ? updateData.gender.trim() : "",
        root: updateData.root ? updateData.root.trim() : "",
        phonetic_transcription: updateData.phonetic_transcription ? updateData.phonetic_transcription.trim() : "",
        etymology: updateData.etymology ? updateData.etymology.trim() : "",
        cultural_note: updateData.cultural_note ? updateData.cultural_note.trim() : "",
        inflections: updateData.inflections ? updateData.inflections.trim() : "",
        similar_word: toArray(updateData.similar_word),
        novel_words: toArray(updateData.novel_words),
        synonyms: toArray(updateData.synonyms),
        antonyms: toArray(updateData.antonyms),
        dialects: toArray(updateData.dialects),
        cross_reference: toArray(updateData.cross_reference),
        equivalents: {
          english: updateData.equivalents?.english ? updateData.equivalents.english.trim() : "",
          tamil: updateData.equivalents?.tamil ? updateData.equivalents.tamil.trim() : "",
          kannada: updateData.equivalents?.kannada ? updateData.equivalents.kannada.trim() : "",
          telugu: updateData.equivalents?.telugu ? updateData.equivalents.telugu.trim() : "",
          tulu: updateData.equivalents?.tulu ? updateData.equivalents.tulu.trim() : "",
        },
        meanings: formatMeanings(updateData.meanings),
        proverbs: formatProverbs(updateData.proverbs),
      };
    } else if (targetDictionary === "malayalam-english") {
      documentData = {
        ...documentData,
        Category: updateData.category ? updateData.category.trim() : "",
        Gender: updateData.gender ? updateData.gender.trim() : "",
        root: updateData.root ? updateData.root.trim() : "",
        phonetic_transcription: updateData.phonetic_transcription ? updateData.phonetic_transcription.trim() : "",
        meanings: formatMeanings(updateData.meanings),
        proverbs: formatProverbs(updateData.proverbs),
      };
    } else if (targetDictionary === "english-malayalam") {
      const allowedGenders = ["പുല്ലിംഗം", "സ്ത്രീലിംഗം", "നപുംസകലിംഗം", "ഉഭയലിംഗം"];
      const finalGender = updateData.gender && allowedGenders.includes(updateData.gender.trim()) ? updateData.gender.trim() : undefined;
      documentData = {
        ...documentData,
        category: updateData.category ? updateData.category.trim() : "",
        gender: finalGender,
        root: updateData.root ? updateData.root.trim() : "",
        phonetic_transcription: updateData.phonetic_transcription ? updateData.phonetic_transcription.trim() : "",
        meanings: formatMeanings(updateData.meanings),
        proverbs: formatProverbs(updateData.proverbs),
      };
    } else if (targetDictionary === "english-english") {
      documentData = {
        ...documentData,
        phonetic_transcription: updateData.phonetic_transcription ? updateData.phonetic_transcription.trim() : "",
        root: updateData.root ? updateData.root.trim() : "",
        etymology: updateData.etymology ? updateData.etymology.trim() : "",
        cultural_note: updateData.cultural_note ? updateData.cultural_note.trim() : "",
        synonyms: updateData.synonyms ? updateData.synonyms.toString().trim() : "",
        antonyms: updateData.antonyms ? updateData.antonyms.toString().trim() : "",
        dialects: updateData.dialects ? updateData.dialects.toString().trim() : "",
        proverb: updateData.proverb ? updateData.proverb.toString().trim() : "",
        similar_word: updateData.similar_word ? updateData.similar_word.toString().trim() : "",
        novel_words: updateData.novel_words ? updateData.novel_words.toString().trim() : "",
        pronunciation: updateData.pronunciation ? updateData.pronunciation.trim() : "",
        cross_reference: updateData.cross_reference ? updateData.cross_reference.toString().trim() : "",
        inflections: updateData.inflections ? updateData.inflections.trim() : "",
        equivalents: {
          malayalam: updateData.equivalents?.malayalam ? updateData.equivalents.malayalam.trim() : "",
          tamil: updateData.equivalents?.tamil ? updateData.equivalents.tamil.trim() : "",
          kannada: updateData.equivalents?.kannada ? updateData.equivalents.kannada.trim() : "",
          telugu: updateData.equivalents?.telugu ? updateData.equivalents.telugu.trim() : "",
        },
        meanings: formatMeanings(updateData.meanings),
        proverbs: formatProverbs(updateData.proverbs),
      };
    } else if (targetDictionary === "malayalam-synonym") {
      documentData = {
        ...documentData,
        synonyms: toArray(updateData.synonyms),
      };
    }

    const updatedDoc = await Model.findOneAndUpdate(idQuery(queryId), documentData, { new: true });
    if (!updatedDoc) {
      return res.status(404).json({ error: "Record not found." });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Update Success] Updated record in ${targetDictionary} (ID: ${queryId}) in ${duration}ms.`);

    return res.status(200).json({
      message: "Record successfully updated.",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("🚨 [Update Word Error]:", error);
    return res.status(500).json({ error: error.message });
  }
};

// DELETE /api/admin/dictionary/words/:id
/**
 * Deletes dictionary documents and associated pronunciation objects.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.deleteWord = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  const { dictionary } = req.query;

  if (!dictionary) {
    return res.status(400).json({ error: "dictionary parameter is required." });
  }

  try {
    let Model;
    switch (dictionary) {
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
        return res.status(400).json({ error: `Invalid dictionary: ${dictionary}` });
    }

    const queryId = isNaN(id) ? id : Number(id);
    const deletedDoc = await Model.findOneAndDelete(idQuery(queryId));
    if (!deletedDoc) {
      return res.status(404).json({ error: "Record not found." });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [Delete Success] Deleted record from ${dictionary} (ID: ${queryId}) in ${duration}ms.`);

    return res.status(200).json({
      message: "Record successfully deleted.",
    });
  } catch (error) {
    console.error("🚨 [Delete Word Error]:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Binds uploaded media files and visual illustrations to specific dictionary records.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
exports.uploadMedia = async (req, res) => {
  const startTime = Date.now();
  console.log(`\n📥 [Incoming Request] POST /api/admin/dictionary/upload-media`);

  try {
    const { dictionary, wordId } = req.body;

    if (!dictionary) {
      return res.status(400).json({ error: "dictionary parameter is required." });
    }
    if (!wordId) {
      return res.status(400).json({ error: "wordId is required." });
    }

    const idNumber = Number(wordId);
    if (isNaN(idNumber)) {
      return res.status(400).json({ error: "wordId must be a valid number." });
    }

    let Model;
    switch (dictionary) {
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
        return res.status(400).json({ error: `Invalid dictionary: ${dictionary}` });
    }

    const wordDoc = await Model.findOne(idQuery(idNumber));
    if (!wordDoc) {
      return res.status(404).json({ error: `Word with ID ${idNumber} not found in ${dictionary}.` });
    }

    let updateData = {};
    let messageParts = [];

    // Handle Image Upload
    if (req.files && req.files.image && req.files.image[0]) {
      const imageFile = req.files.image[0];
      
      // Ensure target directory public/images exists
      const targetDir = path.join(__dirname, "../../public/images");
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Generate a filename
      const ext = path.extname(imageFile.originalname) || ".png";
      const sanitizedWord = wordDoc.word.replace(/[^a-zA-Z0-9\u0d00-\u0d7f]/g, "_");
      const filename = `image-${idNumber}-${sanitizedWord}-${Date.now()}${ext}`;
      const destPath = path.join(targetDir, filename);

      // Move file
      fs.renameSync(imageFile.path, destPath);

      const relativeUrl = `/public/images/${filename}`;
      
      // Set image url
      updateData.images = [relativeUrl];
      messageParts.push("image updated");
    }

    // Handle Audio Upload
    if (req.files && req.files.audio && req.files.audio[0]) {
      const audioFile = req.files.audio[0];
      const audioBuffer = fs.readFileSync(audioFile.path);

      // Pronunciation files are inserted in English_pronounciation and Malayalam_Pronounciation
      let PronModel;
      if (dictionary === "english-malayalam" || dictionary === "english-english") {
        PronModel = EnglishPronunciation;
      } else {
        PronModel = MalayalamPronunciation;
      }

      // Store using corresponding word id
      await PronModel.findOneAndUpdate(
        { _id: idNumber },
        { Pronounciation: audioBuffer },
        { upsert: true, new: true }
      );

      // Delete temp audio file
      if (fs.existsSync(audioFile.path)) {
        fs.unlinkSync(audioFile.path);
      }

      messageParts.push("audio pronunciation updated");
    }

    // Clean up temp files if they still exist
    if (req.files) {
      Object.keys(req.files).forEach((fieldName) => {
        req.files[fieldName].forEach((file) => {
          if (fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch (e) {}
          }
        });
      });
    }

    // Save image update in the word document if image was uploaded
    if (Object.keys(updateData).length > 0) {
      const updatedWord = await Model.findOneAndUpdate(idQuery(idNumber), { $set: updateData }, { new: true });
      wordDoc.images = updatedWord.images;
    }

    const duration = Date.now() - startTime;
    const msg = messageParts.length > 0 ? messageParts.join(" and ") : "no files uploaded";
    console.log(`✅ [Media Upload Success] ${msg} for ID: ${idNumber} in ${duration}ms.`);

    return res.status(200).json({
      success: true,
      message: `Media successfully updated: ${msg}`,
      word: wordDoc,
    });

  } catch (error) {
    console.error("🚨 [Media Upload Error]:", error);
    // Attempt clean up of temp files on error
    if (req.files) {
      Object.keys(req.files).forEach((fieldName) => {
        req.files[fieldName].forEach((file) => {
          if (fs.existsSync(file.path)) {
            try { fs.unlinkSync(file.path); } catch (e) {}
          }
        });
      });
    }
    return res.status(500).json({ error: error.message });
  }
};

