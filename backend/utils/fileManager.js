const path = require('path');
const fs = require('fs');

/**
 * Sanitizes input word to generate a clean, safe filename.
 * Supports English and Malayalam script characters.
 */
const sanitizeFilename = (word) => {
  if (!word) return 'unnamed';
  return word
    .toLowerCase()
    .trim()
    // Keep English alphabets, numbers, spaces, dashes, and Malayalam script characters
    .replace(/[^a-z0-9\u0d00-\u0d7f\s-]/g, '')
    // Replace all spaces with a single dash
    .replace(/\s+/g, '-')
    // Clean up duplicate dashes
    .replace(/-+/g, '-');
};

/**
 * Checks and creates directory structure recursively if not already present.
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

module.exports = {
  sanitizeFilename,
  ensureDirectoryExists
};
