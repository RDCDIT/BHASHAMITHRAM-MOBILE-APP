/**
 * upload_to_mongo.js
 * ---------------------------------------------------
 * Uploads all dictionary JSON files into the correct
 * MongoDB Atlas collections for the Bhashamitram app.
 *
 * HOW TO USE:
 * 1. Put this file in a folder together with these 5 JSON files:
 *      - malayalam_malayalam_dictionary.json
 *      - malayalam_synonyms.json
 *      - malayalam_english_dictionary.json
 *      - english_malayalam_dictionary.json
 *      - suggested_words.json
 * 2. Install the MongoDB driver (only once):
 *      npm install mongodb
 * 3. Edit the MONGO_URI value below with your real password.
 * 4. Run it:
 *      node upload_to_mongo.js
 * ---------------------------------------------------
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// 1) Connection string pointing to BHASHAMITHRAM database
const MONGO_URI =
  "mongodb://cditresearch_db_user:5i4VaRkTyCsNo4Pd@ac-ywjtcv4-shard-00-00.oevfzpi.mongodb.net:27017,ac-ywjtcv4-shard-00-01.oevfzpi.mongodb.net:27017,ac-ywjtcv4-shard-00-02.oevfzpi.mongodb.net:27017/BHASHAMITHRAM?ssl=true&replicaSet=atlas-1iryw7-shard-0&authSource=admin&appName=BHASHAMITHRAM";

// 2) Must match what backend .env MONGO_URI points to
const DB_NAME = "BHASHAMITHRAM";

// 3) File -> collection name mapping.
//    MUST match the `collection:` name in each Mongoose model file exactly.
const FILES_TO_COLLECTIONS = {
  "malayalam_malayalam_dictionary.json": "malayalam_malayalam_dictionary",  // model: malayalam_malayalam_dictionary.js
  "malayalam_synonyms.json":             "Malayalam_Synonyms",               // model: malayalam_synonyms.js
  "malayalam_english_dictionary.json":   "Malayalam_English_Dictionary",     // model: malayalam_english_dictionary.js
  "english_malayalam_dictionary.json":   "English-malayalam_dictionary",     // model: english_malayalam_dictionary.js
  "suggested_words.json":                "Suggested_words",                  // model: SuggestedWord.js
};

async function main() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("Connected successfully.\n");

    const db = client.db(DB_NAME);

    for (const [fileName, collectionName] of Object.entries(
      FILES_TO_COLLECTIONS
    )) {
      const filePath = path.join(__dirname, fileName);

      if (!fs.existsSync(filePath)) {
        console.log(`SKIPPED: ${fileName} not found in this folder.`);
        continue;
      }

      const raw = fs.readFileSync(filePath, "utf-8");
      const docs = JSON.parse(raw);

      if (!Array.isArray(docs) || docs.length === 0) {
        console.log(`SKIPPED: ${fileName} has no documents.`);
        continue;
      }

      const collection = db.collection(collectionName);
      const result = await collection.insertMany(docs);

      console.log(
        `OK: ${fileName} -> "${collectionName}" collection ` +
        `(${result.insertedCount} documents inserted)`
      );
    }

    console.log("\nAll done.");
  } catch (err) {
    console.error("\nSomething went wrong:");
    console.error(err.message);
  } finally {
    await client.close();
  }
}

main();
