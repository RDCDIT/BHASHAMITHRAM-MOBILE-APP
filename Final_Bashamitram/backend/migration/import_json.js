const fs = require('fs');
const readline = require('readline');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const JSON_FILE_PATH = '/home/c-dit/Downloads/shabdadb.json';

// Models
const EnglishMalayalamDictionary = require('../models/english_malayalam_dictionary');
const MalayalamMalayalamDictionary = require('../models/malayalam_malayalam_dictionary');
const MalayalamEnglishDictionary = require('../models/malayalam_english_dictionary');
const EnglishEnglishDictionary = require('../models/english-english-dictionary');
const SuggestedWord = require('../models/SuggestedWord');

// Transformers
const englishMalayalamTransformer = require('./transformers/englishMalayalam');
const malayalamMalayalamTransformer = require('./transformers/malayalamMalayalam');
const malayalamEnglishTransformer = require('./transformers/malayalamEnglish');
const englishEnglishTransformer = require('./transformers/englishEnglish');

// Maps for Pass 1 (lookups)
const categoriesMap = new Map();
const meaningsMap = new Map();
const proverbsMap = new Map();
const imagesMap = new Map();

const suggestedMeaningsMap = new Map();
const suggestedProverbsMap = new Map();
const suggestedImagesMap = new Map();
const suggestedCategoriesMap = new Map();

function parseFilePass1() {
  return new Promise((resolve, reject) => {
    console.log('📖 Initiating Pass 1 stream...');
    const fileStream = fs.createReadStream(JSON_FILE_PATH);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentTable = null;
    let linesProcessed = 0;

    rl.on('line', (line) => {
      linesProcessed++;
      if (linesProcessed % 100000 === 0) {
        console.log(`   - Scanned ${linesProcessed} lines...`);
      }

      const lineCleaned = line.trim();
      if (!lineCleaned) return;

      // Detect table boundary
      if (lineCleaned.includes('"type":"table"')) {
        const match = lineCleaned.match(/"name":"([^"]+)"/);
        if (match) {
          currentTable = match[1];
          console.log(`   - Found table boundary: "${currentTable}"`);
        }
        return;
      }

      // Parse JSON line
      if (lineCleaned.startsWith('{')) {
        let jsonStr = lineCleaned;
        if (jsonStr.endsWith(',')) {
          jsonStr = jsonStr.slice(0, -1);
        }
        try {
          const obj = JSON.parse(jsonStr);
          if (currentTable === 'category') {
            categoriesMap.set(String(obj.id), {
              category: obj.category,
              language: obj.language
            });
          } else if (currentTable === 'meanings') {
            const wordId = String(obj.dictionary_id);
            if (!meaningsMap.has(wordId)) {
              meaningsMap.set(wordId, []);
            }
            meaningsMap.get(wordId).push(obj);
          } else if (currentTable === 'proverbs') {
            const wordId = String(obj.dictionary_id);
            if (!proverbsMap.has(wordId)) {
              proverbsMap.set(wordId, []);
            }
            proverbsMap.get(wordId).push(obj);
          } else if (currentTable === 'images') {
            const wordId = String(obj.dictionary_id);
            if (!imagesMap.has(wordId)) {
              imagesMap.set(wordId, []);
            }
            imagesMap.get(wordId).push(obj.image);
          } else if (currentTable === 'suggested_meanings') {
            const sugId = String(obj.suggestion_id || obj.suggested_word_id || obj.suggestedword_id);
            if (!suggestedMeaningsMap.has(sugId)) {
              suggestedMeaningsMap.set(sugId, []);
            }
            suggestedMeaningsMap.get(sugId).push(obj);
          } else if (currentTable === 'suggested_proverbs') {
            const sugId = String(obj.suggestion_id || obj.suggested_word_id || obj.suggestedword_id);
            if (!suggestedProverbsMap.has(sugId)) {
              suggestedProverbsMap.set(sugId, []);
            }
            suggestedProverbsMap.get(sugId).push(obj);
          } else if (currentTable === 'suggested_images') {
            const sugId = String(obj.suggestion_id || obj.suggested_word_id || obj.suggestedword_id);
            if (!suggestedImagesMap.has(sugId)) {
              suggestedImagesMap.set(sugId, []);
            }
            suggestedImagesMap.get(sugId).push(obj.image);
          } else if (currentTable === 'suggested_words_categories') {
            const sugId = String(obj.suggestedword_id);
            if (!suggestedCategoriesMap.has(sugId)) {
              suggestedCategoriesMap.set(sugId, []);
            }
            suggestedCategoriesMap.get(sugId).push(Number(obj.category_id));
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    });

    rl.on('close', () => {
      resolve();
    });

    rl.on('error', (err) => {
      reject(err);
    });
  });
}

function parseFilePass2() {
  return new Promise((resolve, reject) => {
    console.log('📖 Initiating Pass 2 stream...');
    const fileStream = fs.createReadStream(JSON_FILE_PATH);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentTable = null;
    const batchSize = 1000;
    const batches = {
      english_malayalam: [],
      malayalam_malayalam: [],
      malayalam_english: [],
      english_english: [],
      suggested_words: []
    };

    let processedCount = 0;
    let insertedCount = 0;

    async function flushBatch(type, force = false) {
      if (batches[type].length === 0) return;
      if (!force && batches[type].length < batchSize) return;

      const docs = batches[type];
      batches[type] = [];

      try {
        if (type === 'english_malayalam') {
          await EnglishMalayalamDictionary.insertMany(docs, { ordered: false });
        } else if (type === 'malayalam_malayalam') {
          await MalayalamMalayalamDictionary.insertMany(docs, { ordered: false });
        } else if (type === 'malayalam_english') {
          await MalayalamEnglishDictionary.insertMany(docs, { ordered: false });
        } else if (type === 'english_english') {
          await EnglishEnglishDictionary.insertMany(docs, { ordered: false });
        } else if (type === 'suggested_words') {
          await SuggestedWord.insertMany(docs, { ordered: false });
        }
        insertedCount += docs.length;
        console.log(`   - [${type}] Inserted batch of ${docs.length}. Total inserted: ${insertedCount}`);
      } catch (err) {
        if (err.name === 'BulkWriteError' || err.code === 11000 || err.writeErrors) {
          const writeErrors = err.writeErrors || [];
          const failedCount = writeErrors.length;
          const succeededCount = docs.length - failedCount;
          insertedCount += succeededCount;
          console.log(`   - [${type}] BulkWrite: ${succeededCount} succeeded, ${failedCount} duplicates skipped.`);
        } else {
          console.error(`   - [${type}] Insertion failed:`, err.message);
        }
      }
    }

    rl.on('line', async (line) => {
      const lineCleaned = line.trim();
      if (!lineCleaned) return;

      if (lineCleaned.includes('"type":"table"')) {
        const match = lineCleaned.match(/"name":"([^"]+)"/);
        if (match) {
          rl.pause();
          // Flush all batches before changing tables
          for (const key of Object.keys(batches)) {
            await flushBatch(key, true);
          }
          currentTable = match[1];
          console.log(`   - Table section start: "${currentTable}"`);
          rl.resume();
        }
        return;
      }

      if (lineCleaned.startsWith('{')) {
        let jsonStr = lineCleaned;
        if (jsonStr.endsWith(',')) {
          jsonStr = jsonStr.slice(0, -1);
        }
        try {
          const obj = JSON.parse(jsonStr);
          if (currentTable === 'dictionary') {
            const dictionaryId = String(obj.id);

            // 1. Attach meanings (as an array of objects, NOT a JSON string)
            const meaningsList = meaningsMap.get(dictionaryId) || [];
            obj.meanings = meaningsList.map(m => ({
              meaning: m.meaning,
              context_usage: m.context_usage || ''
            }));

            // 2. Attach proverbs (as an array of objects, NOT a JSON string)
            const proverbsList = proverbsMap.get(dictionaryId) || [];
            obj.proverbs = proverbsList.map(p => ({
              proverb: p.proverb,
              context_usage: p.context_usage || ''
            }));

            // 3. Attach images (as a proper string array, NOT comma-joined string)
            const imagesList = imagesMap.get(dictionaryId) || [];
            obj.images = imagesList.filter(Boolean);

            // 4. Attach categories
            const wordCategories = [];
            meaningsList.forEach(m => {
              if (m.category_id) {
                const cat = categoriesMap.get(String(m.category_id));
                if (cat && !wordCategories.some(c => c.category === cat.category)) {
                  wordCategories.push({
                    category: cat.category,
                    meaning: m.meaning,
                    meanings: m.meaning,
                    context: m.context_usage,
                    context_usage: m.context_usage
                  });
                }
              }
            });
            obj.Category = wordCategories;
            obj.category = wordCategories.map(c => c.category);

            // 5. Transform and route
            const dictType = obj.dictionary_type || 'malayalam_malayalam';
            let transformed = null;

            if (dictType === 'english_malayalam') {
              transformed = englishMalayalamTransformer.transform(obj);
              batches.english_malayalam.push(transformed);
              if (batches.english_malayalam.length >= batchSize) {
                rl.pause();
                await flushBatch('english_malayalam');
                rl.resume();
              }
            } else if (dictType === 'malayalam_malayalam') {
              transformed = malayalamMalayalamTransformer.transform(obj);
              batches.malayalam_malayalam.push(transformed);
              if (batches.malayalam_malayalam.length >= batchSize) {
                rl.pause();
                await flushBatch('malayalam_malayalam');
                rl.resume();
              }
            } else if (dictType === 'malayalam_english') {
              transformed = malayalamEnglishTransformer.transform(obj);
              batches.malayalam_english.push(transformed);
              if (batches.malayalam_english.length >= batchSize) {
                rl.pause();
                await flushBatch('malayalam_english');
                rl.resume();
              }
            } else if (dictType === 'english_english') {
              transformed = englishEnglishTransformer.transform(obj);
              batches.english_english.push(transformed);
              if (batches.english_english.length >= batchSize) {
                rl.pause();
                await flushBatch('english_english');
                rl.resume();
              }
            }

            processedCount++;
            if (processedCount % 10000 === 0) {
              console.log(`   - Processed ${processedCount} dictionary rows...`);
            }

          } else if (currentTable === 'suggested_words') {
            const sugId = String(obj.id);

            // equivalents
            const equivalents = {
              kannada: obj.kannada_equivalent || "",
              tamil: obj.tamil_equivalent || "",
              telugu: obj.telugu_equivalent || "",
              tulu: obj.tulu_equivalent || "",
              english: obj.english_equivalent || ""
            };

            // status
            const status = {
              approved: obj.approved === "1",
              superuser_approved: obj.superuser_approved === "1",
              done_by_user: obj.done_by_user === "1",
              rejected: obj.rejected === "1"
            };

            // meanings
            const meaningsList = suggestedMeaningsMap.get(sugId) || [];
            const meanings = meaningsList.map((m, idx) => ({
              id: idx + 1,
              meaning: m.meaning,
              context_usage: m.context_usage
            }));

            // proverbs
            const proverbsList = suggestedProverbsMap.get(sugId) || [];
            const proverbs = proverbsList.map((p, idx) => ({
              id: idx + 1,
              proverb: p.proverb,
              context_usage: p.context_usage
            }));

            // images
            const imagesList = suggestedImagesMap.get(sugId) || [];

            // categories
            const categoriesList = suggestedCategoriesMap.get(sugId) || [];

            const doc = {
              _id: Number(obj.id),
              word: obj.word ? String(obj.word).trim() : "",
              language_type: obj.dictionary_type || "malayalam",
              root: obj.root || "",
              etymology: obj.etymology || "",
              cultural_note: obj.cultural_note || "",
              synonyms: obj.synonyms || "",
              antonyms: obj.antonyms || "",
              dialects: obj.dialects || "",
              proverb: obj.proverb || "",
              similar_word: obj.similar_word || "",
              novel_words: obj.novel_words || "",
              cross_reference: obj.cross_reference || "",
              inflections: obj.inflections || "",
              gender: obj.gender || "",
              phonetic_transcription: obj.phonetic_transcription || "",
              pronunciation: obj.pronunciation || "",
              equivalents,
              contributor: {
                name: obj.contributor_name || "",
                email: obj.contributor_email || ""
              },
              status,
              categories: categoriesList,
              images: imagesList,
              meanings,
              proverbs
            };

            batches.suggested_words.push(doc);
            if (batches.suggested_words.length >= batchSize) {
              rl.pause();
              await flushBatch('suggested_words');
              rl.resume();
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    });

    rl.on('close', async () => {
      // Flush final batches
      for (const key of Object.keys(batches)) {
        await flushBatch(key, true);
      }
      console.log(`🏁 Pass 2 completed.`);
      console.log(`   - Dictionary rows processed: ${processedCount}`);
      console.log(`   - Documents inserted/skipped: ${insertedCount}`);
      resolve();
    });

    rl.on('error', (err) => {
      reject(err);
    });
  });
}

async function runImport() {
  const startTime = Date.now();
  console.log('📡 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'BHASHAMITHRAM',
      serverSelectionTimeoutMS: 15000
    });
    console.log('✅ Connection established.');

    await parseFilePass1();
    console.log(`📊 In-memory index statistics:`);
    console.log(`   - Categories: ${categoriesMap.size}`);
    console.log(`   - Word Meanings: ${meaningsMap.size}`);
    console.log(`   - Word Proverbs: ${proverbsMap.size}`);
    console.log(`   - Word Images: ${imagesMap.size}`);
    console.log(`   - Suggested Meanings: ${suggestedMeaningsMap.size}`);
    console.log(`   - Suggested Proverbs: ${suggestedProverbsMap.size}`);
    console.log(`   - Suggested Images: ${suggestedImagesMap.size}`);
    console.log(`   - Suggested Categories: ${suggestedCategoriesMap.size}`);

    await parseFilePass2();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 Import successfully finished in ${duration} seconds.`);
  } catch (err) {
    console.error('❌ Critical failure in migration script:', err.message);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
    process.exit(0);
  }
}

runImport();
