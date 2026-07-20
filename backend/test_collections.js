require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

async function testCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📚 Available Collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Test Malayalam_English_Dictionary
    console.log('\n🔍 Checking Malayalam_English_Dictionary:');
    const malayalamEnglishCount = await db.collection('Malayalam_English_Dictionary').countDocuments();
    console.log(`   Documents: ${malayalamEnglishCount}`);
    
    if (malayalamEnglishCount > 0) {
      const sample = await db.collection('Malayalam_English_Dictionary').findOne();
      console.log('   Sample document:', JSON.stringify(sample, null, 2));
    }
    
    // Check alternative name
    console.log('\n🔍 Checking malayalam_english_dictionary (lowercase):');
    const malayalamEnglishCountLower = await db.collection('malayalam_english_dictionary').countDocuments();
    console.log(`   Documents: ${malayalamEnglishCountLower}`);
    
    if (malayalamEnglishCountLower > 0) {
      const sample = await db.collection('malayalam_english_dictionary').findOne();
      console.log('   Sample document:', JSON.stringify(sample, null, 2));
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCollections();
