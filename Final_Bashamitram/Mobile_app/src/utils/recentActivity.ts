/**
 * @file recentActivity.ts
 * @description Utility functions for saving, retrieving, and clearing recent search queries
 * and recently opened dictionary words using React Native's AsyncStorage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_SEARCHES_KEY = "@bashamitram:recent_searches";
const RECENT_OPENINGS_KEY = "@bashamitram:recent_openings";

export type DictionaryType =
  | "english_malayalam"
  | "malayalam_english"
  | "malayalam_synonym"
  | "malayalam_malayalam";

export type RecentSearch = {
  _id: string;
  itemId: string;
  itemType: "english" | "character" | "synonym";
  dictionaryType?: DictionaryType;
  title: string;
  searchedAt: string;
};

export type RecentOpening = {
  _id: string;
  wordId: number;
  word: string;
  dictionaryType?: DictionaryType;
  openedAt: string;
};

/**
 * Infers dictionary type for legacy records that don't have an explicit dictionaryType set.
 */
export function inferDictionaryType(item: {
  dictionaryType?: DictionaryType;
  itemType?: string;
  word?: string;
  title?: string;
}): DictionaryType {
  if (item.dictionaryType) return item.dictionaryType;
  if (item.itemType === "synonym") return "malayalam_synonym";
  if (item.itemType === "english") return "english_malayalam";

  const text = (item.word || item.title || "").trim();
  if (/^[a-zA-Z]/.test(text)) {
    return "english_malayalam";
  }
  return "malayalam_malayalam";
}

/**
 * Retrieves the history of recent searches and recently opened words.
 *
 * @returns {Promise<{ recentSearches: RecentSearch[]; recentOpenings: RecentOpening[] }>} Promise resolving to objects containing both activity lists.
 */
export async function getRecentActivity(): Promise<{
  recentSearches: RecentSearch[];
  recentOpenings: RecentOpening[];
}> {
  try {
    const [searchesRaw, openingsRaw] = await Promise.all([
      AsyncStorage.getItem(RECENT_SEARCHES_KEY),
      AsyncStorage.getItem(RECENT_OPENINGS_KEY),
    ]);

    const recentSearches: RecentSearch[] = searchesRaw ? JSON.parse(searchesRaw) : [];
    const recentOpenings: RecentOpening[] = openingsRaw ? JSON.parse(openingsRaw) : [];

    return { recentSearches, recentOpenings };
  } catch (error) {
    console.error("Failed to get recent activity:", error);
    return { recentSearches: [], recentOpenings: [] };
  }
}

/**
 * Saves a new query to the search history, filters duplicates, and limits results to top 50.
 * Single letters/alphabets in Malayalam are ignored.
 *
 * @param {string} title - The search query text.
 * @param {"english" | "character" | "synonym"} itemType - The category type of search query.
 * @param {DictionaryType} dictionaryType - The dictionary tab type.
 * @returns {Promise<RecentSearch[]>} Updated search history array.
 */
export async function saveRecentSearch(
  title: string,
  itemType: "english" | "character" | "synonym" = "character",
  dictionaryType?: DictionaryType
): Promise<RecentSearch[]> {
  if (!title || title.trim().length <= 1) return [];
  const trimmedTitle = title.trim();

  // Malayalam letters list to check
  const MALAYALAM_ALPHABET = [
    "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ",
    "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ",
    "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന",
    "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ",
    "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
  ];
  if (trimmedTitle.length === 1 || MALAYALAM_ALPHABET.includes(trimmedTitle)) {
    return [];
  }

  try {
    const { recentSearches } = await getRecentActivity();

    // Default dictionaryType if omitted
    const resolvedDictType: DictionaryType =
      dictionaryType ||
      (itemType === "english"
        ? "english_malayalam"
        : itemType === "synonym"
        ? "malayalam_synonym"
        : "malayalam_malayalam");

    // Remove matching entry within same dictionary type
    const filtered = recentSearches.filter(
      (s) =>
        !(
          s.title.toLowerCase() === trimmedTitle.toLowerCase() &&
          inferDictionaryType(s) === resolvedDictType
        )
    );

    const newSearch: RecentSearch = {
      _id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      itemId: Date.now().toString(),
      itemType,
      dictionaryType: resolvedDictType,
      title: trimmedTitle,
      searchedAt: new Date().toISOString(),
    };

    const updated = [newSearch, ...filtered].slice(0, 50);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save recent search:", error);
    return [];
  }
}

/**
 * Saves a dictionary word details screen visit event to recent openings history,
 * removing previous references of the same word and limiting entries to 50.
 *
 * @param {number} wordId - Unique identifier of the word.
 * @param {string} word - The word itself.
 * @param {DictionaryType} dictionaryType - The dictionary type.
 * @returns {Promise<RecentOpening[]>} Updated recent openings array.
 */
export async function saveRecentOpening(
  wordId: number,
  word: string,
  dictionaryType?: DictionaryType
): Promise<RecentOpening[]> {
  if (!word) return [];

  try {
    const { recentOpenings } = await getRecentActivity();

    const resolvedDictType: DictionaryType =
      dictionaryType ||
      (/^[a-zA-Z]/.test(word.trim())
        ? "english_malayalam"
        : "malayalam_malayalam");

    // Remove if already exists in same dictionary type
    const filtered = recentOpenings.filter(
      (o) =>
        !(
          (o.wordId === wordId || o.word.toLowerCase() === word.trim().toLowerCase()) &&
          inferDictionaryType(o) === resolvedDictType
        )
    );

    const newOpening: RecentOpening = {
      _id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      wordId,
      word: word.trim(),
      dictionaryType: resolvedDictType,
      openedAt: new Date().toISOString(),
    };

    const updated = [newOpening, ...filtered].slice(0, 50);
    await AsyncStorage.setItem(RECENT_OPENINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save recent opening:", error);
    return [];
  }
}

/**
 * Removes an individual recent search item by its unique ID.
 *
 * @param {string} id - The _id of the recent search item.
 * @returns {Promise<RecentSearch[]>} The updated list of recent searches.
 */
export async function removeRecentSearch(
  id: string,
  title?: string
): Promise<RecentSearch[]> {
  try {
    const { recentSearches } = await getRecentActivity();
    const updated = recentSearches.filter(
      (s) =>
        s._id !== id &&
        (s as any).id !== id &&
        (!title || s.title.trim().toLowerCase() !== title.trim().toLowerCase())
    );
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to remove recent search item:", error);
    return [];
  }
}

/**
 * Removes an individual recent opening item by its unique ID.
 *
 * @param {string} id - The _id of the recent opening item.
 * @param {string} [word] - Optional word string to ensure deletion.
 * @returns {Promise<RecentOpening[]>} The updated list of recent openings.
 */
export async function removeRecentOpening(
  id: string,
  word?: string
): Promise<RecentOpening[]> {
  try {
    const { recentOpenings } = await getRecentActivity();
    const updated = recentOpenings.filter(
      (o) =>
        o._id !== id &&
        (o as any).id !== id &&
        (!word || o.word.trim().toLowerCase() !== word.trim().toLowerCase())
    );
    await AsyncStorage.setItem(RECENT_OPENINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to remove recent opening item:", error);
    return [];
  }
}

/**
 * Clears stored recent activities from AsyncStorage based on the specified type and optional dictionaryType.
 *
 * @param {"searches" | "openings" | "all"} type - Selection of which list to clear.
 * @param {DictionaryType} [dictionaryType] - Optional dictionary type to selectively clear.
 * @returns {Promise<void>}
 */
export async function clearRecentActivity(
  type: "searches" | "openings" | "all",
  dictionaryType?: DictionaryType
): Promise<void> {
  try {
    if (!dictionaryType) {
      if (type === "searches" || type === "all") {
        await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      }
      if (type === "openings" || type === "all") {
        await AsyncStorage.removeItem(RECENT_OPENINGS_KEY);
      }
      return;
    }

    const { recentSearches, recentOpenings } = await getRecentActivity();

    if (type === "searches" || type === "all") {
      const remainingSearches = recentSearches.filter(
        (s) => inferDictionaryType(s) !== dictionaryType
      );
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(remainingSearches));
    }

    if (type === "openings" || type === "all") {
      const remainingOpenings = recentOpenings.filter(
        (o) => inferDictionaryType(o) !== dictionaryType
      );
      await AsyncStorage.setItem(RECENT_OPENINGS_KEY, JSON.stringify(remainingOpenings));
    }
  } catch (error) {
    console.error("Failed to clear recent activity:", error);
  }
}
