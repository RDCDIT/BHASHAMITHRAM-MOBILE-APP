/**
 * @file transliterator.ts
 * @description Manglish (English script) to Malayalam transliteration utility.
 */

// Common Manglish words lookup table for instantaneous offline accuracy
const COMMON_MANGLISH_MAP: Record<string, string> = {
  amma: "അമ്മ",
  achan: "അച്ഛൻ",
  bhasha: "ഭാഷ",
  bhashamithram: "ഭാഷാമിത്രം",
  kerala: "കേരളം",
  keralam: "കേരളം",
  malayalam: "മലയാളം",
  namaskaram: "നമസ്കാരം",
  nandi: "നന്ദി",
  nanni: "നന്ദി",
  sneham: "സ്നേഹം",
  veedu: "വീട്",
  pookkal: "പൂക്കൾ",
  varoo: "വരൂ",
  pogo: "പോകൂ",
  samayam: "സമയം",
  nalla: "നല്ല",
  guru: "ഗുരു",
  vidya: "വിദ്യ",
  shubham: "ശുഭം",
  shanti: "ശാന്തി",
  swagatham: "സ്വാഗതം",
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

// Phonetic rules mapping English characters to Malayalam letters
const CONSONANTS: [string, string][] = [
  ["ksha", "ക്ഷ"], ["ng", "ങ"], ["nj", "ഞ"], ["ch", "ച"], ["chh", "ഛ"],
  ["th", "ത"], ["dh", "ധ"], ["sh", "ശ"], ["zh", "ഴ"], ["gh", "ഘ"],
  ["jh", "ഝ"], ["bh", "ഭ"], ["ph", "ഫ"], ["kh", "ഖ"],
  ["k", "ക"], ["g", "ഗ"], ["j", "ജ"], ["t", "റ്റ"], ["d", "ദ"],
  ["n", "ന"], ["p", "പ"], ["f", "ഫ"], ["b", "ബ"], ["m", "മ"],
  ["y", "യ"], ["r", "ര"], ["l", "ല"], ["v", "വ"], ["w", "വ"],
  ["s", "സ"], ["h", "ഹ"], ["z", "ഴ"],
];

const VOWEL_MATRAS: [string, string][] = [
  ["aa", "ാ"], ["a", ""],
  ["ee", "ീ"], ["i", "ി"],
  ["oo", "ൂ"], ["u", "ു"],
  ["ai", "ൈ"], ["e", "െ"],
  ["ou", "ൌ"], ["au", "ൌ"], ["o", "ൊ"],
  ["am", "ം"],
];

/**
 * Phonetically transliterates Manglish (Latin text) to Malayalam script offline.
 */
export function transliterateOffline(input: string): string {
  if (!input) return "";
  const cleanInput = input.trim().toLowerCase();

  if (COMMON_MANGLISH_MAP[cleanInput]) {
    return COMMON_MANGLISH_MAP[cleanInput];
  }

  let text = cleanInput;
  let result = "";
  let i = 0;

  while (i < text.length) {
    let matchedConsonant = false;

    // Check consonants
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
        // If consonant followed by consonant or end, add virama (chandrakkala) if needed
        if (!matchedMatra && i < text.length && !VOWELS.some(([reg]) => reg.test(text.substring(i)))) {
          // Virama for halant
          result += "്";
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
        // Keep character as is (e.g. spaces, numbers, punctuation)
        result += text[i];
        i++;
      }
    }
  }

  return result;
}

/**
 * Main transliterate function exported for use across the application.
 */
export function transliterate(text: string, options?: { from?: string; to?: string }): string {
  if (!text) return "";
  return transliterateOffline(text);
}

/**
 * Async transliterate function fetching online suggestions from IndicTransliterate API if available.
 */
export async function transliterateAsync(word: string): Promise<string> {
  if (!word) return "";
  try {
    const response = await fetch(
      `https://xlit-api.ai4bharat.org/tl/${encodeURIComponent(word)}`,
      { method: "GET" }
    );
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.result) && data.result.length > 0) {
        return data.result[0];
      }
    }
  } catch (e) {
    // Silent fallback
  }
  return transliterateOffline(word);
}
