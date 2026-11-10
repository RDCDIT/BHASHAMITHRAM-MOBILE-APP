import * as SQLite from "expo-sqlite";
import { importDatabaseFromAssetAsync } from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Increment this version whenever a new/corrected database asset is bundled
const CURRENT_DB_VERSION = "2026_10_29_v6_cleaned_sql";
const DB_VERSION_KEY = "@dictionary_db_version";

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = (async () => {
    console.log("Initializing database...");
    console.log("Initializing dictionary database...");

    const installedVersion = await AsyncStorage.getItem(DB_VERSION_KEY);
    const shouldForceOverwrite = installedVersion !== CURRENT_DB_VERSION;

    try {
      await importDatabaseFromAssetAsync("dictionary_v2.db", {
        assetId: require("../../assets/dictionary_v2.db"),
        forceOverwrite: shouldForceOverwrite,
      });
      await AsyncStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
      console.log("[Database] Database asset imported successfully.");
    } catch (e) {
      console.warn("[Database] Notice: importDatabaseFromAssetAsync bypassed or failed:", e);
    }

    // Always ensure db is opened
    db = await SQLite.openDatabaseAsync("dictionary_v2.db");

    // Self-healing check: verify that dictionary table exists and is populated
    try {
      const check = await db.getFirstAsync<{ count: number }>(
        "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='dictionary'"
      );
      if (!check || check.count === 0) {
        console.warn("[Database] Table 'dictionary' missing. Attempting force re-import...");
        try {
          await db.closeAsync();
          await importDatabaseFromAssetAsync("dictionary_v2.db", {
            assetId: require("../../assets/dictionary_v2.db"),
            forceOverwrite: true,
          });
          await AsyncStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
        } catch (importErr) {
          console.warn("[Database] Force re-import failed:", importErr);
        } finally {
          // ALWAYS reopen so db is never left in a closed state
          db = await SQLite.openDatabaseAsync("dictionary_v2.db");
        }
      }
    } catch (err) {
      console.warn("[Database] Table verification check warning:", err);
      if (!db) {
        db = await SQLite.openDatabaseAsync("dictionary_v2.db");
      }
    }

    return db;
  })();

  return dbPromise;
}

export async function forceReloadDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    try {
      await db.closeAsync();
    } catch {}
    db = null;
  }
  dbPromise = null;
  await AsyncStorage.removeItem(DB_VERSION_KEY);
  return getDatabase();
}