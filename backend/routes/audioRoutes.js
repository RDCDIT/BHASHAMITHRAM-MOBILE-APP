/**
 * @file audioRoutes.js
 * @description Express API routes routing definitions for audioRoutes.
 */

const express = require('express');
const router = express.Router();
const { getPronunciationWithFallback } = require('../controllers/gttsFallbackController');

// Map the GET request directly to the pronunciation logic
router.get('/', getPronunciationWithFallback);

module.exports = router;