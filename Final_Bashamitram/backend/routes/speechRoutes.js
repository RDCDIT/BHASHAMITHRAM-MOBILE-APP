/**
 * @file speechRoutes.js
 * @description Express API routes routing definitions for speechRoutes.
 */

const express = require("express");
const router = express.Router();
const { recognizeSpeech } = require("../controllers/speechController");

// POST /api/speech-to-text -> Handles transcribing base64 audio
router.post("/", recognizeSpeech);

module.exports = router;
