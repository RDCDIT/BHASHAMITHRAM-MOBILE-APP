import { getDatabase } from "./database";
import { DictionaryEntry } from "./types";



export type SearchResult = DictionaryEntry;

// -------------------- Malayalam --------------------

export async function searchMalayalam(
  word: string
): Promise<SearchResult[]> {

  const db = await getDatabase();

  console.log("Searching:", word);

  const rows = await db.getAllAsync<{ json: string }>(
    `
    SELECT json
    FROM malayalam_dictionary
    WHERE word LIKE ?
    ORDER BY word
    LIMIT 100;
    `,
    [`${word}%`]
  );

  console.log("Rows found:", rows.length);

  if (rows.length > 0) {
    console.log("First row:", rows[0]);
  }

  return rows.map(r => JSON.parse(r.json));
}

export async function getMalayalamWord(
  word: string
): Promise<DictionaryEntry | null> {

  const db = await getDatabase();
  console.log("Loading word:", word);


  const row = await db.getFirstAsync<{ json: string }>(
    `
    SELECT json
    FROM malayalam_dictionary
    WHERE word = ?
    LIMIT 1;
    `,
    [word]
  );
  console.log("Result:", row);

  if (!row) {
    return null;
  }

  return JSON.parse(row.json);
}

// -------------------- English --------------------

export async function searchEnglish(
  word: string
): Promise<SearchResult[]> {

  const db = await getDatabase();

  const rows = await db.getAllAsync<{ json: string }>(
    `
    SELECT json
    FROM english_dictionary
    WHERE word LIKE ?
    ORDER BY word
    LIMIT 100;
    `,
    [`${word}%`]
  );

  return rows.map(r => JSON.parse(r.json));
}

export async function getEnglishWord(
  word: string
): Promise<DictionaryEntry | null> {

  const db = await getDatabase();

  const row = await db.getFirstAsync<{ json: string }>(
    `
    SELECT json
    FROM english_dictionary
    WHERE word = ?
    LIMIT 1;
    `,
    [word]
  );

  return row ? JSON.parse(row.json) : null;
}

// ---------------- Malayalam → English ----------------

export async function searchMalayalamEnglish(
  word: string
): Promise<SearchResult[]> {

  const db = await getDatabase();

  const rows = await db.getAllAsync<{ json: string }>(
    `
    SELECT json
    FROM malayalam_english
    WHERE word LIKE ?
    ORDER BY word
    LIMIT 100;
    `,
    [`${word}%`]
  );

  return rows.map(r => JSON.parse(r.json));
}

export async function getMalayalamEnglishWord(
  word: string
): Promise<DictionaryEntry | null> {

  const db = await getDatabase();

  const row = await db.getFirstAsync<{ json: string }>(
    `
    SELECT json
    FROM malayalam_english
    WHERE word = ?
    LIMIT 1;
    `,
    [word]
  );

  return row ? JSON.parse(row.json) : null;
}

// -------------------- Synonyms --------------------

export async function searchSynonym(
  word: string
): Promise<SearchResult[]> {

  const db = await getDatabase();

  const rows = await db.getAllAsync<{ json: string }>(
    `
    SELECT json
    FROM synonyms
    WHERE word LIKE ?
    ORDER BY word
    LIMIT 100;
    `,
    [`${word}%`]
  );

  return rows.map(r => JSON.parse(r.json));
}


export async function getSynonymWord(
  word: string
): Promise<DictionaryEntry | null> {

  const db = await getDatabase();

  const row = await db.getFirstAsync<{ json: string }>(
    `
    SELECT json
    FROM synonyms
    WHERE word = ?
    LIMIT 1;
    `,
    [word]
  );

  return row ? JSON.parse(row.json) : null;
}




