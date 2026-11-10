/**
 * @file cacheManager.ts
 * @description Secure Cache & Temporary File Management Utility.
 * Enforces OWASP MASVS MSTG-STORAGE-2 (CWE-276) remediation:
 * - Periodically purges app-private temporary caches (context.cacheDir)
 * - Cleans disk and memory caches for expo-image
 * - Ensures no lingering temporary files remain across sessions
 */

import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Purges disk and memory caches from expo-image and deletes stale files
 * in the application's private cache directory.
 */
export async function clearAppTempCache(): Promise<void> {
  try {
    // 1. Clear expo-image internal memory & disk caches
    try {
      if (typeof Image.clearMemoryCache === "function") {
        await Image.clearMemoryCache();
      }
      if (typeof Image.clearDiskCache === "function") {
        await Image.clearDiskCache();
      }
    } catch (imgErr) {
      console.warn("⚠️ [CacheManager] Image cache clearing notice:", imgErr);
    }

    // 2. Clear app-private cache directory (context.cacheDir)
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        for (const file of files) {
          // Do not delete critical active files or database versions
          if (
            file.endsWith(".tmp") ||
            file.startsWith("temp_") ||
            file.startsWith("ImagePicker") ||
            file.startsWith("cropper") ||
            file.endsWith(".jpg") ||
            file.endsWith(".png") ||
            file.endsWith(".mp3")
          ) {
            const filePath = `${cacheDir}${file}`;
            await FileSystem.deleteAsync(filePath, { idempotent: true });
          }
        }
      }
    } catch (fsErr) {
      console.warn("⚠️ [CacheManager] FileSystem cache clearing notice:", fsErr);
    }

    console.log("🔒 [CacheManager] Temporary file and disk caches purged successfully.");
  } catch (error) {
    console.warn("⚠️ [CacheManager] Cache purge encountered non-fatal error:", error);
  }
}

