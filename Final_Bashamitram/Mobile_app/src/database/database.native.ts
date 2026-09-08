import * as SQLite from "expo-sqlite";
import { importDatabaseFromAssetAsync } from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = (async () => {
    console.log("Initializing database...");

    try {
      await importDatabaseFromAssetAsync("dictionary_v2.db", {
        assetId: require("../../assets/dictionary_v2.db"),
        forceOverwrite: false,
      });
    } catch (e) {
      console.warn("Notice: importDatabaseFromAssetAsync bypassed or failed:", e);
    }

    db = await SQLite.openDatabaseAsync("dictionary_v2.db");

    return db;
  })();

  return dbPromise;
}