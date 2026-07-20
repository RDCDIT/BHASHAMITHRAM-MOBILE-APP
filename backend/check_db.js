require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'BHASHAMITHRAM',
  serverSelectionTimeoutMS: 12000
}).then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('=== COLLECTIONS IN DB ===');
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    const sample = await mongoose.connection.db.collection(col.name).findOne();
    const keys = sample ? Object.keys(sample).slice(0, 8).join(', ') : 'empty';
    console.log(`  ${col.name} -> ${count} docs | keys: ${keys}`);
  }
  process.exit(0);
}).catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
