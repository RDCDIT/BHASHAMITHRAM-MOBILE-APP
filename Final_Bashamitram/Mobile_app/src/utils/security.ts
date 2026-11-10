/**
 * @file security.ts
 * @description Enterprise-Grade Security and Validation Module for Bhashamithram.
 * Provides:
 * - SHA-256 (FIPS PUB 180-4) & HMAC-SHA256 (RFC 2104) cryptographic signatures
 * - Pure TypeScript SHA-1 implementation (FIPS PUB 180-1)
 * - Strict Real-time Alphabet & Space Filtering (English and Malayalam)
 * - Deep HTML, Script, XSS, and SQL Injection Sanitization
 * - High-End Email Validation with Disposable/Dummy Domain & Username Filtering
 */

const SECRET_KEY = "bhashamithram-ultra-secure-key-2026-production";

// SHA-256 Constants
const K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function utf8Encode(str: string): Uint8Array {
  const codePoints: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 128) {
      codePoints.push(c);
    } else if (c < 2048) {
      codePoints.push((c >> 6) | 192);
      codePoints.push((c & 63) | 128);
    } else if (
      (c & 0xfc00) === 0xd800 &&
      i + 1 < str.length &&
      (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
    ) {
      c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
      codePoints.push((c >> 18) | 240);
      codePoints.push(((c >> 12) & 63) | 128);
      codePoints.push(((c >> 6) & 63) | 128);
      codePoints.push((c & 63) | 128);
    } else {
      codePoints.push((c >> 12) | 224);
      codePoints.push(((c >> 6) & 63) | 128);
      codePoints.push((c & 63) | 128);
    }
  }
  return new Uint8Array(codePoints);
}

/**
 * Computes raw SHA-256 hash buffer of input bytes.
 */
function sha256Bytes(data: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const dataLen = data.length;
  const bitLen = dataLen * 8;
  const padLen = (dataLen % 64 < 56) ? (56 - (dataLen % 64)) : (120 - (dataLen % 64));
  const totalLen = dataLen + padLen + 8;
  const padded = new Uint8Array(totalLen);

  padded.set(data);
  padded[dataLen] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(totalLen - 4, bitLen >>> 0, false);

  const w = new Int32Array(64);

  for (let i = 0; i < totalLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getInt32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const result = new Uint8Array(32);
  const resultView = new DataView(result.buffer);
  resultView.setInt32(0, h0, false);
  resultView.setInt32(4, h1, false);
  resultView.setInt32(8, h2, false);
  resultView.setInt32(12, h3, false);
  resultView.setInt32(16, h4, false);
  resultView.setInt32(20, h5, false);
  resultView.setInt32(24, h6, false);
  resultView.setInt32(28, h7, false);

  return result;
}

/**
 * Computes a standard SHA-256 hex string.
 */
export function sha256(str: string): string {
  const bytes = utf8Encode(str);
  const hash = sha256Bytes(bytes);
  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Pure TypeScript SHA-1 implementation (FIPS PUB 180-1).
 */
export function sha1(str: string): string {
  const bytes = utf8Encode(str);
  const n = bytes.length;
  const bitLen = n * 8;
  const padLen = (n % 64 < 56) ? (56 - (n % 64)) : (120 - (n % 64));
  const totalLen = n + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[n] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(totalLen - 4, bitLen >>> 0, false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Int32Array(80);

  for (let i = 0; i < totalLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getInt32(i + t * 4, false);
    }
    for (let t = 16; t < 80; t++) {
      const val = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
      w[t] = (val << 1) | (val >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let t = 0; t < 80; t++) {
      let f: number;
      let k: number;
      if (t < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  const result = new Uint8Array(20);
  const resultView = new DataView(result.buffer);
  resultView.setInt32(0, h0, false);
  resultView.setInt32(4, h1, false);
  resultView.setInt32(8, h2, false);
  resultView.setInt32(12, h3, false);
  resultView.setInt32(16, h4, false);

  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Computes HMAC-SHA256 cryptographic signature (RFC 2104).
 */
export function hmacSha256(message: string, key: string = SECRET_KEY): string {
  let keyBytes = utf8Encode(key);
  const blockSize = 64;

  if (keyBytes.length > blockSize) {
    keyBytes = sha256Bytes(keyBytes);
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    const k = i < keyBytes.length ? keyBytes[i] : 0;
    oKeyPad[i] = k ^ 0x5c;
    iKeyPad[i] = k ^ 0x36;
  }

  const msgBytes = utf8Encode(message);
  const inner = new Uint8Array(blockSize + msgBytes.length);
  inner.set(iKeyPad, 0);
  inner.set(msgBytes, blockSize);
  const innerHash = sha256Bytes(inner);

  const outer = new Uint8Array(blockSize + 32);
  outer.set(oKeyPad, 0);
  outer.set(innerHash, blockSize);
  const outerHash = sha256Bytes(outer);

  return Array.from(outerHash)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Canonicalizes JSON objects recursively with sorted keys for deterministic hashing.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalizeJson(item)).join(",") + "]";
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((k) => `${JSON.stringify(k)}:${canonicalizeJson(obj[k])}`);
  return "{" + pairs.join(",") + "}";
}

/**
 * Creates high-security request authentication headers with HMAC-SHA256 signature.
 */
export function generateSecurityHeaders(payload: any): { "x-signature": string; "x-timestamp": string } {
  const timestamp = Date.now().toString();
  const serialized = typeof payload === "string" ? payload : canonicalizeJson(payload);
  const message = `${timestamp}:${serialized}`;
  const signature = hmacSha256(message, SECRET_KEY);

  return {
    "x-signature": signature,
    "x-timestamp": timestamp,
  };
}

/**
 * Intercepts and strips single quote variations:
 * straight single quotes ('), curly quotes (’, ‘), backticks (`), and escaped single quotes (\').
 */
export function blockSingleQuotes(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/'/g, "")
    .replace(/’/g, "")
    .replace(/‘/g, "")
    .replace(/`/g, "")
    .replace(/\\'/g, "");
}

/**
 * Checks whether an input contains any single quotes or quotation escape sequences.
 */
export function hasSingleQuotes(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return /['’‘`]|\\'/.test(input);
}

/**
 * Strips HTML tags, script elements, javascript: protocols, and inline event handlers.
 */
export function sanitizeHtmlTags(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/\0/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/data\s*:[^,]+;base64,/gi, "");
}

/**
 * Checks whether an input contains HTML tags or script injection attempts.
 */
export function hasHtmlTags(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return /<[^>]+>|<script\b|javascript\s*:|on\w+\s*=/i.test(input);
}

/**
 * Detects SQL-specific injection syntax and command tokens.
 * Complies with OWASP CWE-89 mitigation standards.
 */
export function hasSqlInjectionTokens(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const sqlPattern = /('|--|\/\*|\*\/|;|\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+|\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|EXECUTE|TRUNCATE|DECLARE)\b)/i;
  return sqlPattern.test(input);
}

/**
 * Client-side threat neutralization: strips HTML tags, scripts, and injection attempts.
 */
export function sanitizeClientInput(input: string, maxLen: number = 2000): string {
  if (!input || typeof input !== "string") return "";

  let cleaned = sanitizeHtmlTags(blockSingleQuotes(input))
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .replace(/;/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  if (cleaned.length > maxLen) {
    cleaned = cleaned.substring(0, maxLen);
  }

  return cleaned.trim();
}

// =========================================================================
// STRICT ALPHABET & SPACE SANITIZATION AND VALIDATION
// =========================================================================

/**
 * Regex defining Malayalam alphabetic characters:
 * - Vowels: \u0D05-\u0D14
 * - Consonants: \u0D15-\u0D3A
 * - Additional consonants & signs: \u0D3B-\u0D4D
 * - Vowel signs (Matras): \u0D3E-\u0D4C, \u0D57
 * - Virama (Chandrakkala): \u0D4D
 * - Anusvara (\u0D02) & Visarga (\u0D03)
 * - Chillu letters: \u0D7A-\u0D7F, \u0D54-\u0D56
 * - Archaic letters: \u0D5F-\u0D63
 * - Zero-Width Non-Joiner (\u200C) and Zero-Width Joiner (\u200D)
 * EXCLUDES: Malayalam digits (\u0D66-\u0D6F), fractions (\u0D58-\u0D5E, \u0D70-\u0D78), ASCII digits 0-9, and symbols.
 */
export const MALAYALAM_ALPHABET_CHAR_PATTERN = /[\u0D00-\u0D57\u0D5F-\u0D63\u0D7A-\u0D7F\u200C\u200D]/;
export const MALAYALAM_ALPHABETS_ONLY_REGEX = /^[\u0D00-\u0D57\u0D5F-\u0D63\u0D7A-\u0D7F\u200C\u200D\s]+$/;

/**
 * Real-time filter: permits ONLY Malayalam alphabets and whitespace (spaces/newlines).
 * Strips all numbers (0-9, \u0D66-\u0D6F), English letters, punctuation, quotes, and symbols.
 */
export function cleanMalayalamAlphabets(input: string): string {
  if (!input || typeof input !== "string") return "";
  // Strip anything that is NOT a Malayalam alphabetic character or whitespace
  return input.replace(/[^\u0D00-\u0D57\u0D5F-\u0D63\u0D7A-\u0D7F\u200C\u200D\s]/g, "");
}

/**
 * Validates whether string contains strictly Malayalam alphabets and spaces.
 */
export function isStrictMalayalamAlphabets(input: string): boolean {
  if (!input || typeof input !== "string" || !input.trim()) return false;
  return MALAYALAM_ALPHABETS_ONLY_REGEX.test(input);
}

/**
 * Regex defining English alphabetic characters and spaces.
 */
export const ENGLISH_ALPHABETS_ONLY_REGEX = /^[a-zA-Z\s]+$/;

/**
 * Real-time filter: permits ONLY English alphabets (a-z, A-Z) and whitespace (spaces/newlines).
 * Strips all numbers, non-English letters, punctuation, quotes, and symbols.
 */
export function cleanEnglishAlphabets(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[^a-zA-Z\s]/g, "");
}

/**
 * Validates whether string contains strictly English alphabets and spaces.
 */
export function isStrictEnglishAlphabets(input: string): boolean {
  if (!input || typeof input !== "string" || !input.trim()) return false;
  return ENGLISH_ALPHABETS_ONLY_REGEX.test(input);
}

/**
 * Real-time filter: permits Malayalam OR English alphabets and spaces (for contributor name in Malayalam mode).
 */
export function cleanMalayalamOrEnglishAlphabets(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[^a-zA-Z\u0D00-\u0D57\u0D5F-\u0D63\u0D7A-\u0D7F\u200C\u200D\s]/g, "");
}

export function isStrictMalayalamOrEnglishAlphabets(input: string): boolean {
  if (!input || typeof input !== "string" || !input.trim()) return false;
  return /^[a-zA-Z\u0D00-\u0D57\u0D5F-\u0D63\u0D7A-\u0D7F\u200C\u200D\s]+$/.test(input);
}

/**
 * Real-time filter for Kannada script and space.
 */
export function cleanKannadaAlphabets(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[^\u0C80-\u0CFF\s]/g, "");
}

/**
 * Real-time filter for Tamil script and space.
 */
export function cleanTamilAlphabets(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[^\u0B80-\u0BFF\s]/g, "");
}

// =========================================================================
// HIGH-END STRICT EMAIL VALIDATION
// =========================================================================

/**
 * Comprehensive Blacklist of Disposable / Temporary / Fake Email Providers
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com", "temp-mail.org", "temp-mail.io", "tempmailaddress.com",
  "10minutemail.com", "10minutemail.net", "10minutemail.org",
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com",
  "mailinator.com", "mailinator2.com", "mailinator.net",
  "throwawaymail.com", "throwaway.email", "disposable.email",
  "yopmail.com", "yopmail.net", "yopmail.fr", "yopmail.org",
  "sharklasers.com", "getairmail.com", "dispostable.com",
  "trashmail.com", "trashmail.net", "trashmail.org", "trashmail.me", "trash-mail.com",
  "burnermail.io", "mytemp.email", "mytempemail.com", "maildrop.cc",
  "inboxkitten.com", "mohmal.com", "disposablemail.com", "nada.ltd",
  "crazymailing.com", "dropmail.me", "emailondeck.com", "getnada.com",
  "tempr.email", "fakemailgenerator.com", "generator.email", "spamgourmet.com",
  "mintemail.com", "mailnesia.com", "armyspy.com", "cuvox.de", "dayrep.com",
  "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com",
  "teleworm.us", "tinypm.com", "byom.de", "zillamail.com", "jetable.org",
  "fakeinbox.com", "spambog.com", "discard.email", "discardmail.com", "mailcatch.com",
  // Common dummy / placeholder domains
  "example.com", "example.org", "example.net",
  "test.com", "test.org", "test.net", "testing.com",
  "dummy.com", "dummy.org", "dummy.net",
  "fake.com", "fakemail.com", "fakermail.com",
  "sample.com", "sample.org", "invalid.com", "none.com",
  "asdf.com", "qwerty.com", "123.com", "abc.com", "xyz.com", "user.com"
]);

/**
 * Common Dummy / Placeholder Usernames
 */
const DUMMY_USERNAMES = new Set([
  "test", "testing", "tested", "test1", "test123", "testuser",
  "dummy", "dummy1", "dummy123", "dummyuser", "dummyemail",
  "fake", "fake1", "fakeemail", "fakeuser",
  "sample", "sampleuser", "example",
  "demo", "demouser", "user", "user1", "username",
  "asdf", "asdfg", "asdfgh", "qwerty", "qwertyuiop",
  "1234", "12345", "123456", "1234567",
  "admin", "administrator", "root", "null", "undefined", "none",
  "temp", "temporary", "trash", "spam",
  "noreply", "no-reply", "postmaster", "mailer-daemon",
  "anon", "anonymous", "someone", "nobody",
  "abc", "abcd", "abcdef", "aaa", "bbb", "ccc", "xyz"
]);

export interface EmailValidationResult {
  isValid: boolean;
  errorEn: string;
  errorMl: string;
}

/**
 * Validates email with high-end, rigorous security and authenticity checks:
 * 1. Valid RFC 5322 structure and length limits
 * 2. Blocks disposable / temporary / burner email domains
 * 3. Blocks placeholder and dummy usernames (e.g., test, dummy, fake)
 * 4. Rejects repetitive character usernames and pure-numeric usernames
 * 5. Validates legitimate domain format and TLD syntax
 */
export function validateHighEndEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== "string" || !email.trim()) {
    return {
      isValid: false,
      errorEn: "Email address is required.",
      errorMl: "ഇമെയിൽ വിലാസം നിർബന്ധമായും നൽകേണ്ടതുണ്ട്."
    };
  }

  const clean = email.trim().toLowerCase();

  // 1. Length constraints (RFC 5321)
  if (clean.length < 6 || clean.length > 254) {
    return {
      isValid: false,
      errorEn: "Email address must be between 6 and 254 characters.",
      errorMl: "ഇമെയിൽ വിലാസം 6 മുതൽ 254 അക്ഷരങ്ങൾക്കുള്ളിലായിരിക്കണം."
    };
  }

  // 2. Strict RFC 5322 pattern
  const rfcRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!rfcRegex.test(clean)) {
    return {
      isValid: false,
      errorEn: "Please enter a valid email address format (e.g. name@domain.com).",
      errorMl: "ശരിയായ ഇമെയിൽ വിലാസം നൽകുക (ഉദാ: name@domain.com)."
    };
  }

  // 3. Exactly one @ symbol
  const parts = clean.split("@");
  if (parts.length !== 2) {
    return {
      isValid: false,
      errorEn: "Invalid email: Multiple or missing '@' symbols.",
      errorMl: "അസാധുവായ ഇമെയിൽ: ഒരൊറ്റ '@' ചിഹ്നം മാത്രമേ പാടുള്ളൂ."
    };
  }

  const [username, domain] = parts;

  // 4. Username structure checks
  if (username.length < 2 || username.length > 64) {
    return {
      isValid: false,
      errorEn: "Email username portion must be between 2 and 64 characters.",
      errorMl: "ഇമെയിൽ യൂസർനെയിം ഭാഗം 2 മുതൽ 64 അക്ഷരങ്ങൾക്കിടയിലായിരിക്കണം."
    };
  }

  if (username.startsWith(".") || username.endsWith(".") || username.includes("..")) {
    return {
      isValid: false,
      errorEn: "Email username cannot start, end, or contain consecutive dots (..).",
      errorMl: "യൂസർനെയിമിൽ തുടർച്ചയായ ഡോട്ടുകൾ (..) അല്ലെങ്കിൽ തുടക്കത്തിലും അവസാനത്തിലും ഡോട്ട് അനുവദനീയമല്ല."
    };
  }

  // 5. Domain structure checks
  if (domain.length < 4 || domain.length > 253) {
    return {
      isValid: false,
      errorEn: "Email domain portion is invalid.",
      errorMl: "ഇമെയിൽ ഡൊമെയ്ൻ അസാധുവാണ്."
    };
  }

  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..") || domain.startsWith("-") || domain.endsWith("-")) {
    return {
      isValid: false,
      errorEn: "Email domain contains invalid dot or hyphen formatting.",
      errorMl: "ഡൊമെയ്നിൽ ഡോട്ടുകളോ ഹൈഫനുകളോ തെറ്റായി നൽകിയിരിക്കുന്നു."
    };
  }

  const domainParts = domain.split(".");
  if (domainParts.length < 2) {
    return {
      isValid: false,
      errorEn: "Email domain must include a valid top-level domain (e.g., .com, .in).",
      errorMl: "ഡൊമെയ്നിൽ ശരിയായ ടോപ് ലെവൽ ഡൊമെയ്ൻ (ഉദാ: .com, .in) ഉണ്ടായിരിക്കണം."
    };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return {
      isValid: false,
      errorEn: "Email top-level domain (TLD) must contain only alphabets and be at least 2 letters.",
      errorMl: "ഇമെയിൽ ഡൊമെയ്ൻ വിപുലീകരണം (TLD) കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം."
    };
  }

  // 6. Check disposable / fake / dummy email domain blacklist
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      errorEn: "Disposable and dummy email domains are not permitted. Please use your authentic email address.",
      errorMl: "താൽക്കാലികമായതോ വ്യാജമായതോ ആയ (Dummy/Disposable) ഇമെയിൽ ഡൊമെയ്നുകൾ അനുവദനീയമല്ല. നിങ്ങളുടെ യഥാർത്ഥ ഇമെയിൽ നൽകുക."
    };
  }

  for (const disposable of Array.from(DISPOSABLE_EMAIL_DOMAINS)) {
    if (domain.endsWith("." + disposable)) {
      return {
        isValid: false,
        errorEn: "Disposable and dummy email subdomains are not permitted. Please use your authentic email address.",
        errorMl: "വ്യാജമായ സബ്-ഡൊമെയ്നുകൾ അനുവദനീയമല്ല. നിങ്ങളുടെ യഥാർത്ഥ ഇമെയിൽ നൽകുക."
      };
    }
  }

  // 7. Check dummy / placeholder usernames
  const cleanUsername = username.replace(/[^a-z0-9]/g, "");
  if (DUMMY_USERNAMES.has(cleanUsername) || DUMMY_USERNAMES.has(username)) {
    return {
      isValid: false,
      errorEn: "Dummy or test usernames (such as 'test', 'dummy', 'fake') are not allowed. Please enter your real email.",
      errorMl: "'test', 'dummy', 'fake' തുടങ്ങിയ വ്യാജ പേരുകൾ അനുവദനീയമല്ല. നിങ്ങളുടെ യഥാർത്ഥ ഇമെയിൽ നൽകുക."
    };
  }

  // 8. Reject repetitive patterns (e.g. 'aaaa', '1111')
  if (/^(.)\1{3,}$/.test(cleanUsername)) {
    return {
      isValid: false,
      errorEn: "Email username cannot contain repetitive single characters. Please enter a valid email.",
      errorMl: "തുടർച്ചയായി ഒരേ അക്ഷരം മാത്രമുള്ള വ്യാജ ഇമെയിൽ അനുവദനീയമല്ല."
    };
  }

  // 9. Reject pure-numeric usernames (e.g. '12345678@gmail.com')
  if (/^[0-9]+$/.test(cleanUsername)) {
    return {
      isValid: false,
      errorEn: "Numeric-only usernames are not permitted. Please provide an authentic personal or official email.",
      errorMl: "സംഖ്യകൾ മാത്രമുള്ള യൂസർനെയിം അനുവദനീയമല്ല. യഥാർത്ഥ വ്യക്തിഗത അല്ലെങ്കിൽ ഔദ്യോഗിക ഇമെയിൽ നൽകുക."
    };
  }

  return {
    isValid: true,
    errorEn: "",
    errorMl: ""
  };
}
