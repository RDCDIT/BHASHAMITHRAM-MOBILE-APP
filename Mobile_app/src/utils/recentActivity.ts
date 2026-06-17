import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_SEARCHES_KEY = "@bashamitram:recent_searches";
const RECENT_OPENINGS_KEY = "@bashamitram:recent_openings";

export type RecentSearch = {
  _id: string;
  itemId: string;
  itemType: "english" | "character" | "synonym";
  title: string;
  searchedAt: string;
};

export type RecentOpening = {
  _id: string;
  wordId: number;
  word: string;
  openedAt: string;
};

export async function getRecentActivity(): Promise<{
  recentSearches: RecentSearch[];
  recentOpenings: RecentOpening[];
}> {
  try {
    const [searchesRaw, openingsRaw] = await Promise.all([
      AsyncStorage.getItem(RECENT_SEARCHES_KEY),
      AsyncStorage.getItem(RECENT_OPENINGS_KEY),
    ]);

    const recentSearches = searchesRaw ? JSON.parse(searchesRaw) : [];
    const recentOpenings = openingsRaw ? JSON.parse(openingsRaw) : [];

    return { recentSearches, recentOpenings };
  } catch (error) {
    console.error("Failed to get recent activity:", error);
    return { recentSearches: [], recentOpenings: [] };
  }
}

export async function saveRecentSearch(
  title: string,
  itemType: "english" | "character" | "synonym" = "character"
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
    
    // Remove if already exists to put it on top
    const filtered = recentSearches.filter(
      (s) => s.title.toLowerCase() !== trimmedTitle.toLowerCase()
    );

    const newSearch: RecentSearch = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      itemId: Date.now().toString(),
      itemType,
      title: trimmedTitle,
      searchedAt: new Date().toISOString(),
    };

    const updated = [newSearch, ...filtered].slice(0, 10);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save recent search:", error);
    return [];
  }
}

export async function saveRecentOpening(
  wordId: number,
  word: string
): Promise<RecentOpening[]> {
  if (!wordId || !word) return [];

  try {
    const { recentOpenings } = await getRecentActivity();

    // Remove if already exists to put it on top
    const filtered = recentOpenings.filter((o) => o.wordId !== wordId);

    const newOpening: RecentOpening = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      wordId,
      word: word.trim(),
      openedAt: new Date().toISOString(),
    };

    const updated = [newOpening, ...filtered].slice(0, 10);
    await AsyncStorage.setItem(RECENT_OPENINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save recent opening:", error);
    return [];
  }
}

export async function clearRecentActivity(
  type: "searches" | "openings" | "all"
): Promise<void> {
  try {
    if (type === "searches" || type === "all") {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    }
    if (type === "openings" || type === "all") {
      await AsyncStorage.removeItem(RECENT_OPENINGS_KEY);
    }
  } catch (error) {
    console.error("Failed to clear recent activity:", error);
  }
}
