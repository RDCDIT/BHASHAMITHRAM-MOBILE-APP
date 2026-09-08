/**
 * @file dbService.js
 * @description Local SQLite and MongoDB hybrid data provider service for backend.
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Resolve local SQLite database file path
const DB_PATHS = [
  path.join(__dirname, '../../Mobile_app/assets/dictionary.db'),
  path.join(__dirname, '../../../dictionary.db'),
  path.join(__dirname, '../dictionary.db'),
];

let sqliteDb = null;

function initSqlite() {
  if (sqliteDb) return sqliteDb;

  for (const dbPath of DB_PATHS) {
    if (fs.existsSync(dbPath)) {
      console.log(`📦 [SQLite] Initializing local database file at: ${dbPath}`);
      sqliteDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error('❌ [SQLite] Failed to open database:', err.message);
        } else {
          console.log('✅ [SQLite] Connected to local dictionary database.');
        }
      });
      return sqliteDb;
    }
  }

  console.warn('⚠️ [SQLite] No dictionary.db file found in search paths.');
  return null;
}

/**
 * Searches words in local SQLite dictionary.
 */
function searchSqliteWords(dictionaryType, query, limit = 100) {
  return new Promise((resolve, reject) => {
    const db = initSqlite();
    if (!db) return resolve([]);

    const sql = query && query.trim().length > 0
      ? `SELECT d.*, m.meaning as m_meaning FROM dictionary d LEFT JOIN meanings m ON d.id = m.dictionary_id WHERE d.dictionary_type = ? AND d.word LIKE ? ORDER BY d.word LIMIT ?`
      : `SELECT d.*, m.meaning as m_meaning FROM dictionary d LEFT JOIN meanings m ON d.id = m.dictionary_id WHERE d.dictionary_type = ? ORDER BY d.word LIMIT ?`;

    const params = query && query.trim().length > 0
      ? [dictionaryType, `${query.trim()}%`, limit]
      : [dictionaryType, limit];

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('SQLite query error:', err.message);
        return resolve([]);
      }

      // Group rows by word ID to combine meanings
      const wordMap = new Map();
      for (const r of rows) {
        if (!wordMap.has(r.id)) {
          wordMap.set(r.id, {
            _id: r.id,
            word: r.word,
            english_equivalent: r.english_equivalent || '',
            meaning: r.meaning || '',
            meanings: [],
            gender: r.gender || '',
            root: r.root || '',
            etymology: r.etymology || '',
            cultural_note: r.cultural_note || '',
          });
        }
        if (r.m_meaning) {
          wordMap.get(r.id).meanings.push({ meaning: r.m_meaning });
        }
      }

      resolve(Array.from(wordMap.values()));
    });
  });
}

module.exports = {
  initSqlite,
  searchSqliteWords,
};
