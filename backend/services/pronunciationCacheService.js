const mongoose = require('mongoose');

// The active dictionary collection names in the MongoDB database
const DICTIONARY_COLLECTIONS = [
  'malayalam_malayalam_dictionary',
  'English-malayalam_dictionary',
  'Malayalam_English_Dictionary',
  'English_English_Dictionary'
];

let indexesCreated = false;
const ensureIndexes = async (db) => {
  if (indexesCreated) return;
  indexesCreated = true;
  for (const collectionName of DICTIONARY_COLLECTIONS) {
    db.collection(collectionName).createIndex({ word: 1 }).catch(err => {
      console.error(`Failed to create index on ${collectionName}:`, err.message);
    });
  }
};

/**
 * Searches across all dictionary collections to find a word entry.
 * Returns the document and its collection name.
 */
const findWordAndPronunciation = async (word) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not initialized.');
  }

  const cleanWord = word.trim();
  
  // Ensure indexes exist on the 'word' field for O(1) lookups
  ensureIndexes(db);

  // Phase 1: Try Parallelized Exact Match (Fastest, utilizes index)
  const exactMatchPromises = DICTIONARY_COLLECTIONS.map(async (collectionName) => {
    try {
      const doc = await db.collection(collectionName).findOne({ word: cleanWord });
      if (doc) {
        return { document: doc, collectionName };
      }
    } catch (err) {
      console.error(`Error in exact match query for "${collectionName}":`, err.message);
    }
    return null;
  });

  const exactResults = await Promise.all(exactMatchPromises);
  const foundExact = exactResults.find(r => r !== null);
  if (foundExact) {
    return foundExact;
  }

  // Phase 2: Parallelized Case-Insensitive Match (Only for English words, Malayalam has no letter casing)
  const isMalayalam = /[\u0d00-\u0d7f]/.test(cleanWord);
  if (!isMalayalam) {
    const caseInsensitivePromises = DICTIONARY_COLLECTIONS.map(async (collectionName) => {
      try {
        const doc = await db.collection(collectionName).findOne({ 
          word: { $regex: new RegExp(`^${cleanWord}$`, 'i') } 
        });
        if (doc) {
          return { document: doc, collectionName };
        }
      } catch (err) {
        console.error(`Error in regex match query for "${collectionName}":`, err.message);
      }
      return null;
    });

    const caseResults = await Promise.all(caseInsensitivePromises);
    const foundCase = caseResults.find(r => r !== null);
    if (foundCase) {
      return foundCase;
    }
  }

  return null;
};

/**
 * Updates the pronunciation field of a document dynamically.
 * Bypasses Mongoose schema locks to support custom subdocuments.
 */
const updatePronunciation = async (collectionName, id, pronunciationData) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not initialized.');
  }

  await db.collection(collectionName).updateOne(
    { _id: id },
    { 
      $set: { 
        pronunciation: {
          audioUrl: pronunciationData.audioUrl,
          ipa: pronunciationData.ipa || (pronunciationData.pronunciation && pronunciationData.pronunciation.ipa) || null,
          source: pronunciationData.source,
          createdAt: new Date()
        } 
      } 
    }
  );
};

module.exports = {
  findWordAndPronunciation,
  updatePronunciation
};
