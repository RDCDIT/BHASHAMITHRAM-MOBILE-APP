/**
 * @file dictionarySyncService.js
 * @description Centralized service to inspect, verify, compare, and merge suggested words
 * with the active Dictionary database across all dictionary types (malayalam_malayalam,
 * malayalam_english, english_malayalam, malayalam_thesaurus).
 */

const path = require('path');
const fs = require('fs');
let sqlite3;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (e) {
  console.warn("Notice: sqlite3 module not available:", e.message);
}

const { Dictionary, getMySQLStatus } = require('../config/mysql');

// Supported Dictionary Types
const DICTIONARY_TYPES = {
  malayalam_malayalam: {
    key: 'malayalam_malayalam',
    label: 'മലയാളം - മലയാളം',
    enLabel: 'Malayalam - Malayalam',
    badgeColor: '#1E40AF',
    badgeBg: '#EFF6FF',
    icon: '📘',
    description: 'മലയാള പദങ്ങളുടെ സമഗ്ര മലയാള അർത്ഥങ്ങൾ'
  },
  malayalam_english: {
    key: 'malayalam_english',
    label: 'മലയാളം - ഇംഗ്ലീഷ്',
    enLabel: 'Malayalam - English',
    badgeColor: '#065F46',
    badgeBg: '#ECFDF5',
    icon: '📗',
    description: 'മലയാള പദങ്ങളുടെ ഇംഗ്ലീഷ് തർജ്ജമയും അർത്ഥങ്ങളും'
  },
  english_malayalam: {
    key: 'english_malayalam',
    label: 'ഇംഗ്ലീഷ് - മലയാളം',
    enLabel: 'English - Malayalam',
    badgeColor: '#92400E',
    badgeBg: '#FEF3C7',
    icon: '📙',
    description: 'ഇംഗ്ലീഷ് വാക്കുകളുടെ മലയാള അർത്ഥങ്ങൾ'
  },
  malayalam_thesaurus: {
    key: 'malayalam_thesaurus',
    label: 'മലയാളം പര്യായനിഘണ്ടു',
    enLabel: 'Malayalam Thesaurus (Synonyms)',
    badgeColor: '#6B21A8',
    badgeBg: '#F3E8FF',
    icon: '📚',
    description: 'പര്യായപദങ്ങളും സമാനപദങ്ങളും'
  }
};

// Path to SQLite dictionary database in Mobile_app assets
const SQLITE_DB_PATH = path.resolve(__dirname, '../../Mobile_app/assets/dictionary_v2.db');

let sqliteDbInstance = null;

function getSqliteDb() {
  if (!sqlite3) return null;
  if (!fs.existsSync(SQLITE_DB_PATH)) {
    console.warn(`Notice: SQLite database file not found at ${SQLITE_DB_PATH}`);
    return null;
  }
  if (!sqliteDbInstance) {
    sqliteDbInstance = new sqlite3.Database(SQLITE_DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.warn('⚠️ Could not open SQLite dictionary_v2.db for read/write:', err.message);
        sqliteDbInstance = null;
      } else {
        console.log(`✅ [DictionarySync] SQLite dictionary_v2.db connected successfully.`);
      }
    });
  }
  return sqliteDbInstance;
}

/**
 * Normalizes text for comparison (strips extra spaces, punctuation, lowercases)
 */
function normalizeText(text) {
  if (!text) return '';
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s\t\r\n]+/g, ' ')
    .replace(/[.,;:!?]+$/, '');
}

/**
 * Checks if a word exists in either SQLite or MySQL and retrieves all existing meanings,
 * broken down by dictionary_type.
 *
 * @param {string} rawWord - The word to check
 * @param {string} rawMeaning - The suggested meaning to compare against
 * @returns {Promise<Object>} Detailed existence and dictionary type breakdown
 */
async function checkWordInDatabase(rawWord, rawMeaning = '') {
  const word = (rawWord || '').trim();
  const suggestedMeaning = (rawMeaning || '').trim();
  const normalizedSuggested = normalizeText(suggestedMeaning);

  const result = {
    word: word,
    exists: false,
    source: null,
    existingWordId: null,
    existingMeanings: [],
    existingTypes: [],
    enrolledTypeKeys: [],
    allDictionaryTypes: [],
    primaryMeaning: '',
    existingEquivalents: {
      english: '',
      tamil: '',
      kannada: '',
      telugu: '',
      tulu: ''
    },
    isMeaningDifferent: false,
    isNewMeaning: false,
    matchedExistingMeaning: null,
    differenceSummary: ''
  };

  if (!word) return result;

  const typeMap = {};

  // 1. Check SQLite dictionary_v2.db
  const sqlite = getSqliteDb();
  if (sqlite) {
    try {
      const sqliteRows = await new Promise((resolve, reject) => {
        const query = `
          SELECT d.id, d.word, d.dictionary_type, d.meaning, d.english_equivalent,
                 d.tamil_equivalent, d.kannada_equivalent, d.telugu_equivalent,
                 d.tulu_equivalent, d.synonyms, d.root, d.gender, d.phonetic_transcription,
                 m.meaning AS sub_meaning
          FROM dictionary d
          LEFT JOIN meanings m ON d.id = m.dictionary_id
          WHERE d.word = ? COLLATE NOCASE
        `;
        sqlite.all(query, [word], (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      });

      if (sqliteRows.length > 0) {
        result.exists = true;
        result.source = 'sqlite';
        result.existingWordId = sqliteRows[0].id;
        result.existingEquivalents = {
          english: sqliteRows[0].english_equivalent || '',
          tamil: sqliteRows[0].tamil_equivalent || '',
          kannada: sqliteRows[0].kannada_equivalent || '',
          telugu: sqliteRows[0].telugu_equivalent || '',
          tulu: sqliteRows[0].tulu_equivalent || ''
        };

        const globalMeaningSet = new Set();

        sqliteRows.forEach(r => {
          const dtype = r.dictionary_type || 'malayalam_malayalam';
          if (!typeMap[dtype]) {
            typeMap[dtype] = {
              type: dtype,
              label: DICTIONARY_TYPES[dtype]?.label || dtype,
              enLabel: DICTIONARY_TYPES[dtype]?.enLabel || dtype,
              icon: DICTIONARY_TYPES[dtype]?.icon || '📖',
              id: r.id,
              meanings: new Set()
            };
          }

          if (r.meaning && r.meaning.trim()) {
            r.meaning.split(/[;,]+/).forEach(m => {
              if (m.trim()) {
                typeMap[dtype].meanings.add(m.trim());
                globalMeaningSet.add(m.trim());
              }
            });
          }
          if (r.sub_meaning && r.sub_meaning.trim()) {
            typeMap[dtype].meanings.add(r.sub_meaning.trim());
            globalMeaningSet.add(r.sub_meaning.trim());
          }
        });

        result.existingMeanings = Array.from(globalMeaningSet);
        result.primaryMeaning = result.existingMeanings[0] || (sqliteRows[0].meaning || '');
      }
    } catch (e) {
      console.warn("SQLite check error:", e.message);
    }
  }

  // 2. Check MySQL Dictionary table (if connected)
  if (getMySQLStatus() && Dictionary) {
    try {
      const mysqlRows = await Dictionary.findAll({
        where: { word: word }
      });

      if (mysqlRows && mysqlRows.length > 0) {
        result.exists = true;
        result.source = result.source ? 'both' : 'mysql';
        if (!result.existingWordId) result.existingWordId = mysqlRows[0].id;

        mysqlRows.forEach(row => {
          const dtype = row.dictionary_type || 'malayalam_malayalam';
          if (!typeMap[dtype]) {
            typeMap[dtype] = {
              type: dtype,
              label: DICTIONARY_TYPES[dtype]?.label || dtype,
              enLabel: DICTIONARY_TYPES[dtype]?.enLabel || dtype,
              icon: DICTIONARY_TYPES[dtype]?.icon || '📖',
              id: row.id,
              meanings: new Set()
            };
          }

          if (row.meaning && row.meaning.trim()) {
            row.meaning.split(/[;,]+/).forEach(p => {
              const clean = p.trim();
              if (clean) {
                typeMap[dtype].meanings.add(clean);
                if (!result.existingMeanings.includes(clean)) {
                  result.existingMeanings.push(clean);
                }
              }
            });
          }
        });

        if (!result.primaryMeaning) result.primaryMeaning = result.existingMeanings[0] || mysqlRows[0].meaning;
      }
    } catch (err) {
      console.warn("MySQL Dictionary check error:", err.message);
    }
  }

  // Format existingTypes array
  result.existingTypes = Object.keys(typeMap).map(k => ({
    type: k,
    label: typeMap[k].label,
    enLabel: typeMap[k].enLabel,
    icon: typeMap[k].icon,
    id: typeMap[k].id,
    meanings: Array.from(typeMap[k].meanings),
    meaningCount: typeMap[k].meanings.size
  }));

  result.enrolledTypeKeys = result.existingTypes.map(t => t.type);

  // Format all supported dictionary types with enrollment status
  result.allDictionaryTypes = Object.keys(DICTIONARY_TYPES).map(k => {
    const meta = DICTIONARY_TYPES[k];
    const enrolled = typeMap[k];
    return {
      key: k,
      label: meta.label,
      enLabel: meta.enLabel,
      icon: meta.icon,
      description: meta.description,
      isEnrolled: !!enrolled,
      id: enrolled ? enrolled.id : null,
      meanings: enrolled ? Array.from(enrolled.meanings) : [],
      meaningCount: enrolled ? enrolled.meanings.size : 0
    };
  });

  // 3. Meaning Difference & Novelty Evaluation
  if (result.exists) {
    if (!suggestedMeaning) {
      result.isMeaningDifferent = false;
      result.isNewMeaning = false;
      result.differenceSummary = 'നിർദ്ദേശിച്ച അർത്ഥം നൽകിയിട്ടില്ല (No suggested meaning provided)';
    } else {
      const normalizedExisting = result.existingMeanings.map(m => normalizeText(m));
      const exactMatch = normalizedExisting.find(m => m === normalizedSuggested);
      const partialMatch = normalizedExisting.find(m => m.includes(normalizedSuggested) || normalizedSuggested.includes(m));

      if (exactMatch) {
        result.isMeaningDifferent = false;
        result.isNewMeaning = false;
        result.matchedExistingMeaning = exactMatch;
        result.differenceSummary = 'ഈ അർത്ഥം നിലവിൽ നിഘണ്ടുവിൽ ഉള്ളതാണ് (Identical meaning already in DB)';
      } else if (partialMatch) {
        result.isMeaningDifferent = true;
        result.isNewMeaning = false;
        result.matchedExistingMeaning = partialMatch;
        result.differenceSummary = 'സമാനമായ അർത്ഥം നിലവിലുണ്ട് (Similar/overlapping meaning exists)';
      } else {
        result.isMeaningDifferent = true;
        result.isNewMeaning = true;
        result.differenceSummary = 'പുതിയ അധിക അർത്ഥം (Novel/Additional meaning for this word)';
      }
    }
  } else {
    result.isMeaningDifferent = true;
    result.isNewMeaning = true;
    result.differenceSummary = 'ഈ വാക്ക് നിഘണ്ടുവിൽ ലഭ്യമല്ല. പുതിയ വാക്കായി ചേർക്കാം (Word not in DB. Brand new entry)';
  }

  return result;
}

/**
 * Batch checks a list of suggestions and decorates each with live DB status.
 */
async function batchCheckSuggestions(suggestions) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return suggestions;

  const enriched = await Promise.all(
    suggestions.map(async (item) => {
      const word = item.word || '';
      const meaning = item.meaning || item.malayalamMeaning || '';
      const check = await checkWordInDatabase(word, meaning);

      return {
        ...item,
        dbStatus: {
          existsInDb: check.exists,
          source: check.source,
          existingWordId: check.existingWordId,
          existingMeanings: check.existingMeanings,
          existingTypes: check.existingTypes,
          enrolledTypeKeys: check.enrolledTypeKeys,
          allDictionaryTypes: check.allDictionaryTypes,
          primaryMeaning: check.primaryMeaning,
          isMeaningDifferent: check.isMeaningDifferent,
          isNewMeaning: check.isNewMeaning,
          differenceSummary: check.differenceSummary,
          matchedExistingMeaning: check.matchedExistingMeaning,
        }
      };
    })
  );

  return enriched;
}

/**
 * Approves a suggested word and adds/merges it into specified dictionary types.
 *
 * @param {Object} item - The suggested word object
 * @param {Array<string>} targetTypes - Array of dictionary_type keys to apply to
 * @returns {Promise<Object>} Details of the merge/insert action taken
 */
async function mergeOrInsertWord(item, targetTypes = null) {
  const word = (item.word || '').trim();
  const meaning = (item.meaning || item.malayalamMeaning || '').trim();
  const equivalents = item.equivalents || {};
  const englishEq = equivalents.english || item.equivalents_english || (item.language_type === 'english' ? word : '');
  const tamilEq = equivalents.tamil || item.equivalents_tamil || '';
  const kannadaEq = equivalents.kannada || item.equivalents_kannada || '';
  const teluguEq = equivalents.telugu || item.equivalents_telugu || '';
  const tuluEq = equivalents.tulu || item.equivalents_tulu || '';
  const synonyms = Array.isArray(item.synonyms) ? item.synonyms.join(', ') : (item.synonyms || '');
  const root = item.root || '';
  const gender = item.gender || '';
  const phonetic = item.phonetic_transcription || '';
  const proverb = item.proverb || '';

  const check = await checkWordInDatabase(word, meaning);

  // Determine target dictionary types
  let selectedTypes = [];
  if (Array.isArray(targetTypes) && targetTypes.length > 0) {
    selectedTypes = targetTypes.filter(t => DICTIONARY_TYPES[t]);
  }

  if (selectedTypes.length === 0) {
    if (check.exists && check.enrolledTypeKeys.length > 0) {
      selectedTypes = check.enrolledTypeKeys;
    } else {
      // Default type based on language
      const isEnglish = (item.language_type === 'english') || /^[A-Za-z\s]+$/.test(word);
      selectedTypes = isEnglish ? ['english_malayalam'] : ['malayalam_malayalam'];
    }
  }

  const sqlite = getSqliteDb();
  const typeResults = [];

  for (const dtype of selectedTypes) {
    const typeLabel = DICTIONARY_TYPES[dtype]?.label || dtype;
    let typeAction = 'created';

    // 1. SQLite Processing
    if (sqlite) {
      try {
        // Check if word exists in this specific dictionary_type
        const existingRow = await new Promise((resolve, reject) => {
          sqlite.get(
            `SELECT id, word, dictionary_type, meaning FROM dictionary WHERE word = ? AND dictionary_type = ? COLLATE NOCASE`,
            [word, dtype],
            (err, row) => {
              if (err) return reject(err);
              resolve(row);
            }
          );
        });

        if (existingRow) {
          // Merge meaning into existing entry for this type
          typeAction = 'merged';
          const targetId = existingRow.id;

          // Insert meaning into `meanings` table if not already present
          if (meaning) {
            const hasMeaning = await new Promise((resolve) => {
              sqlite.get(
                `SELECT id FROM meanings WHERE dictionary_id = ? AND meaning = ? COLLATE NOCASE`,
                [targetId, meaning],
                (_, r) => resolve(!!r)
              );
            });

            if (!hasMeaning) {
              await new Promise((resolve, reject) => {
                sqlite.run(
                  `INSERT INTO meanings (meaning, dictionary_id, context_usage) VALUES (?, ?, ?)`,
                  [meaning, targetId, ''],
                  (err) => {
                    if (err) return reject(err);
                    resolve();
                  }
                );
              });
            }
          }

          // Update dictionary row string
          let updatedMeaningStr = existingRow.meaning || '';
          if (meaning && !updatedMeaningStr.toLowerCase().includes(meaning.toLowerCase())) {
            updatedMeaningStr = updatedMeaningStr ? `${updatedMeaningStr}; ${meaning}` : meaning;
          }

          await new Promise((resolve, reject) => {
            sqlite.run(
              `UPDATE dictionary SET
                 meaning = ?,
                 english_equivalent = COALESCE(NULLIF(english_equivalent, ''), ?),
                 tamil_equivalent = COALESCE(NULLIF(tamil_equivalent, ''), ?),
                 kannada_equivalent = COALESCE(NULLIF(kannada_equivalent, ''), ?),
                 telugu_equivalent = COALESCE(NULLIF(telugu_equivalent, ''), ?),
                 tulu_equivalent = COALESCE(NULLIF(tulu_equivalent, ''), ?),
                 root = COALESCE(NULLIF(root, ''), ?),
                 gender = COALESCE(NULLIF(gender, ''), ?),
                 phonetic_transcription = COALESCE(NULLIF(phonetic_transcription, ''), ?),
                 proverb = COALESCE(NULLIF(proverb, ''), ?),
                 approved = 1,
                 superuser_approved = 1
               WHERE id = ?`,
              [
                updatedMeaningStr, englishEq, tamilEq, kannadaEq,
                teluguEq, tuluEq, root, gender, phonetic, proverb, targetId
              ],
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });

          console.log(`✅ [SQLite] Merged meaning into ${dtype} (ID: ${targetId}) for "${word}"`);
        } else {
          // Create new row for this dictionary_type
          typeAction = 'created';
          const newDictId = await new Promise((resolve, reject) => {
            sqlite.run(
              `INSERT INTO dictionary (
                 word, meaning, english_equivalent, tamil_equivalent, kannada_equivalent,
                 telugu_equivalent, tulu_equivalent, root, gender, phonetic_transcription,
                 proverb, synonyms, approved, superuser_approved, dictionary_type
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
              [
                word, meaning, englishEq, tamilEq, kannadaEq, teluguEq, tuluEq,
                root, gender, phonetic, proverb, synonyms, dtype
              ],
              function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
              }
            );
          });

          if (newDictId && meaning) {
            await new Promise((resolve, reject) => {
              sqlite.run(
                `INSERT INTO meanings (meaning, dictionary_id, context_usage) VALUES (?, ?, ?)`,
                [meaning, newDictId, ''],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            });
          }
          console.log(`✅ [SQLite] Created new entry in ${dtype} (ID: ${newDictId}) for "${word}"`);
        }
      } catch (err) {
        console.warn(`SQLite error for type ${dtype}:`, err.message);
      }
    }

    // 2. MySQL Processing (if connected)
    if (getMySQLStatus() && Dictionary) {
      try {
        const existingMySQL = await Dictionary.findOne({
          where: { word: word }
        });

        if (existingMySQL) {
          let mysqlMeaning = existingMySQL.meaning || '';
          if (meaning && !mysqlMeaning.toLowerCase().includes(meaning.toLowerCase())) {
            mysqlMeaning = mysqlMeaning ? `${mysqlMeaning}; ${meaning}` : meaning;
          }
          await existingMySQL.update({
            meaning: mysqlMeaning,
            english_equivalent: existingMySQL.english_equivalent || englishEq,
            tamil_equivalent: existingMySQL.tamil_equivalent || tamilEq,
            kannada_equivalent: existingMySQL.kannada_equivalent || kannadaEq,
            telugu_equivalent: existingMySQL.telugu_equivalent || teluguEq,
            tulu_equivalent: existingMySQL.tulu_equivalent || tuluEq,
            root: existingMySQL.root || root,
            gender: existingMySQL.gender || gender,
            phonetic_transcription: existingMySQL.phonetic_transcription || phonetic,
            approved: '1',
            superuser_approved: '1',
          });
        } else {
          await Dictionary.create({
            word: word,
            meaning: meaning,
            english_equivalent: englishEq,
            tamil_equivalent: tamilEq,
            kannada_equivalent: kannadaEq,
            telugu_equivalent: teluguEq,
            tulu_equivalent: tuluEq,
            root: root,
            gender: gender,
            phonetic_transcription: phonetic,
            proverb: proverb,
            synonyms: synonyms,
            approved: '1',
            superuser_approved: '1',
          });
        }
      } catch (mysqlErr) {
        console.warn("MySQL sync error:", mysqlErr.message);
      }
    }

    typeResults.push({
      type: dtype,
      label: typeLabel,
      action: typeAction
    });
  }

  const anyMerged = typeResults.some(r => r.action === 'merged');
  const mainAction = anyMerged ? 'merged' : 'created';
  const typeLabelsJoined = typeResults.map(r => r.label).join(', ');

  const actionMessage = anyMerged
    ? `തിരഞ്ഞെടുത്ത നിഘണ്ടുക്കളിലേക്ക് (${typeLabelsJoined}) പുതിയ അർത്ഥം വിജയകരമായി ലയിപ്പിച്ചു!`
    : `തിരഞ്ഞെടുത്ത നിഘണ്ടുക്കളിലേക്ക് (${typeLabelsJoined}) വാക്ക് പുതിയതായി വിജയകരമായി ചേർത്തു!`;

  return {
    success: true,
    action: mainAction,
    word: word,
    selectedTypes: selectedTypes,
    typeResults: typeResults,
    message: actionMessage
  };
}

module.exports = {
  DICTIONARY_TYPES,
  checkWordInDatabase,
  batchCheckSuggestions,
  mergeOrInsertWord,
  getSqliteDb
};
