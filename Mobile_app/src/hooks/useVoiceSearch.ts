import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";

// Safely load expo-speech-recognition to prevent crashes in Expo Go
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = () => {};

try {
  const module = require("expo-speech-recognition");
  ExpoSpeechRecognitionModule = module.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = module.useSpeechRecognitionEvent;
} catch (error) {
  console.warn("expo-speech-recognition is not available in this environment:", error);
}

export function useVoiceSearch(onTranscript: (text: string) => void, lang: "en-US" | "ml-IN" = "ml-IN") {
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const webRecognizerRef = useRef<any>(null);

  const isNativeModuleAvailable = !!ExpoSpeechRecognitionModule;

  // 1. Setup Expo Native Listeners if available
  if (isNativeModuleAvailable) {
    try {
      useSpeechRecognitionEvent("start", () => {
        setIsListening(true);
        setPartialTranscript("");
      });
      
      useSpeechRecognitionEvent("end", () => {
        setIsListening(false);
      });
      
      useSpeechRecognitionEvent("result", (event: any) => {
        const transcript = event.results[0]?.transcript || "";
        setPartialTranscript(transcript);
        onTranscript(transcript);
      });

      useSpeechRecognitionEvent("error", (event: any) => {
        console.error("Speech recognition error:", event.error, event.message);
        setIsListening(false);
      });
    } catch (e) {
      console.warn("Failed to register speech event listeners:", e);
    }
  }

  // 2. Setup Web Speech API Fallback for Web browser environments
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

    // Expo Native Module
    if (isNativeModuleAvailable) {
      try {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (result.granted) {
          setPartialTranscript("");
          setIsListening(true);
          ExpoSpeechRecognitionModule.start({ lang });
        } else {
          alert("Microphone permission is required for voice search.");
        }
      } catch (error) {
        console.error("Failed to start native voice recognition:", error);
        setIsListening(false);
      }
      return;
    }

    // Native Fallback Alert for Expo Go
    alert(
      "Voice Search is not available in Expo Go.\n\nTo use voice search, please build a Development Client (npm run android/ios) or use the keyboard's built-in microphone."
    );
  };

  const stopListening = () => {
    if (Platform.OS === "web" && webRecognizerRef.current) {
      try {
        webRecognizerRef.current.stop();
      } catch (e) {
        console.error("Web Speech stop failed:", e);
      }
      setIsListening(false);
      return;
    }

    if (isNativeModuleAvailable) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (error) {
        console.error("Failed to stop native voice recognition:", error);
      }
      setIsListening(false);
      return;
    }

    setIsListening(false);
  };

  return {
    isListening,
    partialTranscript,
    startListening,
    stopListening,
  };
}
