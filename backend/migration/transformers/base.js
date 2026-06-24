const mongoose = require('mongoose');

class BaseTransformer {
  /**
   * Parse a JSON string safely, falling back to a default value.
   * Useful when SQLite stores nested data (like meanings/proverbs) as JSON text.
   */
  static parseJson(val, defaultVal = []) {
    if (!val) return defaultVal;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return defaultVal;
    }
  }

  /**
   * Converts a comma-separated list of strings into a trimmed array.
   */
  static stringToArray(val, separator = ',') {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(separator).map(s => s.trim()).filter(Boolean);
  }

  /**
   * Safe casting of values to Boolean.
   */
  static toBoolean(val) {
    if (val === undefined || val === null) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val !== 0;
    const str = String(val).toLowerCase().trim();
    return str === 'true' || str === '1' || str === 'yes';
  }

  /**
   * Generate a reproducible MongoDB ObjectId from a numeric ID.
   * This is useful for preserving SQLite primary/foreign keys in MongoDB references.
   */
  static toObjectId(id) {
    if (!id) return null;
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
      }
      // SQLite numeric IDs can be converted to 24-char hex strings
      const hex = String(id).padStart(24, '0').slice(-24);
      return new mongoose.Types.ObjectId(hex);
    } catch (e) {
      return null;
    }
  }
}

module.exports = BaseTransformer;
