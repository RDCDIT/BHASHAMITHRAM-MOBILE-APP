const gTTS = require('gtts');

// @desc    Generate audio pronunciation stream for a given word
// @route   GET /api/pronounce
// @access  Public
const pronounceWord = async (req, res) => {
  try {
    const { word, lang } = req.query;

    // 1. Validation check
    if (!word || word.trim() === '') {
      return res.status(400).json({ message: 'Missing "word" parameter in the query string.' });
    }

    // 2. Set language fallback ('ml' for Malayalam, 'en' for English)
    const targetLang = lang === 'en' ? 'en' : 'ml';

    // 3. Initialize the Google Text-to-Speech stream wrapper
    const gtts = new gTTS(word.trim(), targetLang);

    // 4. Set appropriate media headers so the app/browser plays it smoothly
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(word)}.mp3"`);

    // 5. Stream the binary audio blocks straight back into the client response buffer
    gtts.stream().pipe(res);

  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to generate speech audio stream.', 
      error: error.message 
    });
  }
};

module.exports = { pronounceWord };