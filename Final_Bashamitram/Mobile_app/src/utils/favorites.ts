/**
 * @file favorites.ts
 * @description Storage service for managing user's favorite dictionary words for learning.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FavoriteItem {
  id: string;
  word: string;
  dictionaryType: string;
  meaning?: string;
  partOfSpeech?: string;
  phonetic?: string;
  timestamp: number;
}

const FAVORITES_STORAGE_KEY = "@bhashamithram_favorites_v1";

export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to get favorites:", err);
    return [];
  }
}

export async function isWordFavorite(word: string, dictionaryType?: string): Promise<boolean> {
  if (!word) return false;
  try {
    const list = await getFavorites();
    const clean = word.trim().toLowerCase();
    return list.some(
      (f) =>
        f.word.trim().toLowerCase() === clean &&
        (!dictionaryType || f.dictionaryType === dictionaryType)
    );
  } catch {
    return false;
  }
}

export async function toggleFavoriteWord(item: Omit<FavoriteItem, "id" | "timestamp">): Promise<boolean> {
  try {
    const list = await getFavorites();
    const clean = item.word.trim().toLowerCase();
    const existingIndex = list.findIndex(
      (f) =>
        f.word.trim().toLowerCase() === clean &&
        f.dictionaryType === item.dictionaryType
    );

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
      return false; // Not favorite now
    } else {
      const newItem: FavoriteItem = {
        ...item,
        id: `${item.word}_${item.dictionaryType}_${Date.now()}`,
        timestamp: Date.now(),
      };
      list.unshift(newItem);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
      return true; // Favorited
    }
  } catch (err) {
    console.warn("Failed to toggle favorite:", err);
    return false;
  }
}

export async function removeFavorite(id: string): Promise<void> {
  try {
    const list = await getFavorites();
    const filtered = list.filter((f) => f.id !== id);
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Failed to remove favorite:", err);
  }
}

export async function clearAllFavorites(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear favorites:", err);
  }
}

