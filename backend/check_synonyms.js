require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { dbName: 'BHASHAMITHRAM', serverSelectionTimeoutMS: 12000 }).then(async () => {
  const db = mongoose.connection.db;
  const coll = db.collection('malayalam_malayalam_dictionary');
  const total = await coll.estimatedDocumentCount();
  const withSyn = await coll.countDocuments({ synonyms: { $exists: true, $ne: [], $not: { $size: 0 } } });
  const withWord = await coll.countDocuments({ word: { $ne: '' } });
  console.log('ml_ml total:', total);
  console.log('ml_ml with non-empty word:', withWord);
  console.log('ml_ml with synonyms:', withSyn);
  const s = await coll.findOne({ synonyms: { $exists: true, $ne: [] } });
  if (s) console.log('synonym sample - word:', s.word, '| synonyms:', JSON.stringify(s.synonyms));
  
  // Also check Malayalam_Synonyms collection
  const synColl = db.collection('Malayalam_Synonyms');
  const synTotal = await synColl.estimatedDocumentCount();
  console.log('\nMalayalam_Synonyms total:', synTotal);
  const synSample = await synColl.findOne();
  if (synSample) console.log('Synonyms sample:', JSON.stringify({ word: synSample.word, synonyms: synSample.synonyms }));
  
  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
