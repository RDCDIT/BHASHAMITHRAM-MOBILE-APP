const mongoose = require('mongoose');
const MalayalamMalayalamDictionary = require('./models/malayalam_malayalam_dictionary');

const MONGO_URI = 'mongodb://database_admin_Navaneeth:dbNavaneethDictionary@ac-t97usva-shard-00-00.1s5wiio.mongodb.net:27017,ac-t97usva-shard-00-01.1s5wiio.mongodb.net:27017,ac-t97usva-shard-00-02.1s5wiio.mongodb.net:27017/?ssl=true&replicaSet=atlas-8tx40y-shard-0&authSource=admin&appName=DictionaryDatabase';

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: 'Dictionary' });
  console.log("Connected to MongoDB!");

  const countWithImages = await MalayalamMalayalamDictionary.countDocuments({ images: { $exists: true, $not: { $size: 0 } } });
  console.log(`Documents with images: ${countWithImages}`);

  const docs = await MalayalamMalayalamDictionary.find({ images: { $exists: true, $not: { $size: 0 } } }).limit(5);
  docs.forEach(doc => {
    console.log(`Word: ${doc.word}, Images:`, doc.images);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
