import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000",
  "http://192.168.1.2:5000",
].filter((value): value is string => Boolean(value));

export function useVoiceSearch(onTranscript: (text: string) => void, lang: "en-US" | "ml-IN" = "ml-IN") {
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const webRecognizerRef = useRef<any>(null);
  const recordingRef = useRef<any>(null);

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
          console.error("Web Speech error:", event.error);
          setIsListening(false);
        };

        recognizer.onend = () => {
          setIsListening(false);
        };

        webRecognizerRef.current = recognizer;
      }
    }
  }, [lang]);

  const startListening = async () => {
    // Web Speech API
    if (Platform.OS === "web" && webRecognizerRef.current) {
      try {
        webRecognizerRef.current.start();
      } catch (e) {
        console.error("Web Speech start failed:", e);
      }
      return;
    }

    // Expo Go / Mobile native fallback: Record audio using expo-av and send to backend
    try {
      // Dynamically require expo-av to prevent SSR/Metro compilation issues
      const { Audio } = require("expo-av");

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert("Microphone permission is required for voice search.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setPartialTranscript("Recording...");
      setIsListening(true);

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      console.log("🎙️ [VoiceSearch] Audio recording started.");

    } catch (error) {
      console.error("🎙️ [VoiceSearch] Failed to start native recording:", error);
      setIsListening(false);
      setPartialTranscript("");
      alert("🎙️ Failed to start voice recording.");
    }
  };

  const stopListening = async () => {
    // Web Speech API
    if (Platform.OS === "web" && webRecognizerRef.current) {
      try {
        webRecognizerRef.current.stop();
      } catch (e) {
        console.error("Web Speech stop failed:", e);
      }
      setIsListening(false);
      return;
    }

    // Mobile Speech API via backend
    if (!recordingRef.current) {
      setIsListening(false);
      return;
    }

    try {
      const recording = recordingRef.current;
      recordingRef.current = null;

      console.log("🎙️ [VoiceSearch] Stopping recording...");
      setPartialTranscript("Processing speech...");

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
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
