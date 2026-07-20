/**
 * @file malayalam_english.js
 * @description Express API routes routing definitions for malayalam_english.
 */

const express = require('express');
const router = express.Router();
const {
  getWords,
  getWordById,
  browseMalayalamWords,
  createWord,
  updateWord,
  deleteWord
} = require('../controllers/malayalam_english_controllers.js');

// Routes mapping for /api/dictionary/browse-malayalam
router.get('/browse-malayalam', browseMalayalamWords);

// Routes mapping for /api/dictionary
router.route('/')
  .get(getWords)       // Search & List entries
  .post(createWord);   // Create entry

// Routes mapping for /api/dictionary/:id
router.route('/:id')
  .get(getWordById)    // View specific entry
  .put(updateWord)     // Edit specific entry
  .delete(deleteWord); // Delete specific entry

module.exports = router;