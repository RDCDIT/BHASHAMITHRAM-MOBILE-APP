# Privacy Policy for Bhashamithram II

**Effective Date:** September 16, 2026  
**Last Updated:** September 16, 2026  

Bhashamithram II is a comprehensive Malayalam Dictionary and language-resource mobile application developed by the **R&D Division of the Centre for Development of Imaging Technology (C-DIT)**, an autonomous institution under the Government of Kerala.

We are committed to respecting and protecting user privacy. This Privacy Policy outlines our transparent data practices, explains how the application operates, and clarifies the minimal data permissions required to deliver its features.

---

## 1. Overview & Core Privacy Principles

* **No User Accounts:** Bhashamithram II does not require account creation, registration, or login. You can access all dictionary and language resources anonymously.
* **Offline-First Architecture:** The core dictionary database (comprising over 233,000 words and 551,000 meanings across Malayalam and English) is embedded directly inside the application on your device. Your search queries are processed locally and are **never sent, logged, or tracked** on any remote server.
* **No Advertisements or Commercial Tracking:** The application contains **no advertisements (no AdMob)**, **no third-party tracking or analytics SDKs (no Firebase Analytics, Mixpanel, or Facebook SDK)**, and does not sell or broker user data.

---

## 2. Information We Do NOT Collect

Because we respect user privacy, Bhashamithram II does not collect, harvest, or request:
* Personal Identifiers (Legal names, email addresses, phone numbers, postal addresses)
* Government IDs or financial information
* Contacts, address book, or calendar data
* Precise or approximate GPS location
* Biometric data or advertising identifiers (GAID / IDFA)

---

## 3. Permissions & Data Handling

Bhashamithram II requests only the strictly necessary system permissions required to enable specific user-initiated features:

### A. Microphone & Audio (`RECORD_AUDIO`)
* **Purpose:** Enables the on-demand **Voice Search** feature, allowing users to speak Malayalam or English words instead of typing.
* **Handling:** Audio is captured exclusively when the user taps the microphone button. Audio streams are processed ephemerally for the sole purpose of real-time speech-to-text conversion.
* **Retention:** Audio recordings are **not stored permanently**, not sold, and not used for user profiling or model training.

### B. Photos & Media Storage (`READ_EXTERNAL_STORAGE` / Photo Picker)
* **Purpose:** Used exclusively in the **"Suggest Word" (വാക്ക് നിർദ്ദേശിക്കുക)** module if a user voluntarily chooses to attach an illustrative photo or reference image for a new dictionary entry.
* **Handling:** The app only accesses specific media files explicitly selected by the user via the system document/image picker. The app does not scan or read any other files on your device.

### C. Internet & Network (`INTERNET`)
* **Purpose:** Required only for:
  1. Submitting voluntary word suggestions to the C-DIT editorial team for linguistic review.
  2. Transmitting voice audio to the speech-to-text processing endpoint when voice search is activated.
  3. Playing online pronunciation audio files when available.
* All core dictionary search, browsing, and definitions function 100% offline without an active internet connection.

---

## 4. Voluntary User Contributions ("Suggest Word")

Bhashamithram II includes an optional feature enabling language enthusiasts to suggest new words, regional dialects, proverbs, idioms, or corrections to the C-DIT lexicography team:
* **Data Submitted:** The linguistics data entered into the suggestion form (word, meanings, grammar, category, example usage, and optional attached image).
* **Usage:** Submissions are reviewed by C-DIT lexicographers and linguistic experts for potential inclusion in future official dictionary releases.
* **Security:** All suggestions are transmitted over encrypted HTTPS connections protected by HMAC cryptographic signature validation.

---

## 5. Local On-Device Storage

The application utilizes local storage (`AsyncStorage` / SQLite) strictly on your physical device to store:
* User UI preferences (e.g., font size, display language, selected theme).
* Local database version cache (ensuring offline assets stay synchronized).

This data remains entirely on your device and is erased when you clear the application cache or uninstall the app.

---

## 6. Data Security & Encryption

We apply standard industry security protocols to safeguard information transmitted by the app:
* **Encryption in Transit:** All communications between Bhashamithram II and backend services use secure TLS/HTTPS encryption (`https://`).
* **Request Signing:** User submissions are authenticated using cryptographic HMAC/SHA-256 signatures to prevent tampering.
* **No Third-Party Brokers:** No user data is transferred to commercial aggregators, marketing agencies, or data brokers.

---

## 7. Children’s Privacy

Bhashamithram II is an educational and linguistic reference application intended for general audiences. The application does not knowingly collect or solicit personal data from children under the age of 13 (or under the age of 16 in applicable jurisdictions), and complies with the Children's Online Privacy Protection Act (COPPA) and Google Play Families policy.

---

## 8. Data Retention and Deletion

* **Ephemeral Data:** Audio captured during voice search is processed in real time and discarded immediately upon completion of transcription.
* **Voluntary Contributions:** Data submitted via the "Suggest Word" module is retained in C-DIT’s internal review database for lexicographical moderation. If you have submitted a suggestion and wish to have it deleted, please contact us at the email below.

---

## 9. Changes to This Privacy Policy

We may update this Privacy Policy periodically to reflect technological advancements, updates to dictionary capabilities, or regulatory changes. Any revisions will be published with an updated "Effective Date". Continued use of the application signifies acceptance of the updated terms.

---

## 10. Contact Us

For questions, concerns, feedback, or requests regarding this Privacy Policy or Bhashamithram II's data practices, please contact:

**R&D Division**  
**Centre for Development of Imaging Technology (C-DIT)**  
*(An autonomous institution under the Government of Kerala)*  
Chithranjali Hills, Thiruvallam P.O.  
Thiruvananthapuram – 695 027, Kerala, India  

* **Official Email:** [research@cdit.org](mailto:research@cdit.org)  
* **Official Website:** [https://cdit.org](https://cdit.org)  

