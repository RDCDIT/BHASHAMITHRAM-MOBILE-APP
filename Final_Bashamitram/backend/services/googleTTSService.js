const fs = require('fs');

/**
 * Detects if the given text contains Malayalam script characters.
 */
const isMalayalam = (text) => {
  return /[\u0d00-\u0d7f]/.test(text);
};

/**
 * Generates an MP3 pronunciation file from text using Google's translation TTS endpoint.
 * Bypasses npm library limitations to fully support Malayalam ('ml') and English ('en').
 * 
 * @param {string} text The word to pronounce.
 * @param {string} outputPath The absolute file system destination path.
 */
const generatePronunciation = async (text, outputPath) => {
  const lang = isMalayalam(text) ? 'ml' : 'en';
  
  // Standard public Google Translate TTS URL
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google TTS request failed with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save audio file to disk
    fs.writeFileSync(outputPath, buffer);

    return {
      language: lang,
      filePath: outputPath
    };
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    throw fetchErr;
  }
};

module.exports = {
  generatePronunciation,
  isMalayalam
};
