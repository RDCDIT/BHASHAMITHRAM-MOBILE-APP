/**
 * import_synonyms.js
 * 
 * Imports the thesaurus.json file into the Malayalam_Synonyms collection.
 * Each entry has: id, word, meanings (comma-separated synonyms), antonym, category, example
 * 
 * Run: node migration/import_synonyms.js
 */

const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const THESAURUS_FILE = '/home/c-dit/Downloads/Bhashamithram/bhashamithram_dictionary_sort/json/thesaurus.json';
const DB_NAME = 'BHASHAMITHRAM';
const COLLECTION = 'Malayalam_Synonyms';

async function run() {
  console.log('📡 Connecting to MongoDB Atlas...');
  const client = new MongoClient(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 60000,
  });

  await client.connect();
  const db = client.db(DB_NAME);
  console.log(`✅ Connected to: ${db.databaseName}`);

  // Clear existing sample data
  const existing = await db.collection(COLLECTION).countDocuments();
  console.log(`Existing docs in ${COLLECTION}: ${existing}`);
  if (existing > 0) {
    await db.collection(COLLECTION).deleteMany({});
    console.log(`Cleared ${existing} existing docs`);
  }

  // Load and parse thesaurus.json
  console.log(`\n📖 Loading ${THESAURUS_FILE}...`);
  const raw = require('fs').readFileSync(THESAURUS_FILE, 'utf-8');
  const entries = JSON.parse(raw);
  console.log(`Found ${entries.length} entries`);

  // Transform entries
  const docs = entries
    .filter(e => e.word && String(e.word).trim() !== '')
    .map(e => {
      // meanings field is a semicolon-separated string of groups, 
      // each group is comma-separated synonyms
      const rawMeanings = e.meanings || '';
      const synonyms = rawMeanings
        .split(/[;,]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      return {
        _id: Number(e.id),
        word: String(e.word).trim(),
        synonyms,
        antonyms: e.antonym ? [e.antonym.trim()].filter(Boolean) : [],
        example: e.example || '',
        category: e.category || '',
        lookup: e.lookup || '',
      };
    });

  console.log(`\nInserting ${docs.length} synonym entries...`);

  // Batch insert
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH);
    try {
      const r = await db.collection(COLLECTION).insertMany(batch, { ordered: false });
      inserted += r.insertedCount;
    } catch (e) {
      if (e.code === 11000 || e.writeErrors) {
        inserted += batch.length - (e.writeErrors?.length || 0);
      } else {
        console.error('Batch error:', e.message);
      }
    }
    process.stdout.write(`  inserted: ${inserted}\r`);
  }

  console.log(`\n✅ Done! Total inserted: ${inserted}`);

  // Verify
  const final = await db.collection(COLLECTION).estimatedDocumentCount();
  console.log(`Final count in ${COLLECTION}: ${final}`);

  // Sample
  const sample = await db.collection(COLLECTION).findOne({ synonyms: { $not: { $size: 0 } } });
  if (sample) {
    console.log(`\nSample: "${sample.word}" -> ${JSON.stringify(sample.synonyms.slice(0, 5))}`);
  }

  await client.close();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
