# Bhashamithram II (ഭാഷാമിത്രം II) — Release Notes

**Application Name / Label:** BHASHAMITHARM II (ഭാഷാമിത്രം II)  
**Package Identifier:** `org.cdit.bhashamithram2`  
**Version Name:** `1.0.9`  
**Version Code:** `11`  
**Release Date:** October 2026  
**Developer:** Centre for Development of Imaging Technology (C-DIT), Government of Kerala  
**Target Platform:** Android 15 (API Level 36) | Min SDK: 24 (Android 7.0+)  

---

## 1. Google Play Store Release Notes (What's New / എന്താണ് പുതിയത്?)

### English (Google Play Store — max 500 characters)
```text
What's New in Version 1.0.9 (Build 11):
• Complete Malayalam Dictionary Database Clean-up: Resolved over 350,000+ Unicode and spelling issues across all offline definitions.
• Standardized Unicode 5.1+ Chillus (ൺ, ൻ, ർ, ൽ, ൾ, ൿ) ensuring 100% search accuracy with modern keyboards.
• Fixed font conversion errors (ൄ -> ്യ and ളള -> ള്ള).
• 42% faster and lighter offline database (optimized to 82.9 MB).
• Android 15 Edge-to-Edge compliance and performance improvements.
```

### Malayalam / മലയാളം (Google Play Store — max 500 characters)
```text
പതിപ്പ് 1.0.9 (ബിൽഡ് 11)-ലെ പുതിയ വിശേഷങ്ങൾ:
• പൂർണ്ണമായും നവീകരിച്ച മലയാളം നിഘണ്ടു: നിർവ്വചനങ്ങളിലെ മൂന്നര ലക്ഷത്തിലധികം യൂണികോഡ്, അക്ഷരത്തെറ്റുകൾ പരിഹരിച്ചു.
• ആധുനിക ചില്ലക്ഷരങ്ങൾ (ൺ, ൻ, ർ, ൽ, ൾ, ൿ): കീബോർഡിൽ ടൈപ്പ് ചെയ്യുമ്പോൾ കൃത്യമായ ഫലങ്ങൾ ലഭ്യമാക്കുന്നു.
• അക്ഷരത്തെറ്റുകൾ തിരുത്തി (ൄ -> ്യ, ളള -> ള്ള).
• 42% വേഗതയേറിയതും ഭാരം കുറഞ്ഞതുമായ ഓഫ്‌ലൈൻ ഡാറ്റാബേസ് (82.9 MB).
• ആൻഡ്രോയിഡ് 15 എഡ്ജ്-ടു-എഡ്ജ് സപ്പോർട്ടും കൂടുതൽ കാര്യക്ഷമതയും.
```

---

## 2. Key Highlights of Version 1.0.9 (Build 11)

### A. Comprehensive Offline Dictionary Database Normalization & Repair
* **Zero-Width Space Elimination:**
  * Stripped **222,073** invisible Zero-Width Space (`U+200B`) characters embedded inside Malayalam words (`ചെ​യ്തു`, `കൊ​ണ്ട്`, `വെ​റു​പ്പോ​ടുകൂടി`), restoring flawless text-to-speech, word selection, and full-text search.
* **Modern Atomic Chillu Standardization:**
  * Converted **99,643** legacy decomposed chillu sequences (`Consonant + Virama + ZWJ`) into standard Unicode 5.1+ atomic chillus (`ൺ`, `ൻ`, `ർ`, `ൽ`, `ൾ`, `ൿ`), ensuring searches from modern Android and iOS keyboards match 100% of offline words.
* **Font-Conversion Transliteration Correction (`U+0D44` -> `്യ`):**
  * Corrected **18,819** occurrences of Vocalic RR (`ൄ` / `U+0D44`) resulting from legacy ASCII font conversion errors into proper ya-conjuncts (`്യ` / `\u0D4D\u0D2F`), restoring critical terms like **മനുഷ്യൻ**, **വ്യക്തി**, **കാര്യം**, **രാജ്യം**, **സൂര്യൻ**, and **ഇന്ത്യ**.
* **Geminate Virama Restoration (`ളള` -> `ള്ള`):**
  * Fixed **15,219** missing virama errors where `ള്ള` was misspelled as `ളള` (e.g. **ഉള്ള**, **മുള്ള**, **അള്ളാഹു**, **പള്ളി**, **തള്ള**).
* **Decomposed Vowel Canonicalization:**
  * Standardized **1,449** decomposed multi-byte vowel sequences (`േ+ാ`, `െ+ാ`, `െ+ൗ`) into canonical precomposed vowels `ോ` (`\u0D4B`), `ൊ` (`\u0D4A`), `ൌ` (`\u0D4C`).
* **Headword Sanitization & Trailing Control Character Removal:**
  * Stripped trailing Zero-Width Non-Joiners (`\u200C`) from **208** dictionary headwords that previously broke exact keyword search.
  * Stripped trailing punctuation marks (periods, commas, colons) from **47** search keys (e.g. `നേർച്ചക്കോഴിനാ.` -> `നേർച്ചക്കോഴിനാ`).
  * Repaired high-frequency dropped ligature glyphs (**നിശേഷം**, **വിധേയത**, **പരിച്ഛേദനം**, **മുട്ടോളം**, **കേബിൾ**, etc.).
* **Database Size & Performance Optimization:**
  * The compiled, indexed, vacuumed SQLite database (`dictionary_v2.db`) was optimized from 144.8 MB down to **82.9 MB** (a **42% reduction**), significantly speeding up database extraction, query execution, and reducing the app's installation footprint.
  * Automated migration key updated to `"2026_10_28_v5_cleaned_unicode"` to ensure existing installed apps auto-upgrade their local cache.

### B. Google Play Console Versioning Compliance
* **Incremented Version Code to 11:**
  * Bumped `versionCode` to **11** and `versionName` to **1.0.9** in both `app.json` and `android/app/build.gradle`, resolving the Google Play Console conflict ("Version code 9 has already been used").

### C. Android 15 & System Policy Compliance
* **Edge-to-Edge System Layout:**
  * Explicit opt-in for Android 15 edge-to-edge enforcement (`android:windowOptOutEdgeToEdgeEnforcement=false`) in `values-v35/styles.xml`.
  * Status and navigation bars rendered translucent with adaptive dark icons.
* **R8 Optimization & ProGuard Hardening:**
  * Built using R8 Full Mode (`android.enableR8.fullMode=true`) and resource shrinking (`android.r8.optimizedResourceShrinking=true`).
  * Blanket keep rules pruned and memory leaks mitigated in native image and audio decoders.

### D. User Interface & Experience
* **Branded Opening Experience:**
  * Seamless startup featuring official Bhashamithram-II circular emblem, C-DIT crest, pastel waves, and floating Malayalam letters.
  * Plain white splash freeze and loading spinners removed.
* **Suggestions & Activity Management:**
  * Single-word instant deletion implemented across Recent Searches and Suggestions without intrusive confirmation alerts.
  * Sidebar updated with direct Google Play Store links (`https://play.google.com/store/apps/details?id=org.cdit.bhashamithram2`) for "Rate Us" and "Share App".

---

## 3. Technical Specifications

| Parameter | Value |
| :--- | :--- |
| **Application ID / Package** | `org.cdit.bhashamithram2` |
| **Version Name** | `1.0.9` |
| **Version Code** | `11` |
| **Min SDK** | 24 (Android 7.0+) |
| **Target SDK** | 36 (Android 15) |
| **Compile SDK** | 36 |
| **NDK Version** | 27.1.12297006 |
| **Kotlin Version** | 2.1.20 |
| **React Native Version** | 0.76.x (ReactAndroid 0.86) |
| **Expo SDK** | 57.0 |
| **Production Artifact Path** | `Final_Bashamitram/Mobile_app/android/app/build/outputs/bundle/release/app-release.aab` |
| **Root Copy Path** | `app-release.aab` |
| **AAB Bundle Size** | ~292 MB (includes vacuumed 82.9 MB offline database) |

---

## 4. Verification & Testing Checklist

- [x] **Cleaned Data SQLite Compilation:** `dictionary_v2.db` successfully compiled (82.9 MB, 233,462 dictionary headwords, 551,090 meanings).
- [x] **Zero-Width Character Verification:** Confirmed 0 ZWSP (`\u200B`) and 0 `U+0D44` remaining in database.
- [x] **Cache Auto-Refresh Migration:** Updated `CURRENT_DB_VERSION = "2026_10_28_v5_cleaned_unicode"`.
- [x] **Version Code Bump:** Verified `versionCode: 11` in `app.json` and `build.gradle`.
- [x] **Signed Bundle Generation:** Gradle task `:app:bundleRelease` and `:app:signReleaseBundle` completed with exit code 0.
- [x] **Bundle Verification:** Verified fresh timestamp and 292 MB size for `app-release.aab`.
