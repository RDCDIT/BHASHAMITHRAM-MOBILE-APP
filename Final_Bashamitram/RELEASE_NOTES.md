# Bhashamithram II (ഭാഷാമിത്രം II) — Release Notes

**Application Name / Label:** BHASHAMITHARM II (ഭാഷാമിത്രം II)  
**Package Identifier:** `org.cdit.bhashamithram2`  
**Version Name:** `1.0.11`  
**Version Code:** `13`  
**Release Date:** October 2026  
**Developer:** Centre for Development of Imaging Technology (C-DIT), Government of Kerala  
**Target Platform:** Android 15 (API Level 36) | Min SDK: 24 (Android 7.0+)  

---

## 1. Google Play Store Release Notes (What's New / എന്താണ് പുതിയത്?)

### English (Google Play Store — max 500 characters)
```text
What's New in Version 1.0.11 (Build 13):
• Updated with newly cleaned & verified Bhashamithram database (bhashamithram_cleaned.sql).
• 233,444 verified headwords and 551,060 meanings across all bilingual dictionaries.
• Cleaned UI navigation drawer: Public app interface optimized for seamless browsing and offline searching.
• Automated database upgrade for existing users.
• Stability, performance improvements, and Android 15 compliance.
```

### Malayalam / മലയാളം (Google Play Store — max 500 characters)
```text
പതിപ്പ് 1.0.11 (ബിൽഡ് 13)-ലെ പുതിയ വിശേഷങ്ങൾ:
• പൂർണ്ണമായും ശുദ്ധീകരിച്ച പുതിയ ഭാഷാമിത്രം ഡാറ്റാബേസ് ഉൾപ്പെടുത്തി (bhashamithram_cleaned.sql).
• 2,33,444 വാക്കുകളും 5,51,060 അർത്ഥങ്ങളും.
• വേഗതയേറിയതും ഭാരം കുറഞ്ഞതുമായ ഓഫ്‌ലൈൻ നിഘണ്ടു പ്രവർത്തനം.
• നിലവിലുള്ള ഉപയോക്താക്കൾക്കായി ഓട്ടോമാറ്റിക് ഡാറ്റാബേസ് അപ്‌ഗ്രേഡ്.
• ആൻഡ്രോയിഡ് 15 എഡ്ജ്-ടു-എഡ്ജ് സപ്പോർട്ടും കൂടുതൽ കാര്യക്ഷമതയും.
```

---

## 2. Key Highlights of Version 1.0.11 (Build 13)

### A. Cleaned Database Integration (`bhashamithram_cleaned.sql`)
* Converted, normalized, and indexed directly from the latest `bhashamithram_cleaned.sql` dump.
* **Dictionary Breakdown:**
  * English – Malayalam: 94,766 words
  * Malayalam – Malayalam: 99,834 words
  * Malayalam – English: 31,497 words
  * Malayalam Thesaurus: 7,347 words
  * Total Headwords: 233,444
  * Total Meanings: 551,060
  * Duplicates Remaining: 0
* **Vacuumed Asset:** Compressed and vacuumed `dictionary_v2.db` down to **80 MB**.
* **Automated Cache Migration Key:** Updated to `"2026_10_29_v6_cleaned_sql"` ensuring all existing installations seamlessly auto-upgrade their local cached dictionary on first app launch.

### B. Public-Facing Mobile UI Security Hardening
* Completely removed internal administrative controls, routes, and drawer links from the mobile app client.
* Mobile users have access only to user-facing features (Search, Browse, Favorites, Word Suggestions, Support).
* Suggestion word administration is strictly restricted to the authorized web browser portal on Render (`https://bhashamithram-mobile-app-2.onrender.com/suggestions`).

### C. Google Play Console Version Compliance
* Bumped `versionCode` to **12** and `versionName` to **1.0.10** across all build descriptors (`app.json`, `build.gradle`), ensuring smooth Google Play Console release rollout.

---

## 3. Technical Specifications

| Parameter | Value |
| :--- | :--- |
| **Application ID / Package** | `org.cdit.bhashamithram2` |
| **Version Name** | `1.0.11` |
| **Version Code** | `13` |
| **Min SDK** | 24 (Android 7.0+) |
| **Target SDK** | 36 (Android 15) |
| **Compile SDK** | 36 |
| **NDK Version** | 27.1.12297006 |
| **Kotlin Version** | 2.1.20 |
| **React Native Version** | 0.76.x (ReactAndroid 0.86) |
| **Expo SDK** | 57.0 |
| **Production Artifact Path** | `Final_Bashamitram/Mobile_app/android/app/build/outputs/bundle/release/app-release.aab` |
| **Root Copy Path** | `app-release.aab` |
| **AAB Bundle Size** | ~291 MB (includes vacuumed 80 MB offline database) |

---

## 4. Verification Checklist

- [x] **Cleaned SQL Ingestion:** Processed `bhashamithram_cleaned.sql` into SQLite `dictionary_v2.db` (233,444 words, 551,060 meanings, 0 duplicates).
- [x] **Integrity Check:** SQLite `PRAGMA integrity_check` verified `ok`.
- [x] **Cache Auto-Refresh Key:** Set to `"2026_10_29_v6_cleaned_sql"`.
- [x] **Version Code Incremented:** Set `versionCode: 13` and `versionName: 1.0.11`.
- [x] **Mobile Admin Clean-up:** Admin drawer entries and routes removed from mobile client.
- [x] **Signed Bundle Generation:** `:app:bundleRelease` and `:app:signReleaseBundle` compiled with exit code 0.
- [x] **Release File Deployed:** `app-release.aab` refreshed at project root.
