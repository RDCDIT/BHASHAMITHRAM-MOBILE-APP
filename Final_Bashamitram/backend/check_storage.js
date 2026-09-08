require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'BHASHAMITHRAM',
  serverSelectionTimeoutMS: 12000,
  socketTimeoutMS: 20000,
}).then(async () => {
  const adminDb = mongoose.connection.db.admin();

  // List all databases and their sizes
  try {
    const dbs = await adminDb.listDatabases();
    console.log('=== ALL DATABASES ===');
    let total = 0;
    dbs.databases.forEach(d => {
      const mb = (d.sizeOnDisk / 1024 / 1024).toFixed(2);
      total += d.sizeOnDisk;
      console.log(`  ${d.name}: ${mb} MB`);
    });
    console.log(`  TOTAL: ${(total/1024/1024).toFixed(2)} MB`);
  } catch(e) {
    console.error('Cannot list all DBs:', e.message);
  }

  // Get stats for BHASHAMITHRAM
  try {
    const stats = await mongoose.connection.db.stats();
    console.log('\n=== BHASHAMITHRAM DB STATS ===');
    console.log('  dataSize:', (stats.dataSize/1024/1024).toFixed(2), 'MB');
    console.log('  storageSize:', (stats.storageSize/1024/1024).toFixed(2), 'MB');
    console.log('  collections:', stats.collections);
    console.log('  objects:', stats.objects);
  } catch(e) {
    console.error('Cannot get db stats:', e.message);
  }

  // Try inserting 5 docs and check if they persist across a reconnect
  console.log('\n=== PERSISTENCE TEST ===');
  const MalayalamMalayalamDictionary = require('./models/malayalam_malayalam_dictionary');
  try {
    const before = await MalayalamMalayalamDictionary.countDocuments();
    console.log('Count before:', before);
    await MalayalamMalayalamDictionary.insertMany([
      { _id: 77777771, word: '__PERSIST_TEST_1__', meanings: [] },
      { _id: 77777772, word: '__PERSIST_TEST_2__', meanings: [] },
    ], { ordered: false });
    const after = await MalayalamMalayalamDictionary.countDocuments();
    console.log('Count after insert:', after);
    const found = await MalayalamMalayalamDictionary.find({ word: /^__PERSIST/ });
    console.log('Docs found by query:', found.length);
    // Cleanup
    await MalayalamMalayalamDictionary.deleteMany({ word: /^__PERSIST/ });
    console.log('Cleanup done');
  } catch(e) {
    console.error('Persistence test error:', e.message);
  }

  await mongoose.disconnect();
  process.exit(0);
}).catch(e => {
  console.error('Connection error:', e.message);
  process.exit(1);
});
