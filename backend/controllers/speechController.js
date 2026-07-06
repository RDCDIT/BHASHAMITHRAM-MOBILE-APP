/**
 * @file speechController.js
 * @description Express controller actions handling operations for speechController.
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_SPEECH_API_KEY;

/**
 * Handles speech-to-text recognition requests by forwarding base64 audio to Google Cloud Speech API
 * POST /api/speech-to-text
 */
/**
 * Sends speech audio payload to Google Speech API or returns mock transcribed text if API key is not present.
 * 
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 */
const recognizeSpeech = async (req, res) => {
  try {
    const { audioContent, languageCode } = req.body;

    if (!audioContent) {
      return res.status(400).json({ message: "Missing audioContent (base64 string) in request body." });
    }

    const lang = languageCode || "ml-IN"; // Default to Malayalam

    // If no API key is configured, run in mock mode for local testing
    if (!GOOGLE_API_KEY) {
      console.warn("⚠️ [Speech-to-Text] GOOGLE_API_KEY is not defined in .env. Running in MOCK mode.");
      
      // Simulating transcription results based on lang
      const mockText = lang.startsWith("ml") ? "അമ്മ" : "Hello";
      
      return res.status(200).json({
        transcript: mockText,
        isMock: true,
        message: "Google Speech-to-Text key is missing. Returning mock transcription."
      });
    }

    const googleEndpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`;

    const requestBody = {
      config: {
        encoding: "ENCODING_UNSPECIFIED", // Google will automatically detect the encoding and sample rate (works for .m4a/aac)
        languageCode: lang,
      },
      audio: {
        content: audioContent,
      },
    };

    console.log(`📡 [Speech-to-Text] Forwarding request to Google API (Language: ${lang})...`);
    
    const response = await fetch(googleEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Speech API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log("✅ [Speech-to-Text] Google Speech API response received.");

    // Extract the transcript from Google's response structure
    const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "";

    return res.status(200).json({
      transcript: transcript.trim(),
      isMock: false
    });

  } catch (error) {
    console.error("🚨 [Speech-to-Text Error]:", error);
    return res.status(500).json({
      message: "Failed to transcribe audio.",
      error: error.message,
    });
  }
};

module.exports = { recognizeSpeech };
