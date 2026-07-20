/**
 * @file malayalam_synonym.js
 * @description Express API routes routing definitions for malayalam_synonym.
 */

const express = require('express');
const router = express.Router();
const {
  getSynonyms,
  getSynonymById,
  createSynonym,
  updateSynonym,
  deleteSynonym
} = require('../controllers/malayalam_synonym_controller');

// Routes mapping for /api/synonyms
router.route('/')
  .get(getSynonyms)       // Fetch all or search through synonym entries
  .post(createSynonym);   // Add a new word mapping

// Routes mapping for /api/synonyms/:id
router.route('/:id')
  .get(getSynonymById)    // Fetch single entry
  .put(updateSynonym)     // Update specific fields or append synonyms
  .delete(deleteSynonym); // Delete mapping entry

module.exports = router;