/**
 * @file pronunciationRoutes.js
 * @description Express API routes routing definitions for pronunciationRoutes.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPronunciation, uploadPronunciation } = require('../controllers/pronunciationController');
const { getPronunciationWithFallback } = require('../controllers/gttsFallbackController');

// Multer temporary uploads directory config
const tempUploadDir = path.join(__dirname, '../uploads');
const upload = multer({ dest: tempUploadDir });

// GET /api/pronunciation/fallback/gtts
router.get('/fallback/gtts', getPronunciationWithFallback);

// GET /api/pronunciation/:word
router.get('/:word', getPronunciation);

// POST /api/pronunciation/upload
router.post('/upload', upload.single('file'), uploadPronunciation);

module.exports = router;
