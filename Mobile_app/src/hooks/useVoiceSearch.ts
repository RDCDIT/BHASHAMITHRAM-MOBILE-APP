/**
 * @file useVoiceSearch.ts
 * @description Hook managing speech transcription using either HTML5 Speech Recognition (Web)
 * or expo-audio recorder with backend speech-to-text API calls (Native).
 */

import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { 
  useAudioRecorder, 
  RecordingPresets, 
  getRecordingPermissionsAsync, 
  requestRecordingPermissionsAsync,
  setAudioModeAsync 
} from "expo-audio";

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
].filter((value): value is string => Boolean(value));


/**
 * Custom hook tracking voice states, managing web APIs or device recording to produce transcriptions.
 * 
 * @param {(text: string) => void} onTranscript - Callback fired upon successfully receiving transcriptions.
 * @param {"en-US" | "ml-IN"} lang - Locale language constraint.
 * @returns {Object} Listening states, partial transcript, and start/stop controls.
 */
export function useVoiceSearch(onTranscript: (text: string) => void, lang: "en-US" | "ml-IN" = "ml-IN") {
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const webRecognizerRef = useRef<any>(null);

  // Initialize the expo-audio recorder hook (always called, unconditionally)
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // 1. Setup Web Speech API Fallback for Web browser environments
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = false;
        recognizer.interimResults = true;
        recognizer.lang = lang;

        recognizer.onstart = () => {
          setIsListening(true);
          setPartialTranscript("");
        };

        recognizer.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript || "";
          setPartialTranscript(transcript);
          onTranscript(transcript);
        };

        recognizer.onerror = (event: any) => {
          console.warn("Web Speech error:", event.error);
          setIsListening(false);
          if (event.error === "network") {
            alert("Network error: Speech recognition requires an active internet connection. Some browsers may block recognition requests or require a secure context (HTTPS).");
          } else if (event.error === "not-allowed") {
            alert("Microphone permission was denied.");
          } else if (event.error !== "no-speech") {
            alert(`Voice search error: ${event.error}`);
          }
        };

        recognizer.onend = () => {
          setIsListening(false);
        };

        webRecognizerRef.current = recognizer;
      }
    }
  }, [lang]);

  /**
 * Triggers speech recognition permissions check and starts audio captures or listeners.
 */
  const startListening = async () => {
    // Web Speech API
    if (Platform.OS === "web" && webRecognizerRef.current) {
      try {
        webRecognizerRef.current.start();
      } catch (e) {
        console.warn("Web Speech start failed:", e);
      }
      return;
    }

    // Expo Go / Mobile native: Record audio using expo-audio and send to backend
    try {
      const permission = await getRecordingPermissionsAsync();
      let granted = permission.granted;
      if (!granted) {
        const request = await requestRecordingPermissionsAsync();
        granted = request.granted;
      }
      if (!granted) {
        alert("Microphone permission is required for voice search.");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setPartialTranscript("Recording...");
      setIsListening(true);

      console.log("🎙️ [VoiceSearch] Audio recording starting...");
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      console.log("🎙️ [VoiceSearch] Audio recording started.");

    } catch (error) {
      console.error("🎙️ [VoiceSearch] Failed to start native recording:", error);
      setIsListening(false);
      setPartialTranscript("");
      alert("🎙️ Failed to start voice recording.");
    }
  };

  /**
 * Stops ongoing voice captures and dispatches recorded bytes to transcribe services.
 */
  const stopListening = async () => {
    // Web Speech API
    if (Platform.OS === "web" && webRecognizerRef.current) {
      try {
        webRecognizerRef.current.stop();
      } catch (e) {
        console.warn("Web Speech stop failed:", e);
      }
      setIsListening(false);
      return;
    }

    // Mobile Speech API via backend
    const status = audioRecorder.getStatus();
    if (!status.isRecording) {
      setIsListening(false);
      return;
    }

    try {
      console.log("🎙️ [VoiceSearch] Stopping recording...");
      setPartialTranscript("Processing speech...");

      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      
      if (!uri) {
        throw new Error("No recording URI found.");
      }

      // Convert the local file URI to a blob and then to base64
      const fileResponse = await fetch(uri);
      const fileBlob = await fileResponse.blob();

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(",")[1];
          await transcribeAudio(base64Data);
        } catch (err) {
          console.error("🎙️ [VoiceSearch] Failed to process base64 conversion:", err);
          setPartialTranscript("");
          setIsListening(false);
        }
      };
      reader.readAsDataURL(fileBlob);

    } catch (error) {
      console.error("🎙️ [VoiceSearch] Failed to stop recording and transcribe:", error);
      setPartialTranscript("");
      setIsListening(false);
      alert("🎙️ Voice search failed. Please try again.");
    }
  };

  /**
 * Sends base64-encoded audio bytes to speech-to-text API endpoints.
 * 
 * @param {string} base64Audio - Binary audio chunk.
 */
  const transcribeAudio = async (base64Audio: string) => {
    let lastError: unknown = null;

    for (const apiBaseUrl of API_BASE_URLS) {
      try {
        console.log(`🎙️ [VoiceSearch] Sending audio to backend: ${apiBaseUrl}/api/speech-to-text`);
        
        const response = await fetch(`${apiBaseUrl}/api/speech-to-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audioContent: base64Audio,
            languageCode: lang,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        const text = data.transcript || "";
        console.log(`🎙️ [VoiceSearch] Transcription result: "${text}"`);

        setPartialTranscript(text);
        onTranscript(text);
        setIsListening(false);
        return; // Success!

      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("Failed to reach transcription servers.");
  };

  return {
    isListening,
    partialTranscript,
    startListening,
    stopListening,
  };
}
