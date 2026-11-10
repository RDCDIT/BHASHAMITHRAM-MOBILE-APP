/**
 * @file transliterator.ts
 * @description Fast, offline-first Manglish (Latin script) to Malayalam transliteration utility.
 * Operates completely offline without requiring an internet connection.
 */

// Comprehensive lookup map for high-frequency Malayalam words
const COMMON_MANGLISH_MAP: Record<string, string> = {
  // Family & Relations
  amma: "അമ്മ",
  ammaye: "അമ്മയെ",
  ammayude: "അമ്മയുടെ",
  achan: "അച്ഛൻ",
  achante: "അച്ഛന്റെ",
  chettan: "ചേട്ടൻ",
  chechi: "ചേച്ചി",
  anujan: "അനിയൻ",
  aniyathi: "അനിയത്തി",
  makan: "മകൻ",
  makal: "മകൾ",
  bhaarya: "ഭാര്യ",
  bharthavu: "ഭർത്താവ്",
  kudumbam: "കുടുംബം",

  // Language & App terms
  bhasha: "ഭാഷ",
  bhashamithram: "ഭാഷാമിത്രം",
  kerala: "കേരളം",
  keralam: "കേരളം",
  malayalam: "മലയാളം",
  english: "ഇംഗ്ലീഷ്",
  nighandu: "നിഘണ്ടു",
  shabdam: "ശബ്ദം",
  ardham: "അർത്ഥം",
  artham: "അർത്ഥം",
  vaakku: "വാക്ക്",
  aksharam: "അക്ഷരം",

  // Greetings & Courtesies
  namaskaram: "നമസ്കാരം",
  nandi: "നന്ദി",
  nanni: "നന്ദി",
  sneham: "സ്നേഹം",
  swagatham: "സ്വാഗതം",
  shubham: "ശുഭം",
  shanti: "ശാന്തി",
  santhosham: "സന്തോഷം",
  sankadam: "സങ്കടം",
  dukham: "ദുഃഖം",
  sahayam: "സഹായം",
  vijayam: "വിജയം",

  // Common Objects & Nature
  veedu: "വീട്",
  pookkal: "പൂക്കൾ",
  poovu: "പൂവ്",
  pusthakam: "പുസ്തകം",
  samayam: "സമയം",
  nalla: "നല്ല",
  guru: "ഗുരു",
  vidya: "വിദ്യ",
  vidyalayam: "വിദ്യാലയം",
  velicham: "വെളിച്ചം",
  iruttu: "ഇരുട്ട്",
  mazha: "മഴ",
  kaattu: "കാറ്റ്",
  vellam: "വെള്ളം",
  thee: "തീ",
  aakasham: "ആകാശം",
  bhoomi: "ഭൂമി",
  surya: "സൂര്യൻ",
  suryan: "സൂര്യൻ",
  chandran: "ചന്ദ്രൻ",
  tharakal: "താരങ്ങൾ",
  kadalu: "കടൽ",
  kadal: "കടൽ",
  puzha: "പുഴ",
  nadi: "നദി",
  vriksham: "വൃക്ഷം",
  maram: "മരം",
  kaadu: "കാട്",
  desham: "ദേശം",
  rajyam: "രാജ്യം",
  jeevitham: "ജീവിതം",
  karyam: "കാര്യം",
  chodyam: "ചോദ്യം",
  utharam: "ഉത്തരം",
  shari: "ശരി",
  thettu: "തെറ്റ്",
  puthiya: "പുതിയ",
  pazhaya: "പഴയ",
  valiya: "വലിയ",
  cheriya: "ചെറിയ",
  swantham: "സ്വന്തം",

  // Actions
  varoo: "വരൂ",
  pogo: "പോകൂ",
  varika: "വരിക",
  pokuka: "പോകുക",
  cheyyuka: "ചെയ്യുക",
  kaanuka: "കാണുക",
  parayuka: "പറയുക",
  kelkkuka: "കേൾക്കുക",
  thirayuka: "തിരയുക",
};

// Vowels mapping (standalone)
const VOWELS: [RegExp, string][] = [
  [/^aa/i, "ആ"], [/^a/i, "അ"],
  [/^ee/i, "ഈ"], [/^i/i, "ഇ"],
  [/^oo/i, "ഊ"], [/^u/i, "ഉ"],
  [/^ai/i, "ഐ"], [/^e/i, "എ"],
  [/^ou/i, "ഔ"], [/^au/i, "ഔ"], [/^o/i, "ഒ"],
  [/^am/i, "അം"], [/^ah/i, "അഃ"],
];

// Phonetic rules mapping English characters to Malayalam consonants
const CONSONANTS: [string, string][] = [
  ["ksha", "ക്ഷ"], ["ng", "ങ"], ["nj", "ഞ"], ["chh", "ഛ"], ["ch", "ച"],
  ["thth", "ത്ത"], ["tth", "ത്ഥ"], ["th", "ത"], ["dh", "ധ"], ["sh", "ശ"],
  ["zh", "ഴ"], ["gh", "ഘ"], ["jh", "ഝ"], ["bh", "ഭ"], ["ph", "ഫ"], ["kh", "ഖ"],
  ["kk", "ക്ക"], ["tt", "ട്ട"], ["pp", "പ്പ"], ["mm", "മ്മ"], ["nn", "ന്ന"],
  ["ll", "ല്ല"], ["ss", "സ്സ"], ["yy", "യ്യ"], ["vv", "വ്വ"],
  ["k", "ക"], ["g", "ഗ"], ["j", "ജ"], ["t", "റ്റ"], ["d", "ദ"],
  ["n", "ന"], ["p", "പ"], ["f", "ഫ"], ["b", "ബ"], ["m", "മ"],
  ["y", "യ"], ["r", "ര"], ["l", "ല"], ["v", "വ"], ["w", "വ"],
  ["s", "സ"], ["h", "ഹ"], ["z", "ഴ"],
];

// Vowel matras when attached to consonants. 'am' MUST precede 'a' to match anuswaram.
const VOWEL_MATRAS: [string, string][] = [
  ["aa", "ാ"], ["am", "ം"], ["a", ""],
  ["ee", "ീ"], ["i", "ി"],
  ["oo", "ൂ"], ["u", "ു"],
  ["ai", "ൈ"], ["e", "െ"],
  ["ou", "ൌ"], ["au", "ൌ"], ["o", "ൊ"],
];

/**
 * Phonetically transliterates an individual Manglish word to Malayalam offline.
 */
function transliterateWord(word: string): string {
  if (!word) return "";
  const clean = word.toLowerCase().trim();

  // 1. Direct dictionary lookup
  if (COMMON_MANGLISH_MAP[clean]) {
    return COMMON_MANGLISH_MAP[clean];
  }

  let text = clean;
  let result = "";
  let i = 0;

  while (i < text.length) {
    // End of word anuswaram (-am -> ം)
    if (i === text.length - 2 && text.endsWith("am")) {
      result += "ം";
      break;
    }
    // End of word chillaksharam (-n -> ൻ, -l -> ൽ, -r -> ർ)
    if (i === text.length - 1) {
      if (text.endsWith("n")) { result += "ൻ"; break; }
      if (text.endsWith("l")) { result += "ൽ"; break; }
      if (text.endsWith("r")) { result += "ർ"; break; }
    }

    let matchedConsonant = false;
    for (const [pattern, char] of CONSONANTS) {
      if (text.substring(i).startsWith(pattern)) {
        result += char;
        i += pattern.length;
        matchedConsonant = true;

        // Check if followed by vowel matra
        let matchedMatra = false;
        for (const [matraPat, matraChar] of VOWEL_MATRAS) {
          if (text.substring(i).startsWith(matraPat)) {
            result += matraChar;
            i += matraPat.length;
            matchedMatra = true;
            break;
          }
        }

        // If consonant followed by another consonant or end of word without vowel, handle virama/chillu
        if (!matchedMatra) {
          if (i < text.length) {
            const isNextVowel = VOWELS.some(([reg]) => reg.test(text.substring(i)));
            if (!isNextVowel) {
              result += "്";
            }
          } else {
            // End of word consonant: check for chillu
            if (pattern === "n") {
              result = result.slice(0, -1) + "ൻ";
            } else if (pattern === "l") {
              result = result.slice(0, -1) + "ൽ";
            } else if (pattern === "r") {
              result = result.slice(0, -1) + "ർ";
            } else {
              result += "്";
            }
          }
        }
        break;
      }
    }

    if (!matchedConsonant) {
      // Check standalone vowels
      let matchedVowel = false;
      for (const [reg, char] of VOWELS) {
        const match = text.substring(i).match(reg);
        if (match) {
          result += char;
          i += match[0].length;
          matchedVowel = true;
          break;
        }
      }

      if (!matchedVowel) {
        // Retain unmapped characters (numbers, punctuation)
        result += text[i];
        i++;
      }
    }
  }

  return result;
}

/**
 * Phonetically transliterates Manglish (Latin text) to Malayalam script 100% offline.
 * Preserves spaces, punctuation, and existing Malayalam letters.
 */
export function transliterateOffline(input: string): string {
  if (!input) return "";
  return input
    .split(/([a-zA-Z]+)/)
    .map((segment) => {
      if (/^[a-zA-Z]+$/.test(segment)) {
        return transliterateWord(segment);
      }
      return segment;
    })
    .join("");
}

// In-memory cache for online suggestions if network is present
const suggestionsCache = new Map<string, string[]>();

/**
 * Normalizes and deduplicates suggestion candidates.
 */
function deduplicateSuggestions(raw: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of raw) {
    const cleaned = item.replace(/^['"\s]+|['"\s]+$/g, "").trim();
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }
  return result;
}

/**
 * Fetches Malayalam transliteration suggestions.
 * Returns fast offline transliteration immediately, while also optionally querying
 * Google Input Tools if internet is available.
 */
export async function fetchGoogleMalayalamSuggestions(
  query: string,
  count: number = 5
): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cacheKey = trimmed.toLowerCase();
  if (suggestionsCache.has(cacheKey)) {
    return suggestionsCache.get(cacheKey)!;
  }

  // If text contains no Latin / English letters, return original
  if (!/[a-zA-Z]/.test(trimmed)) {
    return [trimmed];
  }

  const offlineResult = transliterateOffline(trimmed);
  const candidates: string[] = offlineResult ? [offlineResult] : [];

  // Try fetching additional online candidates if internet is available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
      trimmed
    )}&itc=ml-t-i0-und&num=${count}&cp=0&cs=1&ie=utf-8&oe=utf-8&app=bhashamithram`;

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (
        Array.isArray(data) &&
        data[0] === "SUCCESS" &&
        Array.isArray(data[1]) &&
        data[1].length > 0 &&
        Array.isArray(data[1][0][1])
      ) {
        const cleaned = deduplicateSuggestions(data[1][0][1]);
        if (cleaned.length > 0) {
          suggestionsCache.set(cacheKey, cleaned);
          return cleaned;
        }
      }
    }
  } catch {
    // Offline or network timeout: seamlessly fallback to offline candidate
  }

  if (candidates.length > 0) {
    suggestionsCache.set(cacheKey, candidates);
  }
  return candidates;
}

/**
 * Transliterates Latin / Manglish text to Malayalam.
 * Uses instantaneous offline transliteration, ensuring the app works without internet.
 */
export async function transliterateWithGoogle(text: string): Promise<string> {
  if (!text) return "";
  if (!/[a-zA-Z]/.test(text)) return text;
  return transliterateOffline(text);
}

/**
 * Synchronous transliterate function.
 * Always works 100% offline.
 */
export function transliterate(text: string, _options?: { from?: string; to?: string }): string {
  if (!text) return "";
  return transliterateOffline(text);
}

/**
 * Async transliterate function.
 */
export async function transliterateAsync(word: string): Promise<string> {
  return transliterateOffline(word);
}
