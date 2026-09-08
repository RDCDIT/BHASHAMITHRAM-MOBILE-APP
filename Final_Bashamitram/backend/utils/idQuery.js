/**
 * @file idQuery.js
 * @description Shared helper to build tolerant _id queries for mixed-type collections.
 *
 * The dictionary collections contain a mix of _id types:
 *   - Numeric ids  (rows imported from MySQL migration, e.g. 153698)
 *   - ObjectId ids (rows inserted directly via JSON upload)
 *
 * Using $or with separate clauses prevents Mongoose from cross-casting
 * a number to ObjectId or vice-versa, which caused recurring
 * "Cast to ObjectId failed for value X (type number)" errors.
 */

const mongoose = require('mongoose');

/**
 * Builds a Mongo filter that matches a document regardless of its _id type.
 * Uses $or so each branch is cast independently — a numeric branch never
 * tries to cast to ObjectId and an ObjectId branch is only added when the
 * string is a valid 24-char hex.
 *
 * @param {string|number} rawId - The id as received from the route/query.
 * @returns {Object|null} A filter object, or null when the id is empty/invalid.
 */
const idQuery = (rawId) => {
  const asString = String(rawId ?? '').trim();
  if (asString === '') return null;

  const conditions = [];

  // Numeric branch — for MySQL-migrated rows with integer _id
  const asNumber = Number(asString);
  if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
    conditions.push({ _id: asNumber });
  }

  // ObjectId branch — only when the string is a valid 24-char hex ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(asString)) {
    try {
      conditions.push({ _id: new mongoose.Types.ObjectId(asString) });
    } catch (_) {
      // invalid ObjectId — skip
    }
  }

  // String fallback — for string ids stored verbatim (neither number nor ObjectId)
  // Only add if not already covered by the numeric branch to avoid duplicates
  if (Number.isNaN(asNumber) || !Number.isFinite(asNumber)) {
    conditions.push({ _id: asString });
  }

  if (conditions.length === 0) return null;
  if (conditions.length === 1) return conditions[0];
  return { $or: conditions };
};

module.exports = { idQuery };
