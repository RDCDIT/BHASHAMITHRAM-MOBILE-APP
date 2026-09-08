/**
 * clear_and_reimport.js
 * 
 * Step 1: Drops the 4 dictionary collections that were imported
 *         with wrong data types (meanings as JSON strings, etc.)
 * Step 2: Re-runs the fixed import_json.js script automatically.
 * 
 * Run: node migration/clear_and_reimport.js
 */

const path = require('path');
const mongoose = require('mongoose');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const COLLECTIONS_TO_CLEAR = [
  'malayalam_malayalam_dictionary',
  'English-malayalam_dictionary',
  'Malayalam_English_Dictionary',
  'English_English_Dictionary',
  'Suggested_words',
];

async function clearAndReimport() {
  console.log('📡 Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: 'BHASHAMITHRAM',
    serverSelectionTimeoutMS: 15000
  });
  console.log('✅ Connected.\n');

  const db = mongoose.connection.db;

  console.log('🗑️  Clearing incorrectly imported collections...');
  for (const colName of COLLECTIONS_TO_CLEAR) {
    try {
      const result = await db.collection(colName).deleteMany({});
      console.log(`   - ${colName}: deleted ${result.deletedCount} documents`);
    } catch (err) {
      console.log(`   - ${colName}: (does not exist or already empty)`);
    }
  }

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected.\n');

  console.log('🚀 Starting the fixed import (this will take several minutes)...\n');
  console.log('═'.repeat(60));

  // Run the fixed import_json.js
  execSync(`node ${path.join(__dirname, 'import_json.js')}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
}

clearAndReimport().catch(err => {
  console.error('❌ Fatal Error:', err.message);
  process.exit(1);
});
