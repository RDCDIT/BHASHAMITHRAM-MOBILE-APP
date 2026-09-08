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

// -------------------- Malayalam-Malayalam --------------------

export async function searchMalayalam(
  word: string = "അ",
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult[]> {
  try {
    const q = (word ?? "").trim() || "അ";
    const escapedQ = q.replace(/'/g, "''");
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_malayalam'
         AND word LIKE '${escapedQ}%'
       ORDER BY word
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (!rows || rows.length === 0) return [];

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
    const escapedWord = word.replace(/'/g, "''");
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_malayalam'
         AND word = '${escapedWord}'
       LIMIT 1`,
      []
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
    const q = (word ?? "").trim() || "A";
    const escapedQ = q.replace(/'/g, "''");
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'english_malayalam'
         AND word LIKE '${escapedQ}%'
       ORDER BY word
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (!rows || rows.length === 0) return [];

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
    const escapedWord = word.replace(/'/g, "''");
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'english_malayalam'
         AND word = '${escapedWord}'
       LIMIT 1`,
      []
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
    const q = (word ?? "").trim() || "അ";
    const escapedQ = q.replace(/'/g, "''");
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_english'
         AND word LIKE '${escapedQ}%'
       ORDER BY word
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (!rows || rows.length === 0) return [];

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
    const escapedWord = word.replace(/'/g, "''");
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_english'
         AND word = '${escapedWord}'
       LIMIT 1`,
      []
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
    const q = (word ?? "").trim() || "അ";
    const escapedQ = q.replace(/'/g, "''");
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_thesaurus'
         AND word LIKE '${escapedQ}%'
       ORDER BY word
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (!rows || rows.length === 0) return [];

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
    const escapedWord = word.replace(/'/g, "''");
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT *
       FROM dictionary
       WHERE dictionary_type = 'malayalam_thesaurus'
         AND word = '${escapedWord}'
       LIMIT 1`,
      []
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
