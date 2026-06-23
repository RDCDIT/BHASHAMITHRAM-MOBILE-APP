const express = require('express');
const router = express.Router();
const { pronounceWord } = require('../controllers/audiocontroller');

// Map the GET request directly to the pronunciation logic
router.get('/', pronounceWord);

module.exports = router;