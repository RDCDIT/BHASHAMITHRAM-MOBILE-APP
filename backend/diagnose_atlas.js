require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'BHASHAMITHRAM',
  serverSelectionTimeoutMS: 12000,
  socketTimeoutMS: 20000,
}).then(async () => {
  const db = mongoose.connection.db;
  console.log('=== CONNECTED TO:', db.databaseName, '===\n');

  // 1. Check cluster storage
  const admin = db.admin();
  try {
    const dbs = await admin.listDatabases();
    let totalMB = 0;
    console.log('--- All Databases ---');
    dbs.databases.forEach(d => {
      const mb = (d.sizeOnDisk / 1024 / 1024).toFixed(2);
      totalMB += d.sizeOnDisk / 1024 / 1024;
      console.log(`  ${d.name}: ${mb} MB`);
    });
    console.log(`  TOTAL USED: ${totalMB.toFixed(2)} MB of 512 MB (M0 limit)\n`);
  } catch(e) {
    console.log('listDatabases error:', e.message);
  }

  // 2. Test write with writeConcern {w:'majority'} to get actual confirmation
  console.log('--- Write concern test ---');
  try {
    const r = await db.collection('_wc_test').insertOne(
      { ts: new Date(), x: 'test' },
      { writeConcern: { w: 'majority', wtimeout: 10000 } }
    );
    console.log('insertOne acknowledged:', r.acknowledged, '| id:', r.insertedId);
    const found = await db.collection('_wc_test').findOne({ x: 'test' });
    console.log('immediate read-back:', found ? 'FOUND' : 'NOT FOUND');
    await db.collection('_wc_test').drop();
  } catch(e) {
    console.error('Write concern test FAILED:', e.message, '| code:', e.code);
  }

  // 3. Check if the MalayalamMalayalam model collection exists and what its namespace is
  console.log('\n--- Model namespace check ---');
  const MalayalamMalayalamDictionary = require('./models/malayalam_malayalam_dictionary');
  console.log('Model collection namespace:', MalayalamMalayalamDictionary.collection.namespace);
  console.log('Model db name:', MalayalamMalayalamDictionary.db.name);

  // 4. Try raw insertOne directly on the collection
  console.log('\n--- Raw insert test on malayalam_malayalam_dictionary ---');
  try {
    const rawColl = db.collection('malayalam_malayalam_dictionary');
    const r2 = await rawColl.insertOne(
      { _id: 55555551, word: '__RAWTEST__', meanings: [] },
      { writeConcern: { w: 'majority', wtimeout: 10000 } }
    );
    console.log('Raw insert acknowledged:', r2.acknowledged);
    const c = await rawColl.countDocuments();
    console.log('Count after raw insert:', c);
    const found2 = await rawColl.findOne({ _id: 55555551 });
    console.log('Read-back:', found2 ? found2.word : 'NOT FOUND');
    await rawColl.deleteOne({ _id: 55555551 });
  } catch(e) {
    console.error('Raw insert FAILED:', e.message, '| code:', e.code);
    if (e.errInfo) console.error('errInfo:', JSON.stringify(e.errInfo));
  }

  await mongoose.disconnect();
  process.exit(0);
}).catch(e => {
  console.error('Connection error:', e.message);
  process.exit(1);
});
