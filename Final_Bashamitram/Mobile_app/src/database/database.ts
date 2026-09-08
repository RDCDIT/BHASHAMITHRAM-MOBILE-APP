import { Platform } from "react-native";

export async function getDatabase() {
  if (Platform.OS === "web") {
    throw new Error("SQLite is not supported in the web build.");
  }

  const { getDatabase } = await import("./database.native");
  return getDatabase();
}