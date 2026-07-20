/**
 * import_direct.js
 * 
 * Direct MongoDB driver import — bypasses Mongoose models entirely.
 * Reads shabdadb.json in 2 passes (same logic as import_json.js)
 * but inserts using the native MongoDB driver with explicit db/collection names.
 * 
 * Run: node migration/import_direct.js
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const JSON_FILE_PATH = '/home/c-dit/Downloads/shabdadb.json';
const DB_NAME = 'BHASHAMITHRAM';

// Collection name map matching the Mongoose model definitions exactly
const COLLECTIONS = {
  english_malayalam:  'English-malayalam_dictionary',
  malayalam_malayalam:'malayalam_malayalam_dictionary',
  malayalam_english:  'Malayalam_English_Dictionary',
  english_english:    'English_English_Dictionary',
  suggested_words:    'Suggested_words',
};

// ── In-memory lookup maps built in Pass 1 ──────────────────────────────────
const categoriesMap    = new Map();
const meaningsMap      = new Map();
const proverbsMap      = new Map();
const imagesMap        = new Map();

const sugMeaningsMap   = new Map();
const sugProverbsMap   = new Map();
const sugImagesMap     = new Map();
const sugCategoriesMap = new Map();

// ── Helpers ────────────────────────────────────────────────────────────────
function toBoolean(val) {
  if (!val) return false;
  return val === '1' || val === 'true' || val === true || val === 1;
}
function strToArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

// ── Pass 1: build lookup maps ──────────────────────────────────────────────
function parsePass1() {
  return new Promise((resolve, reject) => {
    console.log('📖 Pass 1: building lookup maps...');
    const rl = readline.createInterface({
      input: fs.createReadStream(JSON_FILE_PATH),
      crlfDelay: Infinity,
    });

    let currentTable = null;
    let lines = 0;

    rl.on('line', (line) => {
      lines++;
      if (lines % 200000 === 0) process.stdout.write(`   scanned ${lines} lines\r`);

      const s = line.trim();
      if (!s) return;

      if (s.includes('"type":"table"')) {
        const m = s.match(/"name":"([^"]+)"/);
        if (m) currentTable = m[1];
        return;
      }

      if (!s.startsWith('{')) return;
      let json = s.endsWith(',') ? s.slice(0, -1) : s;
      let obj;
      try { obj = JSON.parse(json); } catch { return; }

      const wid = String(obj.dictionary_id || obj.id || '');
      const sid = String(obj.suggestion_id || obj.suggested_word_id || obj.suggestedword_id || obj.id || '');

      switch (currentTable) {
        case 'category':
          categoriesMap.set(String(obj.id), { category: obj.category, language: obj.language });
          break;
        case 'meanings':
          if (!meaningsMap.has(wid)) meaningsMap.set(wid, []);
          meaningsMap.get(wid).push(obj);
          break;
        case 'proverbs':
          if (!proverbsMap.has(wid)) proverbsMap.set(wid, []);
          proverbsMap.get(wid).push(obj);
          break;
        case 'images':
          if (!imagesMap.has(wid)) imagesMap.set(wid, []);
          imagesMap.get(wid).push(obj.image);
          break;
        case 'suggested_meanings':
          if (!sugMeaningsMap.has(sid)) sugMeaningsMap.set(sid, []);
          sugMeaningsMap.get(sid).push(obj);
          break;
        case 'suggested_proverbs':
          if (!sugProverbsMap.has(sid)) sugProverbsMap.set(sid, []);
          sugProverbsMap.get(sid).push(obj);
          break;
        case 'suggested_images':
          if (!sugImagesMap.has(sid)) sugImagesMap.set(sid, []);
          sugImagesMap.get(sid).push(obj.image);
          break;
        case 'suggested_words_categories':
          const scat = String(obj.suggestedword_id);
          if (!sugCategoriesMap.has(scat)) sugCategoriesMap.set(scat, []);
          sugCategoriesMap.get(scat).push(Number(obj.category_id));
          break;
      }
    });

    rl.on('close', () => {
      console.log(`\n   ✅ Pass 1 done. Lines: ${lines}`);
      console.log(`   categories:${categoriesMap.size}  meanings:${meaningsMap.size}  proverbs:${proverbsMap.size}  images:${imagesMap.size}`);
      resolve();
    });
    rl.on('error', reject);
  });
}

// ── Pass 2: parse dictionary rows and bulk-insert ──────────────────────────
function parsePass2(db) {
  return new Promise((resolve, reject) => {
    console.log('📖 Pass 2: inserting documents...');

    const BATCH = 500;
    const batches = {
      english_malayalam:   [],
      malayalam_malayalam: [],
      malayalam_english:   [],
      english_english:     [],
      suggested_words:     [],
    };

    let currentTable = null;
    let processed    = 0;
    let inserted     = 0;

    async function flush(type, force = false) {
      if (!force && batches[type].length < BATCH) return;
      if (batches[type].length === 0) return;
      const docs = batches[type].splice(0);
      try {
        const coll = db.collection(COLLECTIONS[type]);
        const r = await coll.insertMany(docs, { ordered: false });
        inserted += r.insertedCount;
        process.stdout.write(`   [${type}] total inserted: ${inserted}   \r`);
      } catch (e) {
        // BulkWriteError = duplicate _id skips
        if (e.code === 11000 || e.writeErrors) {
          inserted += (docs.length - (e.writeErrors?.length || 0));
        } else {
          console.error(`\n   [${type}] insert error:`, e.message);
        }
      }
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(JSON_FILE_PATH),
      crlfDelay: Infinity,
    });

    rl.on('line', async (line) => {
      const s = line.trim();
      if (!s) return;

      if (s.includes('"type":"table"')) {
        const m = s.match(/"name":"([^"]+)"/);
        if (m) {
          rl.pause();
          for (const key of Object.keys(batches)) await flush(key, true);
          currentTable = m[1];
          rl.resume();
        }
        return;
      }

      if (!s.startsWith('{')) return;
      let json = s.endsWith(',') ? s.slice(0, -1) : s;
      let obj;
      try { obj = JSON.parse(json); } catch { return; }

      if (currentTable === 'dictionary') {
        const dictionaryId = String(obj.id);
        const dictType = obj.dictionary_type || 'malayalam_malayalam';

        // ── attach meanings ────────────────────────────────────────────────
        const meaningsList = meaningsMap.get(dictionaryId) || [];
        const meanings = meaningsList.map(m => ({
          meaning: m.meaning || '',
          context_usage: m.context_usage || '',
        }));

        // ── attach proverbs ────────────────────────────────────────────────
        const proverbsList = proverbsMap.get(dictionaryId) || [];
        const proverbs = proverbsList.map(p => ({
          proverb: p.proverb || '',
          context_usage: p.context_usage || '',
        }));

        // ── attach images ──────────────────────────────────────────────────
        const images = (imagesMap.get(dictionaryId) || []).filter(Boolean);

        // ── attach categories ──────────────────────────────────────────────
        const categoryObjs = [];
        meaningsList.forEach(m => {
          if (m.category_id) {
            const cat = categoriesMap.get(String(m.category_id));
            if (cat && !categoryObjs.some(c => c.category === cat.category)) {
              categoryObjs.push({
                category: cat.category || '',
                meaning:  m.meaning || '',
                meanings: m.meaning || '',
                context:  m.context_usage || '',
                context_usage: m.context_usage || '',
              });
            }
          }
        });

        const base = {
          _id: Number(obj.id),
          word: obj.word ? String(obj.word).trim() : '',
          gender: obj.gender || '',
          Gender: obj.gender || '',
          root: obj.root || '',
          phonetic_transcription: obj.phonetic_transcription || '',
          etymology: obj.etymology || '',
          cultural_note: obj.cultural_note || '',
          synonyms:  strToArray(obj.synonyms),
          antonyms:  strToArray(obj.antonyms),
          dialects:  obj.dialects  || '',
          inflections: obj.inflections || '',
          similar_word: strToArray(obj.similar_word),
          novel_words:  strToArray(obj.novel_words),
          cross_reference: strToArray(obj.cross_reference),
          Category:  categoryObjs,
          category:  categoryObjs.map(c => c.category),
          meanings,
          proverbs,
          images,
          equivalents: {
            english: obj.equivalent_english || '',
            tamil:   obj.equivalent_tamil   || '',
            kannada: obj.equivalent_kannada || '',
            telugu:  obj.equivalent_telugu  || '',
            tulu:    obj.equivalent_tulu    || '',
            malayalam: obj.equivalent_malayalam || '',
          },
          status: {
            approved:           toBoolean(obj.approved),
            superuser_approved: toBoolean(obj.superuser_approved),
            done_by_user:       toBoolean(obj.done_by_user),
          },
        };

        if (dictType === 'english_malayalam') {
          batches.english_malayalam.push(base);
          if (batches.english_malayalam.length >= BATCH) { rl.pause(); await flush('english_malayalam'); rl.resume(); }
        } else if (dictType === 'malayalam_malayalam') {
          batches.malayalam_malayalam.push(base);
          if (batches.malayalam_malayalam.length >= BATCH) { rl.pause(); await flush('malayalam_malayalam'); rl.resume(); }
        } else if (dictType === 'malayalam_english') {
          batches.malayalam_english.push(base);
          if (batches.malayalam_english.length >= BATCH) { rl.pause(); await flush('malayalam_english'); rl.resume(); }
        } else if (dictType === 'english_english') {
          batches.english_english.push(base);
          if (batches.english_english.length >= BATCH) { rl.pause(); await flush('english_english'); rl.resume(); }
        }

        processed++;
        if (processed % 25000 === 0) console.log(`\n   processed ${processed} rows...`);

      } else if (currentTable === 'suggested_words') {
        const sugId = String(obj.id);
        const doc = {
          _id: Number(obj.id),
          word: obj.word ? String(obj.word).trim() : '',
          language_type: obj.dictionary_type || 'malayalam',
          root:  obj.root  || '',
          etymology: obj.etymology || '',
          cultural_note: obj.cultural_note || '',
          synonyms: obj.synonyms || '',
          antonyms: obj.antonyms || '',
          dialects: obj.dialects || '',
          similar_word: obj.similar_word || '',
          novel_words:  obj.novel_words  || '',
          cross_reference: obj.cross_reference || '',
          inflections: obj.inflections || '',
          gender: obj.gender || '',
          phonetic_transcription: obj.phonetic_transcription || '',
          pronunciation: obj.pronunciation || '',
          equivalents: {
            kannada: obj.kannada_equivalent || '',
            tamil:   obj.tamil_equivalent   || '',
            telugu:  obj.telugu_equivalent  || '',
            tulu:    obj.tulu_equivalent    || '',
            english: obj.english_equivalent || '',
          },
          contributor: {
            name:  obj.contributor_name  || '',
            email: obj.contributor_email || '',
          },
          status: {
            approved:           toBoolean(obj.approved),
            superuser_approved: toBoolean(obj.superuser_approved),
            done_by_user:       toBoolean(obj.done_by_user),
            rejected:           toBoolean(obj.rejected),
          },
          categories: sugCategoriesMap.get(sugId) || [],
          images:     sugImagesMap.get(sugId)     || [],
          meanings:   (sugMeaningsMap.get(sugId)  || []).map((m, i) => ({ id: i+1, meaning: m.meaning, context_usage: m.context_usage })),
          proverbs:   (sugProverbsMap.get(sugId)  || []).map((p, i) => ({ id: i+1, proverb: p.proverb, context_usage: p.context_usage })),
        };
        batches.suggested_words.push(doc);
        if (batches.suggested_words.length >= BATCH) { rl.pause(); await flush('suggested_words'); rl.resume(); }
      }
    });

    rl.on('close', async () => {
      for (const key of Object.keys(batches)) await flush(key, true);
      console.log(`\n🏁 Pass 2 done.  Rows processed: ${processed}  Docs inserted: ${inserted}`);
      resolve({ processed, inserted });
    });
    rl.on('error', reject);
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
async function run() {
  const t0 = Date.now();
  console.log('📡 Connecting to MongoDB Atlas...');
  const client = new MongoClient(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 120000,
    connectTimeoutMS: 15000,
  });

  await client.connect();
  const db = client.db(DB_NAME);
  console.log(`✅ Connected to database: ${db.databaseName}\n`);

  // Verify write works
  await db.collection('_import_ping').insertOne({ ts: new Date() });
  await db.collection('_import_ping').drop();
  console.log('✅ Write test OK\n');

  await parsePass1();
  await parsePass2(db);

  // Final counts
  console.log('\n=== FINAL COLLECTION COUNTS ===');
  for (const [key, collName] of Object.entries(COLLECTIONS)) {
    const n = await db.collection(collName).estimatedDocumentCount();
    console.log(`  ${collName}: ${n}`);
  }

  await client.close();
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n🎉 Import finished in ${elapsed}s`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
