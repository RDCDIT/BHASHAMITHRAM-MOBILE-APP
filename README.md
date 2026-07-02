<div align="center">

<img src="Mobile_app/assets/images/icon.png" alt="Bhashamitram II Logo" width="120" />

# ഭാഷാമിത്രം II — Bhashamitram II

**A comprehensive multilingual dictionary mobile app for Malayalam, English, and beyond**

*Developed by R&D — Centre for Development of Imaging Technology (C-DIT)*

[![Expo](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react)](https://reactnative.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](Mobile_app/LICENSE)

</div>

---

## 📖 Project Overview

**Bhashamitram II** is a production-grade multilingual dictionary mobile application built for Android (with web support) that provides rich lexicographic data for Malayalam and English. It features voice-powered search, animated UIs, phonetic transcriptions, audio pronunciation, proverbs, etymologies, synonyms, cultural notes, and a full admin portal for content management.

The app is a full-stack monorepo consisting of:
- **Mobile_app/** — Expo / React Native frontend (TypeScript)
- **ackend/** — Node.js / Express REST API (JavaScript)

---

## 📸 Screenshots

> _Place screenshots or screen recordings in a /screenshots directory and update the paths below._

| Home Screen | Dictionary Browse | Word Detail | Admin Portal |
|:-----------:|:-----------------:|:-----------:|:------------:|
| ![Home](screenshots/home.png) | ![Browse](screenshots/browse.png) | ![Detail](screenshots/detail.png) | ![Admin](screenshots/admin.png) |

---

## ✨ Features

### 📚 Dictionary Modules

| Module | Description |
|--------|-------------|
| **Malayalam → Malayalam** | Native Malayalam dictionary with meanings, proverbs, etymology, synonyms, inflections, and cultural notes |
| **English → English** | Full English dictionary with meanings, antonyms, phonetic transcription, and cross-references |
| **Malayalam → English** | Bilingual translation dictionary |
| **English → Malayalam** | Reverse translation dictionary |
| **Malayalam Synonyms (നാനാർത്ഥം)** | Dedicated thesaurus for Malayalam polysemy and near-synonyms |

### 🔍 Search & Discovery

- **Alphabetical Browse** — Scroll-and-tap navigation using the full Malayalam or English alphabet
- **Live Search** — Real-time prefix-based search with instant results
- **Voice Search (🎙️)** — Dual-mode voice input:
  - **Mobile (Android/iOS):** Records audio via expo-audio and transcribes via Google Cloud Speech-to-Text API
  - **Web:** Uses the browser-native Web Speech API
- **Recent Activity (സമീപകാല)** — Persisted history of recent searches and recently opened word cards, stored locally via AsyncStorage

### 🔊 Pronunciation

- **Audio Playback** — Serves pre-recorded .mp3 audio files for words from the /public/audio directory
- **Google TTS** — Dynamically generates speech via Google Text-to-Speech when no manual audio exists
- **gTTS Fallback** — Secondary open-source fallback using the gtts library

### 📝 Community Contributions

- **Suggest a Word** — Users can submit new Malayalam or English words with full lexicographic metadata (etymology, synonyms, proverbs, dialects, equivalents in Kannada/Tamil/Telugu/Tulu/English, and more)

### 🛠️ Admin Portal

An in-app admin dashboard with:

- **Word Suggestions** — Review, approve, or reject user-submitted word entries
- **Manual Word Entry** — Add new dictionary records directly to any collection
- **Manage Records** — Search, edit, or delete existing records across all dictionaries
- **SQLite → MongoDB Migration** — Upload an SQLite .db file and migrate its data to a target MongoDB collection
- **Media Upload** — Upload custom audio pronunciation files and word images

### 🎨 UI & UX

- Animated card-based home screen with 
eact-native-reanimated scroll parallax
- Smooth slide-in side drawer navigation (C-DIT branded)
- Skeleton loading placeholders during API calls
- Floating animated letters background on search screens
- Animated tab indicators and micro-interactions throughout
- NotoSansMalayalam font for full Unicode Malayalam script rendering

---

## 🛠 Tech Stack

### Frontend (Mobile_app/)

| Technology | Version | Purpose |
|------------|---------|---------|
| [Expo](https://expo.dev) | SDK 56 | Build toolchain & OTA updates |
| [React Native](https://reactnative.dev) | 0.85.3 | Cross-platform mobile framework |
| [Expo Router](https://docs.expo.dev/router) | 56.2 | File-based navigation (screen routing) |
| [TypeScript](https://typescriptlang.org) | 6.0 | Static typing |
| [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) | 56.0 | Audio recording for native voice search |
| [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) | 56.0 | Performant GIF/image rendering |
| [expo-speech](https://docs.expo.dev/versions/latest/sdk/speech/) | 56.0 | On-device text-to-speech |
| [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) | 4.3 | High-performance animations |
| [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) | 2.31 | Native gesture system |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | 2.2 | Persistent local key-value storage |
| [@expo/vector-icons](https://icons.expo.fyi/) | 15.0 | Ionicons icon set |
| [EAS Build](https://docs.expo.dev/eas/) | ≥ 20.3 | Production APK/AAB builds |

### Backend (ackend/)

| Technology | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org) | ≥ 18 | JavaScript runtime |
| [Express](https://expressjs.com) | 5.2 | HTTP server framework |
| [Mongoose](https://mongoosejs.com) | 9.6 | MongoDB ODM |
| [MongoDB](https://mongodb.com) | 7.2 | Primary database (Atlas hosted) |
| [SQLite3](https://github.com/TryGhost/node-sqlite3) | 6.0 | SQLite reader for data migration |
| [@google-cloud/speech](https://cloud.google.com/speech-to-text) | 7.5 | Google Speech-to-Text API client |
| [gtts](https://www.npmjs.com/package/gtts) | 0.2 | Open-source TTS fallback |
| [multer](https://github.com/expressjs/multer) | 2.2 | Multipart file uploads |
| [nodemailer](https://nodemailer.com) | 9.0 | Email delivery |
| [dotenv](https://github.com/motdotla/dotenv) | 17 | Environment variable loading |
| [nodemon](https://nodemon.io) | 3.1 | Dev auto-restart |

---

## 📁 Folder Structure

```
Final Bashamitram/
├── backend/
│   ├── config/
│   │   └── db.js                        # MongoDB connection with retry & SRV diagnostics
│   ├── controllers/
│   │   ├── admincontroller/
│   │   ├── english_englishcontroller.js
│   │   ├── english_malayalam_controller.js
│   │   ├── malayalam_malayalamcontroller.js
│   │   ├── malayalam_english_controllers.js
│   │   ├── malayalam_synonym_controller.js
│   │   ├── pronunciationController.js
│   │   ├── gttsFallbackController.js
│   │   ├── speechController.js
│   │   └── suggest_word.js
│   ├── migration/
│   │   └── index.js                     # SQLite → MongoDB migration engine
│   ├── models/
│   │   ├── malayalam_malayalam_dictionary.js
│   │   ├── english-english-dictionary.js
│   │   ├── english_malayalam_dictionary.js
│   │   ├── malayalam_english_dictionary.js
│   │   ├── malayalam_synonyms.js
│   │   ├── SuggestedWord.js
│   │   ├── pronounciation_english.js
│   │   └── pronounciation_malayalam.js
│   ├── routes/
│   │   ├── wordroute.js
│   │   ├── malayalam-malayalam.js
│   │   ├── english_english.js
│   │   ├── english_malayalam.js
│   │   ├── malayalam_english.js
│   │   ├── malayalam_synonym.js
│   │   ├── pronunciationRoutes.js
│   │   ├── speechRoutes.js
│   │   └── adminRoutes/
│   │       ├── dictionaryAdminRoute.js
│   │       ├── migrationRoute.js
│   │       └── suggestedWordRoute.js
│   ├── services/
│   ├── public/audio/                    # Statically served audio files
│   ├── uploads/                         # Temp file upload staging
│   ├── server.js
│   └── package.json
│
└── Mobile_app/
    ├── src/
    │   ├── app/
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx                # Home screen
    │   │   ├── malayalam-malayalam.tsx
    │   │   ├── malayalam_details.tsx
    │   │   ├── english-english.tsx
    │   │   ├── english_details.tsx
    │   │   ├── english_malayalam.tsx
    │   │   ├── english_malayalam_details.tsx
    │   │   ├── malayalam_english.tsx
    │   │   ├── malayalam_english_details.tsx
    │   │   ├── malayalam_synonym.tsx
    │   │   ├── malayalam_synonym_details.tsx
    │   │   ├── savishesha_thirayal.tsx  # Recent Activity screen
    │   │   ├── suggest-word.tsx
    │   │   ├── settings.tsx
    │   │   └── admin/
    │   │       ├── admin.tsx
    │   │       ├── manualinput.tsx
    │   │       ├── records.tsx
    │   │       ├── sqlimport.tsx
    │   │       ├── mediaupload.tsx
    │   │       ├── suggestedwordsview.tsx
    │   │       └── suggestiondetail.tsx
    │   ├── components/
    │   │   ├── AnimatedCard.tsx
    │   │   ├── FloatingLettersBackground.tsx
    │   │   ├── PronunciationButton.tsx
    │   │   ├── SkeletonLoader.tsx
    │   │   ├── SpeakButton.tsx
    │   │   ├── VoiceSearchOverlay.tsx
    │   │   └── side-menu.tsx
    │   ├── hooks/
    │   │   └── useVoiceSearch.ts
    │   └── utils/
    │       └── recentActivity.ts
    ├── assets/
    │   ├── Icons/                       # Animated GIF icons
    │   ├── images/
    │   └── fonts/
    ├── app.json
    ├── eas.json
    ├── .env
    └── package.json
```

---

## 🗄 Database

MongoDB Atlas is used with the database name Dictionary.

### Collections

| Collection | Model | Description |
|---|---|---|
| malayalam_malayalam_dictionary | MalayalamMalayalamDictionary | Full Malayalam lexicon |
| English_English_Dictionary | English_English_Dictionary | English dictionary with categories |
| english_malayalam_dictionary | EnglishMalayalamDictionary | English → Malayalam |
| malayalam_english_dictionary | MalayalamEnglishDictionary | Malayalam → English |
| malayalam_synonyms | MalayalamSynonyms | Thesaurus |
| Suggested_words | SuggestedWord | Community submissions with approval workflow |
| Category_english | (raw) | English grammatical category lookup |
| pronunciation_english/malayalam | Pronunciation | Manual audio paths & metadata |

### Malayalam Dictionary Schema

The primary collection includes: word, Gender, 
oot, phonetic_transcription, meanings[], proverbs[], synonyms[], dialects, inflections, etymology, cultural_note, equivalents { tulu, english }, images[], Category[].

---

## ⚙️ Environment Variables

### Backend (ackend/.env)

`env
# MongoDB Connection (required)
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/

# Server port (default: 5000)
PORT=5000

# Node environment
NODE_ENV=development


### Frontend (Mobile_app/.env)

`env
# Backend base URL — use LAN IP when testing on physical device
EXPO_PUBLIC_API_URL=http://[IP_ADDRESS]:5000
`

> **Note:** The EXPO_PUBLIC_ prefix is required by Expo. Never embed secrets in the frontend bundle.

---

## 🚀 Installation & Setup

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| MongoDB Atlas | — |
| Expo Go (device testing) | Latest |
| Android Studio / AVD | Latest |
| Google Cloud (voice/TTS) | Optional |

### 1. Clone the Repository

`ash
git clone https://github.com/your-org/bashamitram-II.git
cd "Final Bashamitram"
`

### 2. Backend Setup

`ash
cd backend
npm install
cp .env.example .env   # fill in your credentials
npm run dev            # start with hot-reload (nodemon)
`

Server runs at http://localhost:5000. Quick test:

`
GET http://localhost:5000/api/words/browse-malayalam?query=അ
`

### 3. Frontend Setup

`ash
cd Mobile_app
npm install
`

Create Mobile_app/.env:

`env
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:5000
`

`ash
npm start          # Start Expo dev server
npm run android    # Run directly on Android device/emulator
`

### 4. Production Build

`ash
npm install -g eas-cli
eas login
eas build --platform android --profile production
eas submit --platform android
`

---

## 🌐 API Architecture

### Dictionary Browse & Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/words/browse-malayalam?query= | Malayalam word list by letter/prefix |
| GET | /api/words/browse-synonyms?query= | Words with synonyms |
| GET | /api/words/browse-nanaarth?query= | Words with multiple meanings |
| GET | /api/words/details/:id?type=malayalam\|english | Full word detail |
| GET | /api/malayalam-malayalam?query= | Search Malayalam–Malayalam |
| GET | /api/english-english?query= | Search English–English |
| GET | /api/english-malayalam?query= | Search English–Malayalam |
| GET | /api/malayalam-english?query= | Search Malayalam–English |
| GET | /api/synonyms?query= | Search thesaurus |

### Pronunciation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pronunciation/:word | Auto audio: manual → Google TTS → gTTS |
| GET | /api/pronunciation/fallback/gtts?word= | Force gTTS synthesis |
| POST | /api/pronunciation/upload | Upload custom .mp3 (field: ile) |

### Speech-to-Text

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | /api/speech-to-text | { audioContent (base64), languageCode } | Transcribe via Google Cloud |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/suggestions | List word suggestions |
| POST | /api/words/suggest | Submit a word |
| POST | /api/admin/migrate | SQLite → MongoDB migration |
| GET/POST/PUT/DELETE | /api/admin/dictionary | Dictionary CRUD |

---

## 🚢 Deployment

### Backend

Deploy to Railway, Render, DigitalOcean, or AWS EC2:

1. Set MONGO_URI, GOOGLE_API_KEY, PORT in your platform's env settings.
2. Allow your host's IP in MongoDB Atlas network access.
3. Start command: 
ode server.js
4. Mount a persistent volume for /public/audio, or serve audio via AWS S3/GCS.

### Frontend

`ash
eas build --platform android --profile production   # Generate AAB
eas submit --platform android                       # Submit to Play Store
`

For web:

`ash
npx expo export --platform web
# Deploy dist/ to Vercel, Netlify, or similar
`

---

## 🤝 Contributing

1. Fork the repo and create your branch: git checkout -b feature/my-feature
2. Install deps in ackend/ and Mobile_app/
3. Follow existing style: CommonJS + async/await (backend), TypeScript + functional hooks (frontend)
4. Test on Android and backend before committing
5. Commit: git commit -m "feat: describe your change"
6. Open a Pull Request against main

**Reporting Issues:** Open a GitHub Issue with a clear description, reproduction steps, affected platform, and relevant logs.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](Mobile_app/LICENSE) for full details.

---

<div align="center">

**Developed with ❤️ by R&D — C-DIT**

[C-DIT Website](https://www.cdit.org) · Thiruvananthapuram, Kerala, India

</div>
