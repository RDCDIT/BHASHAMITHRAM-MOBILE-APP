/**
 * @file security.js
 * @description Enterprise-grade security module for word suggestion processing.
 * Upgrades legacy/insecure MD5 hashing to SHA-256 / HMAC-SHA256, provides AES-256 encryption,
 * and enforces deep anti-malware, anti-virus, XSS, and injection sanitization.
 */

const crypto = require('crypto');

// Secret key for HMAC signing and AES-256 encryption (fallback provided for development)
const SECRET_KEY = process.env.SUGGESTION_SECRET_KEY || 'bhashamithram-ultra-secure-key-2026-production';
// Derive a 32-byte key for AES-256
const AES_KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

/**
 * Computes a high-security SHA-256 hash for a given object or string.
 * Replaces legacy MD5 checksums.
 * 
 * @param {string|object} data 
 * @returns {string} Hex-encoded SHA-256 digest
 */
function computeSha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Computes an HMAC-SHA256 signature for request authentication and tamper prevention.
 * 
/**
 * Canonicalizes JSON objects recursively with sorted keys for deterministic hashing.
 */
function canonicalizeJson(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeJson(item)).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(k => `${JSON.stringify(k)}:${canonicalizeJson(obj[k])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Computes an HMAC-SHA256 signature for request authentication and tamper prevention.
 * 
 * @param {object|string} payload 
 * @param {number|string} timestamp 
 * @returns {string} Hex-encoded HMAC-SHA256 signature
 */
function computeHmacSignature(payload, timestamp) {
  const normalized = typeof payload === 'string' ? payload : canonicalizeJson(payload);
  const message = `${timestamp}:${normalized}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(message).digest('hex');
}

/**
 * Verifies an HMAC-SHA256 signature and validates timestamp to block replay attacks.
 * 
 * @param {object|string} payload 
 * @param {number|string} timestamp 
 * @param {string} signature 
 * @param {number} maxAgeMs Maximum allowed request age (default: 24 hours to accommodate mobile clock variations)
 * @returns {{ valid: boolean, reason?: string }}
 */
function verifyHmacSignature(payload, timestamp, signature, maxAgeMs = 24 * 60 * 60 * 1000) {
  if (!signature || !timestamp) {
    return { valid: false, reason: 'Missing signature or timestamp' };
  }

  const numericTimestamp = Number(timestamp);
  if (isNaN(numericTimestamp)) {
    return { valid: false, reason: 'Invalid timestamp format' };
  }

  const currentTime = Date.now();
  // Check replay window (allow +/- 24 hours for mobile clock drift)
  if (Math.abs(currentTime - numericTimestamp) > maxAgeMs) {
    return { valid: false, reason: 'Request timestamp expired or out of allowed window' };
  }

  const expectedSig1 = computeHmacSignature(payload, timestamp);
  const rawString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const expectedSig2 = crypto.createHmac('sha256', SECRET_KEY).update(`${timestamp}:${rawString}`).digest('hex');

  const checkMatch = (expected) => {
    try {
      const sigBuffer = Buffer.from(signature, 'hex');
      const expBuffer = Buffer.from(expected, 'hex');
      if (sigBuffer.length !== expBuffer.length) return false;
      return crypto.timingSafeEqual(sigBuffer, expBuffer);
    } catch {
      return false;
    }
  };

  const isMatch = checkMatch(expectedSig1) || checkMatch(expectedSig2);
  return { valid: isMatch, reason: isMatch ? undefined : 'Signature does not match' };
}

/**
 * Encrypts sensitive string or payload using AES-256-GCM.
 * 
 * @param {string|object} data 
 * @returns {string} Base64 encoded payload: iv:authTag:ciphertext
 */
function encryptAes256(data) {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted payload.
 * 
 * @param {string} encryptedString format: iv:authTag:ciphertext
 * @returns {string|object} Decrypted data
 */
function decryptAes256(encryptedString) {
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format. Expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

/**
 * Deep sanitization for strings:
 * - Neutralizes script tags, iframes, and HTML injection
 * - Strips dangerous Javascript URIs and event handlers
 * - Cleans null bytes
 * - Neutralizes SQL / NoSQL command tokens
 * 
 * @param {string} str 
 * @param {number} maxLen 
 * @returns {string} Sanitized string
 */
function sanitizeString(str, maxLen = 2000) {
  if (typeof str !== 'string') return '';

  let cleaned = str
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove <script> ... </script> blocks entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove <iframe>, <object>, <embed>, <applet>
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // Strip HTML tags
    .replace(/<[^>]+>/g, '')
    // Neutralize dangerous inline event attributes like onerror=, onload=, onclick=
    .replace(/on\w+\s*=/gi, '')
    // Neutralize javascript: URIs
    .replace(/javascript\s*:/gi, '')
    // Neutralize single quotes and quote-based SQL injection tokens
    .replace(/['’‘`]|\\'/g, '')
    // Neutralize SQL comments and statement terminators
    .replace(/--|\/\*|\*\//g, '')
    .replace(/;/g, '')
    // Strip control characters except newline and tab
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Truncate to maximum permissible length to prevent DoS
  if (cleaned.length > maxLen) {
    cleaned = cleaned.substring(0, maxLen);
  }

  return cleaned.trim();
}

/**
 * Validates base64 media content (images/audio) to block executable payloads,
 * virus droppers, and malware files masquerading as media.
 * 
 * @param {string} base64Str 
 * @returns {{ valid: boolean, error?: string }}
 */
function validateMediaContent(base64Str) {
  if (!base64Str || typeof base64Str !== 'string') return { valid: true };

  // Strip data URI scheme if present (e.g. data:image/png;base64,...)
  const cleanBase64 = base64Str.replace(/^data:[^;]+;base64,/, '');

  // Ensure valid base64 pattern
  if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64.substring(0, 100))) {
    return { valid: false, error: 'Malformed base64 media data' };
  }

  try {
    // Read first 32 bytes to inspect magic numbers / file signatures
    const buffer = Buffer.from(cleanBase64.substring(0, 64), 'base64');
    if (buffer.length < 4) return { valid: true };

    // Check for executable file headers (Malware & Virus protection)
    // Windows PE / EXE / DLL: 'MZ' (0x4D 0x5A)
    if (buffer[0] === 0x4D && buffer[1] === 0x5A) {
      return { valid: false, error: 'Security alert: Windows executable file header detected' };
    }
    // Linux ELF: 0x7F 'E' 'L' 'F' (0x7F 0x45 0x4C 0x46)
    if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
      return { valid: false, error: 'Security alert: Linux binary executable header detected' };
    }
    // Shell script / shebang: '#!' (0x23 0x21)
    if (buffer[0] === 0x23 && buffer[1] === 0x21) {
      return { valid: false, error: 'Security alert: Shell script header detected' };
    }
    // PHP script: '<?ph' (0x3C 0x3F 0x70 0x68)
    if (buffer[0] === 0x3C && buffer[1] === 0x3F) {
      return { valid: false, error: 'Security alert: Script code detected in media payload' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: `Media validation failure: ${err.message}` };
  }
}

const SQL_INJECTION_REGEX = /('|--|\/\*|\*\/|;|\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+|\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|EXECUTE|TRUNCATE|DECLARE)\b)/i;

/**
 * Validates whether string contains SQL injection characters or syntax.
 */
function hasSqlInjection(input) {
  if (!input || typeof input !== 'string') return false;
  return SQL_INJECTION_REGEX.test(input);
}

/**
 * Recursively cleans and sanitizes the entire suggestion payload object.
 * 
 * @param {object} rawPayload 
 * @returns {object} Cleaned and sanitized payload
 */
function sanitizeSuggestionPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') return {};

  // Check for SQL injection attempts across raw payload fields
  const fieldsToCheck = [
    rawPayload.word,
    rawPayload.meaning,
    rawPayload.root,
    rawPayload.etymology,
    rawPayload.cultural_note,
    rawPayload.synonyms,
    rawPayload.antonyms,
    rawPayload.dialects,
    rawPayload.proverb,
    rawPayload.similar_word,
    rawPayload.novel_words,
    rawPayload.cross_reference,
    rawPayload.inflections,
    rawPayload.contributor?.name,
    rawPayload.contributor?.email
  ];

  for (const field of fieldsToCheck) {
    if (typeof field === 'string' && hasSqlInjection(field)) {
      throw new Error("Security alert: Potential SQL injection syntax detected in submitted input.");
    }
  }

  const clean = {};

  // Text fields with appropriate length constraints
  clean.word = sanitizeString(rawPayload.word, 150);
  clean.language_type = sanitizeString(rawPayload.language_type || 'malayalam', 50);
  clean.root = sanitizeString(rawPayload.root, 300);
  clean.etymology = sanitizeString(rawPayload.etymology, 1000);
  clean.cultural_note = sanitizeString(rawPayload.cultural_note, 3000);
  clean.synonyms = sanitizeString(rawPayload.synonyms, 1000);
  clean.antonyms = sanitizeString(rawPayload.antonyms, 1000);
  clean.dialects = sanitizeString(rawPayload.dialects, 1000);
  clean.proverb = sanitizeString(rawPayload.proverb, 1500);
  clean.similar_word = sanitizeString(rawPayload.similar_word, 500);
  clean.novel_words = sanitizeString(rawPayload.novel_words, 1000);
  clean.cross_reference = sanitizeString(rawPayload.cross_reference, 1000);
  clean.inflections = sanitizeString(rawPayload.inflections, 1000);
  clean.gender = sanitizeString(rawPayload.gender, 50);
  clean.phonetic_transcription = sanitizeString(rawPayload.phonetic_transcription, 200);
  clean.pronunciation = typeof rawPayload.pronunciation === 'string' ? rawPayload.pronunciation.trim() : '';

  // Equivalents
  const rawEq = rawPayload.equivalents || {};
  clean.equivalents = {
    kannada: sanitizeString(rawEq.kannada, 200),
    tamil: sanitizeString(rawEq.tamil, 200),
    telugu: sanitizeString(rawEq.telugu, 200),
    tulu: sanitizeString(rawEq.tulu, 200),
    english: sanitizeString(rawEq.english, 200),
  };

  // Custom equivalent languages array
  clean.equivalent_languages = Array.isArray(rawPayload.equivalent_languages)
    ? rawPayload.equivalent_languages.map(el => ({
        language: sanitizeString(el.language, 100),
        translation: sanitizeString(el.translation, 200),
      })).filter(el => el.language.length > 0)
    : [];

  // Contributor details
  const rawContrib = rawPayload.contributor || {};
  clean.contributor = {
    name: sanitizeString(rawContrib.name, 100),
    email: sanitizeString(rawContrib.email, 150),
    receive_emails: Boolean(rawContrib.receive_emails)
  };

  // Structured meanings
  clean.meanings = Array.isArray(rawPayload.meanings)
    ? rawPayload.meanings.map((m, idx) => ({
        id: idx + 1,
        meaning: sanitizeString(m.meaning, 1000),
        context_usage: sanitizeString(m.context_usage, 1000)
      })).filter(m => m.meaning.length > 0)
    : [];

  // Structured proverbs
  clean.proverbs = Array.isArray(rawPayload.proverbs)
    ? rawPayload.proverbs.map((p, idx) => ({
        id: idx + 1,
        proverb: sanitizeString(p.proverb, 1000),
        context_usage: sanitizeString(p.context_usage, 1000)
      })).filter(p => p.proverb.length > 0)
    : [];

  // Images array (validate each for malware executable signatures)
  clean.images = [];
  if (Array.isArray(rawPayload.images)) {
    for (const img of rawPayload.images) {
      if (typeof img === 'string') {
        const validation = validateMediaContent(img);
        if (!validation.valid) {
          throw new Error(`Malicious image data rejected: ${validation.error}`);
        }
        clean.images.push(img);
      }
    }
  }

  // Audio pronunciation validation
  if (clean.pronunciation) {
    const validation = validateMediaContent(clean.pronunciation);
    if (!validation.valid) {
      throw new Error(`Malicious audio data rejected: ${validation.error}`);
    }
  }

  return clean;
}

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
  "example.com", "example.org", "example.net",
  "test.com", "test.org", "test.net", "testing.com",
  "dummy.com", "dummy.org", "dummy.net",
  "fake.com", "fakemail.com", "fakermail.com",
  "sample.com", "sample.org", "invalid.com", "none.com",
  "asdf.com", "qwerty.com", "123.com", "abc.com", "xyz.com", "user.com"
]);

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

function validateHighEndEmail(email) {
  if (!email || typeof email !== "string" || !email.trim()) {
    return { isValid: false, errorEn: "Email address is required." };
  }

  const clean = email.trim().toLowerCase();
  if (clean.length < 6 || clean.length > 254) {
    return { isValid: false, errorEn: "Email address must be between 6 and 254 characters." };
  }

  const rfcRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!rfcRegex.test(clean)) {
    return { isValid: false, errorEn: "Invalid email format. Please provide a valid email." };
  }

  const parts = clean.split("@");
  if (parts.length !== 2) {
    return { isValid: false, errorEn: "Malformed email structure." };
  }

  const [username, domain] = parts;
  if (username.length < 2 || username.length > 64) {
    return { isValid: false, errorEn: "Username portion must be between 2 and 64 characters." };
  }

  if (username.startsWith(".") || username.endsWith(".") || username.includes("..")) {
    return { isValid: false, errorEn: "Username contains invalid dot formatting." };
  }

  const domainParts = domain.split(".");
  if (domainParts.length < 2) {
    return { isValid: false, errorEn: "Domain must include a valid top-level domain." };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { isValid: false, errorEn: "Invalid top-level domain in email address." };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { isValid: false, errorEn: "Disposable or dummy email domains are rejected." };
  }

  for (const disp of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain.endsWith("." + disp)) {
      return { isValid: false, errorEn: "Disposable or dummy email subdomains are rejected." };
    }
  }

  const cleanUser = username.replace(/[^a-z0-9]/g, "");
  if (DUMMY_USERNAMES.has(cleanUser) || DUMMY_USERNAMES.has(username)) {
    return { isValid: false, errorEn: "Dummy or placeholder email usernames are rejected." };
  }

  if (/^(.)\1{3,}$/.test(cleanUser)) {
    return { isValid: false, errorEn: "Repetitive character email addresses are rejected." };
  }

  if (/^[0-9]+$/.test(cleanUser)) {
    return { isValid: false, errorEn: "Numeric-only usernames are not permitted." };
  }

  return { isValid: true };
}

module.exports = {
  computeSha256,
  computeHmacSignature,
  verifyHmacSignature,
  encryptAes256,
  decryptAes256,
  sanitizeString,
  validateMediaContent,
  sanitizeSuggestionPayload,
  validateHighEndEmail,
  hasSqlInjection,
  SECRET_KEY
};

