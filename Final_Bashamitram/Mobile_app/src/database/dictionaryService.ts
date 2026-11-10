/**
 * @file dictionaryService.ts
 * @description Local SQLite and REST API fallback data service layer.
 */

import { getDatabase } from "./database";
import { DictionaryEntry, Meaning } from "./types";

export type SearchResult = DictionaryEntry;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

function parseArray(value: string | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);

  return String(value)
    .split(/[,;\n|]+/)
    .map(v => v.trim())
    .filter(Boolean);
}

async function loadMeanings(dictionaryId: number): Promise<Meaning[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Meaning>(
      `SELECT id, meaning, context_usage
       FROM meanings
       WHERE dictionary_id = ?
       ORDER BY id`,
      [dictionaryId]
    );
    return rows ?? [];
  } catch (e) {
    console.error('Error loading meanings for dictionaryId', dictionaryId, e);
    return [];
  }
}

async function loadMeaningsForRows(dictionaryIds: number[]): Promise<Record<number, Meaning[]>> {
  const validIds = dictionaryIds.filter((id) => typeof id === "number" && !isNaN(id));
  if (validIds.length === 0) return {};
  try {
    const db = await getDatabase();
    const placeholders = validIds.map(() => '?').join(',');
    const rows = await db.getAllAsync<any>(
      `SELECT id, dictionary_id, meaning, context_usage
       FROM meanings
       WHERE dictionary_id IN (${placeholders})
       ORDER BY id`,
      validIds
    );
    const map: Record<number, Meaning[]> = {};
    for (const r of (rows ?? [])) {
      if (!map[r.dictionary_id]) map[r.dictionary_id] = [];
      map[r.dictionary_id].push({
        id: r.id,
        meaning: r.meaning ?? "",
        context_usage: r.context_usage ?? "",
      });
    }
    return map;
  } catch (e) {
    console.error('Error loading meanings for multiple dictionaryIds', validIds, e);
    return {};
  }
}

function mapRowToEntry(row: any, preloadedMeanings: Meaning[] = []): DictionaryEntry {
  let meanings: Meaning[] = preloadedMeanings;

  if (Array.isArray(row.meanings) && row.meanings.length > 0) {
    meanings = row.meanings.map((m: any) => ({
      meaning: typeof m === "string" ? m : m.meaning || "",
      context_usage: typeof m === "object" ? m.context_usage || "" : "",
    }));
  } else if (meanings.length === 0 && row.meaning?.trim()) {
    meanings = row.meaning
      .split(/\r?\n|[,;]+/)
      .map((m: string) => m.trim())
      .filter(Boolean)
      .map((meaning: string) => ({
        meaning,
        context_usage: "",
      }));
  }

  return {
    id: row.id || row._id,
    word: row.word ?? "",
    english_equivalent: row.english_equivalent ?? "",
    primary_malayalam_meaning: row.meaning ?? (meanings[0]?.meaning || ""),
    gender: row.gender ?? "",
    root: row.root ?? "",
    phonetic_transcription: row.phonetic_transcription ?? "",
    etymology: row.etymology ?? "",
    cultural_note: row.cultural_note ?? "",
    similar_word: parseArray(row.similar_word),
    novel_words: parseArray(row.novel_words),
    synonyms: row.dictionary_type === "malayalam_thesaurus"
      ? meanings.map(m => typeof m === "string" ? m : m?.meaning || "").filter(Boolean)
      : parseArray(row.synonyms),
    antonyms: parseArray(row.antonyms),
    dialects: parseArray(row.dialects),
    cross_reference: parseArray(row.cross_reference),
    inflections: parseArray(row.inflections),
    meanings,
    equivalents: {
      english: row.english_equivalent ?? "",
      tamil: row.tamil_equivalent ?? "",
      kannada: row.kannada_equivalent ?? "",
      telugu: row.telugu_equivalent ?? "",
      tulu: row.tulu_equivalent ?? "",
    },
    category: row.category || [],
    categories: row.categories || [],
    category_names: row.category_names || [],
    proverbs: row.proverbs || [],
    images: row.images || [],
  };
}

async function mapDictionaryEntry(row: any): Promise<DictionaryEntry> {
  try {
    const meanings: Meaning[] = row.id ? await loadMeanings(row.id) : [];
    return mapRowToEntry(row, meanings);
  } catch (e) {
    console.error('Error mapping dictionary entry', row?.id, e);
    return mapRowToEntry(row, []);
  }
}

async function fetchFromApi(endpoint: string): Promise<DictionaryEntry[]> {
  if (!API_BASE_URL) return [];
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) return [];
    const data = await response.json();
    const list = Array.isArray(data) ? data : data.data || [];
    return Promise.all(list.map((item: any) => mapDictionaryEntry(item)));
  } catch (err) {
    console.warn("REST API Fallback fetch error:", err);
    return [];
  }
}

function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/['’‘`]|\\'/g, "") // Block all single quote variations
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/--|\/\*|\*\//g, "") // Strip SQL comment markers
    .replace(/;/g, "") // Strip query terminators
    .replace(/[\0\x1a]/g, "") // Strip null bytes & EOF chars
    .trim();
}

// -------------------- Malayalam-Malayalam --------------------

export async function searchMalayalam(
  word: string = "അ",
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult[]> {
  try {
    const q = sanitizeInput(word) || "അ";
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_malayalam'
         AND word LIKE ?
       ORDER BY word
       LIMIT ? OFFSET ?`,
      [`${q}%`, limit, offset]
    );

    if (!rows || rows.length === 0) {
      return fetchFromApi(`/api/malayalam-malayalam/browse-malayalam?query=${encodeURIComponent(word)}`);
    }

    const ids = rows.map((r: any) => r.id).filter(Boolean);
    const meaningsMap = await loadMeaningsForRows(ids);

    return rows.map((row: any) => mapRowToEntry(row, meaningsMap[row.id] || []));
  } catch (err) {
    console.error('searchMalayalam error', err);
    return fetchFromApi(`/api/malayalam-malayalam/browse-malayalam?query=${encodeURIComponent(word)}`);
  }
}

export async function getMalayalamWord(word: string): Promise<DictionaryEntry | null> {
  try {
    const q = sanitizeInput(word);
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_malayalam'
         AND word = ?
       LIMIT 1`,
      [q]
    );

    if (row) return await mapDictionaryEntry(row);
  } catch (err) {
    console.error('getMalayalamWord error', err);
  }

  try {
    const results = await fetchFromApi(`/api/malayalam-malayalam/browse-malayalam?query=${encodeURIComponent(word)}`);
    return results.find(r => r.word === word) || results[0] || null;
  } catch {
    return null;
  }
}

// -------------------- English-Malayalam --------------------

export async function searchEnglish(
  word: string = "A",
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult[]> {
  try {
    const q = sanitizeInput(word) || "A";
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'english_malayalam'
         AND word LIKE ?
       ORDER BY word
       LIMIT ? OFFSET ?`,
      [`${q}%`, limit, offset]
    );

    if (!rows || rows.length === 0) {
      return fetchFromApi(`/api/english-malayalam/browse-english?query=${encodeURIComponent(word)}`);
    }

    const ids = rows.map((r: any) => r.id).filter(Boolean);
    const meaningsMap = await loadMeaningsForRows(ids);

    return rows.map((row: any) => mapRowToEntry(row, meaningsMap[row.id] || []));
  } catch (err) {
    console.error('searchEnglish error', err);
    return fetchFromApi(`/api/english-malayalam/browse-english?query=${encodeURIComponent(word)}`);
  }
}

export async function getEnglishWord(word: string): Promise<DictionaryEntry | null> {
  try {
    const q = sanitizeInput(word);
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'english_malayalam'
         AND word = ?
       LIMIT 1`,
      [q]
    );

    if (row) return await mapDictionaryEntry(row);
  } catch (err) {
    console.error('getEnglishWord error', err);
  }

  try {
    const results = await fetchFromApi(`/api/english-malayalam/browse-english?query=${encodeURIComponent(word)}`);
    return results.find(r => r.word === word || r.english_equivalent === word) || results[0] || null;
  } catch {
    return null;
  }
}

// -------------------- Malayalam -> English --------------------

export async function searchMalayalamEnglish(
  word: string = "അ",
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult[]> {
  try {
    const q = sanitizeInput(word) || "അ";
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_english'
         AND word LIKE ?
       ORDER BY word
       LIMIT ? OFFSET ?`,
      [`${q}%`, limit, offset]
    );

    if (!rows || rows.length === 0) {
      return fetchFromApi(`/api/malayalam-english/browse-malayalam?query=${encodeURIComponent(word)}`);
    }

    const ids = rows.map((r: any) => r.id).filter(Boolean);
    const meaningsMap = await loadMeaningsForRows(ids);

    return rows.map((row: any) => mapRowToEntry(row, meaningsMap[row.id] || []));
  } catch (err) {
    console.error('searchMalayalamEnglish error', err);
    return fetchFromApi(`/api/malayalam-english/browse-malayalam?query=${encodeURIComponent(word)}`);
  }
}

export async function getMalayalamEnglishWord(word: string): Promise<DictionaryEntry | null> {
  try {
    const q = sanitizeInput(word);
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_english'
         AND word = ?
       LIMIT 1`,
      [q]
    );

    if (row) return await mapDictionaryEntry(row);
  } catch (err) {
    console.error('getMalayalamEnglishWord error', err);
  }

  try {
    const results = await fetchFromApi(`/api/malayalam-english/browse-malayalam?query=${encodeURIComponent(word)}`);
    return results.find(r => r.word === word) || results[0] || null;
  } catch {
    return null;
  }
}

// -------------------- Synonyms / Thesaurus --------------------

export async function searchSynonym(
  word: string = "അ",
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult[]> {
  try {
    const q = sanitizeInput(word) || "അ";
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_thesaurus'
         AND word LIKE ?
       ORDER BY word
       LIMIT ? OFFSET ?`,
      [`${q}%`, limit, offset]
    );

    if (!rows || rows.length === 0) {
      return fetchFromApi(`/api/synonyms?search=${encodeURIComponent(word)}`);
    }

    const ids = rows.map((r: any) => r.id).filter(Boolean);
    const meaningsMap = await loadMeaningsForRows(ids);

    return rows.map((row: any) => mapRowToEntry(row, meaningsMap[row.id] || []));
  } catch (err) {
    console.error('searchSynonym error', err);
    return fetchFromApi(`/api/synonyms?search=${encodeURIComponent(word)}`);
  }
}

export async function getSynonymWord(word: string): Promise<DictionaryEntry | null> {
  try {
    const q = sanitizeInput(word);
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_thesaurus'
         AND word = ?
       LIMIT 1`,
      [q]
    );

    if (row) return await mapDictionaryEntry(row);
  } catch (err) {
    console.error('getSynonymWord error', err);
  }

  try {
    const results = await fetchFromApi(`/api/synonyms?search=${encodeURIComponent(word)}`);
    return results.find(r => r.word === word) || results[0] || null;
  } catch {
    return null;
  }
}

// -------------------- Local Suggested Words Storage --------------------

export interface LocalSuggestedWord {
  id?: number;
  word: string;
  meaning: string;
  language_type: string;
  root?: string;
  etymology?: string;
  cultural_note?: string;
  gender?: string;
  phonetic_transcription?: string;
  synonyms?: string;
  antonyms?: string;
  dialects?: string;
  proverbs?: string;
  equivalents?: string;
  contributor_name: string;
  contributor_email: string;
  status?: "pending" | "approved" | "rejected";
  created_at?: string;
}

async function ensureSuggestedWordsTable(): Promise<Awaited<ReturnType<typeof getDatabase>>> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS suggested_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      meaning TEXT NOT NULL,
      language_type TEXT,
      root TEXT,
      etymology TEXT,
      cultural_note TEXT,
      gender TEXT,
      phonetic_transcription TEXT,
      synonyms TEXT,
      antonyms TEXT,
      dialects TEXT,
      proverbs TEXT,
      equivalents TEXT,
      contributor_name TEXT,
      contributor_email TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await db.execAsync("ALTER TABLE suggested_words ADD COLUMN status TEXT DEFAULT 'pending';");
  } catch {
    // Column already exists, safe to ignore
  }

  return db;
}

export async function saveLocalSuggestedWord(suggestion: LocalSuggestedWord): Promise<number> {
  try {
    const db = await ensureSuggestedWordsTable();

    const result = await db.runAsync(
      `INSERT INTO suggested_words (
        word, meaning, language_type, root, etymology, cultural_note, gender,
        phonetic_transcription, synonyms, antonyms, dialects, proverbs,
        equivalents, contributor_name, contributor_email, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizeInput(suggestion.word),
        sanitizeInput(suggestion.meaning),
        sanitizeInput(suggestion.language_type || "malayalam"),
        sanitizeInput(suggestion.root || ""),
        sanitizeInput(suggestion.etymology || ""),
        sanitizeInput(suggestion.cultural_note || ""),
        sanitizeInput(suggestion.gender || ""),
        sanitizeInput(suggestion.phonetic_transcription || ""),
        sanitizeInput(suggestion.synonyms || ""),
        sanitizeInput(suggestion.antonyms || ""),
        sanitizeInput(suggestion.dialects || ""),
        sanitizeInput(suggestion.proverbs || ""),
        sanitizeInput(suggestion.equivalents || ""),
        sanitizeInput(suggestion.contributor_name),
        sanitizeInput(suggestion.contributor_email),
        sanitizeInput(suggestion.status || "pending"),
      ]
    );

    console.log(`✅ [Local SQLite] Word suggestion saved locally with ID: ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Failed to save suggested word to local database:", error);
    throw error;
  }
}

export async function getLocalSuggestedWords(
  statusFilter?: "pending" | "approved" | "rejected" | "all"
): Promise<LocalSuggestedWord[]> {
  try {
    const db = await ensureSuggestedWordsTable();
    let query = "SELECT * FROM suggested_words";
    const params: any[] = [];

    if (statusFilter && statusFilter !== "all") {
      query += " WHERE status = ? OR (status IS NULL AND ? = 'pending')";
      params.push(statusFilter, statusFilter);
    }
    query += " ORDER BY id DESC";

    const rows: any[] = (await db.getAllAsync(query, params)) || [];
    return rows.map((r: any) => ({
      ...r,
      status: (r.status || "pending") as "pending" | "approved" | "rejected",
    }));
  } catch (err) {
    console.warn("Failed to get local suggested words:", err);
    return [];
  }
}

export async function getLocalSuggestedWordById(id: number | string): Promise<LocalSuggestedWord | null> {
  try {
    const db = await ensureSuggestedWordsTable();
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(numericId)) return null;

    const row: any = await db.getFirstAsync(
      "SELECT * FROM suggested_words WHERE id = ?",
      [numericId]
    );
    if (!row) return null;
    return {
      ...row,
      status: (row.status || "pending") as "pending" | "approved" | "rejected",
    };
  } catch (err) {
    console.warn("Failed to get suggested word by ID:", err);
    return null;
  }
}

export async function updateLocalSuggestedWordStatus(
  id: number | string,
  status: "pending" | "approved" | "rejected"
): Promise<boolean> {
  try {
    const db = await ensureSuggestedWordsTable();
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(numericId)) return false;

    await db.runAsync(
      "UPDATE suggested_words SET status = ? WHERE id = ?",
      [status, numericId]
    );
    console.log(`✅ [Local SQLite] Suggestion ${numericId} status updated to: ${status}`);
    return true;
  } catch (err) {
    console.error("Failed to update suggestion status in local SQLite:", err);
    return false;
  }
}

export async function deleteLocalSuggestedWord(id: number | string): Promise<boolean> {
  try {
    const db = await ensureSuggestedWordsTable();
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(numericId)) return false;

    await db.runAsync("DELETE FROM suggested_words WHERE id = ?", [numericId]);
    console.log(`✅ [Local SQLite] Suggestion ${numericId} deleted successfully`);
    return true;
  } catch (err) {
    console.error("Failed to delete suggestion from local SQLite:", err);
    return false;
  }
}


