const express = require('express');
const router = express.Router();
const { 
  getMalayalamMasterList, 
  getWordDetails,
  getMalayalamSynonymsList,
  getRecentActivity,
  clearRecentActivity
} = require('../controllers/malayalam_wordscontroller');
const { getEnglishMasterList } = require('../controllers/dictionary_word');

// ലിസ്റ്റ് കാണിക്കുന്നതിനുള്ള റൂട്ടുകൾ
router.get('/words/browse', getEnglishMasterList);
router.get('/words/browse-malayalam', getMalayalamMasterList);
router.get('/words/browse-synonyms', getMalayalamSynonymsList);

// കാർഡിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ പൂർണ്ണവിവരങ്ങൾ കാണിക്കുന്നതിനുള്ള റൂട്ട്
router.get('/words/details/:id', getWordDetails);

// സമീപകാല വിവരങ്ങൾ കൈകാര്യം ചെയ്യാനുള്ള റൂട്ടുകൾ
router.get('/words/recent-activity', getRecentActivity);
router.post('/words/clear-recent-activity', clearRecentActivity);

module.exports = router;