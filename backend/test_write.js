require('dotenv').config();
const mongoose = require('mongoose');

console.log('Connecting to Atlas...');
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'BHASHAMITHRAM',
  serverSelectionTimeoutMS: 12000,
  socketTimeoutMS: 15000,
  connectTimeoutMS: 12000
}).then(async () => {
  console.log('Connected. DB:', mongoose.connection.db.databaseName);

  const colls = await mongoose.connection.db.listCollections().toArray();
  console.log('Read OK, collections:', colls.length);

  // Check existing count
  const existing = await mongoose.connection.db.collection('malayalam_malayalam_dictionary').estimatedDocumentCount();
  console.log('malayalam_malayalam_dictionary count:', existing);

  console.log('Attempting test write...');
  try {
    const result = await mongoose.connection.db.collection('_test_write').insertOne({ x: 1 });
    console.log('Write OK, insertedId:', result.insertedId);
    await mongoose.connection.db.collection('_test_write').drop();
    console.log('Drop OK');
  } catch(e) {
    console.error('Write FAILED:', e.message, '| code:', e.code);
    if (e.errInfo) console.error('errInfo:', JSON.stringify(e.errInfo));
  }

  await mongoose.disconnect();
  process.exit(0);
}).catch(e => {
  console.error('Connection ERROR:', e.message);
  process.exit(1);
});
