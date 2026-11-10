/**
 * @file useVoiceSearch.ts
 * @description Advanced speech recognition hook for dictionary word search.
 * Uses native Android SpeechRecognizer (with automatic silence / break detection and auto-stop),
 * Web Speech API for browsers, and expo-audio recording as fallback.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Platform,
  NativeModules,
  DeviceEventEmitter,
  PermissionsAndroid,
} from "react-native";
import {
  useAudioRecorder,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";

const { SpeechRecognitionModule } = NativeModules;

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
].filter((value): value is string => Boolean(value));

const GOOGLE_SPEECH_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

/**
 * Cleans conversational speech patterns to extract dictionary search keywords.
 * For example:
 * "search for bhasha" -> "bhasha"
 * "meaning of pusthakam" -> "pusthakam"
 * "വാക്ക് മലയാളം" -> "മലയാളം"
 * "അമ്മ അർത്ഥം" -> "അമ്മ"
 */
export function cleanSearchKeyword(raw: string): string {
  if (!raw) return "";

  let text = raw.trim();

  // Strip trailing/leading punctuation
  text = text.replace(/^[.,!?;:'"“”‘’\s]+|[.,!?;:'"“”‘’\s]+$/g, "");

  // English conversational phrases
  const englishPrefixes = [
    /^search\s+(for\s+)?/i,
    /^find\s+(word\s+)?/i,
    /^meaning\s+(of\s+)?/i,
    /^what\s+is\s+(the\s+)?(meaning\s+of\s+)?/i,
    /^define\s+/i,
    /^definition\s+(of\s+)?/i,
  ];

  for (const regex of englishPrefixes) {
    text = text.replace(regex, "");
  }

  // Malayalam conversational phrases
  const malayalamPrefixes = [
    /^വാക്ക്\s+/i,
    /^അർത്ഥം\s+/i,
    /^കണ്ടെത്തുക\s+/i,
    /^തിരയുക\s+/i,
  ];

  for (const regex of malayalamPrefixes) {
    text = text.replace(regex, "");
  }

  const malayalamSuffixes = [
    /\s+വാക്ക്$/i,
    /\s+അർത്ഥം$/i,
    /\s+അർത്ഥം\s+എന്താണ്$/i,
    /\s+എന്താണ്$/i,
  ];

  for (const regex of malayalamSuffixes) {
    text = text.replace(regex, "");
  }

  return text.trim();
}

/**
 * Custom hook tracking voice states, managing native speech recognition, web APIs, or device recording.
 * Automatically stops when user pauses or finishes speaking.
 *
 * @param {(text: string) => void} onTranscript - Callback fired upon successfully receiving transcriptions.
 * @param {"en-IN" | "ml-IN" | "en-US"} initialLang - Default language (defaults to "ml-IN").
 */
export function useVoiceSearch(
  onTranscript: (text: string) => void,
  initialLang: "en-IN" | "ml-IN" | "en-US" = "ml-IN"
) {
  const [lang, setLang] = useState<"en-IN" | "ml-IN" | "en-US">(initialLang);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const webRecognizerRef = useRef<any>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  // 1. Setup Android Native Speech Recognition Event Listeners
  useEffect(() => {
    if (Platform.OS !== "android" || !SpeechRecognitionModule) return;

    const subStart = DeviceEventEmitter.addListener("onSpeechStart", () => {
      setIsListening(true);
      setIsProcessing(false);
      setError(null);
    });

    const subPartial = DeviceEventEmitter.addListener(
      "onSpeechPartialResults",
      (data: { transcript?: string }) => {
        const cleaned = cleanSearchKeyword(data?.transcript || "");
        if (cleaned) {
          setPartialTranscript(cleaned);
        }
      }
    );

    const subEnd = DeviceEventEmitter.addListener("onSpeechEnd", () => {
      // Auto-stop triggered by Android OS when silence/break in speech is detected
      setIsListening(false);
      setIsProcessing(true);
    });

    const subResults = DeviceEventEmitter.addListener(
      "onSpeechResults",
      (data: { transcript?: string }) => {
        setIsListening(false);
        setIsProcessing(false);
        const raw = data?.transcript || "";
        const cleaned = cleanSearchKeyword(raw);
        setPartialTranscript(cleaned);
        if (cleaned) {
          onTranscriptRef.current(cleaned);
        }
      }
    );

    const subError = DeviceEventEmitter.addListener(
      "onSpeechError",
      (data: { code?: number; message?: string }) => {
        setIsListening(false);
        setIsProcessing(false);
        // Error codes 6 (SPEECH_TIMEOUT) and 7 (NO_MATCH) occur when user doesn't say anything
        if (data?.code === 6 || data?.code === 7) {
          return;
        }
        if (data?.message) {
          console.warn("🎙️ [NativeSpeech] Recognition error:", data.message);
          setError(
            lang === "ml-IN"
              ? "ശബ്ദം തിരിച്ചറിയാൻ സാധിച്ചില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക."
              : "Could not recognize speech. Please try again."
          );
        }
      }
    );

    return () => {
      subStart.remove();
      subPartial.remove();
      subEnd.remove();
      subResults.remove();
      subError.remove();
      if (SpeechRecognitionModule.cancelListening) {
        SpeechRecognitionModule.cancelListening().catch(() => {});
      }
    };
  }, [lang]);

  // 2. Setup Web Speech API for Web / browser environments
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
          setIsProcessing(false);
          setError(null);
          setPartialTranscript("");
        };

        recognizer.onresult = (event: any) => {
          const raw = event.results[0]?.[0]?.transcript || "";
          const cleaned = cleanSearchKeyword(raw);
          setPartialTranscript(cleaned);
          if (event.results[0]?.isFinal) {
            setIsListening(false);
            setIsProcessing(false);
            if (cleaned) {
              onTranscriptRef.current(cleaned);
            }
          }
        };

        recognizer.onerror = (event: any) => {
          setIsListening(false);
          setIsProcessing(false);
          if (event.error === "network") {
            setError(
              lang === "ml-IN"
                ? "ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക."
                : "Check your internet connection."
            );
          } else if (event.error === "not-allowed") {
            setError(
              lang === "ml-IN"
                ? "മൈക്രോഫോൺ അനുമതി നൽകുക."
                : "Microphone permission denied."
            );
          } else if (event.error !== "no-speech") {
            setError(`Error: ${event.error}`);
          }
        };

        recognizer.onend = () => {
          setIsListening(false);
          setIsProcessing(false);
        };

        webRecognizerRef.current = recognizer;
      }
    }
  }, [lang]);

  /**
   * Starts speech recognition with automatic pause/break detection.
   */
  const startListening = async (overrideLang?: "en-IN" | "ml-IN" | "en-US") => {
    const targetLang = overrideLang || lang;
    setError(null);
    setPartialTranscript("");

    // A. Native Android SpeechRecognizer
    if (Platform.OS === "android" && SpeechRecognitionModule) {
      try {
        const alreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (!alreadyGranted) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: "Microphone Permission",
              message: "App requires microphone permission for voice search.",
              buttonPositive: "Allow",
            }
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setError(
              targetLang === "ml-IN"
                ? "ശബ്ദം റെക്കോർഡ് ചെയ്യാൻ മൈക്രോഫോൺ അനുമതി ആവശ്യമാണ്."
                : "Microphone permission is required."
            );
            return;
          }
        }

        setIsListening(true);
        setIsProcessing(false);
        await SpeechRecognitionModule.startListening(targetLang);
        return;
      } catch (e: any) {
        console.warn("🎙️ [NativeSpeech] Start failed, falling back to audio recorder:", e);
      }
    }

    // B. Web Speech API
    if (Platform.OS === "web" && webRecognizerRef.current) {
      try {
        webRecognizerRef.current.lang = targetLang;
        webRecognizerRef.current.start();
      } catch (e) {
        console.warn("Web Speech start failed:", e);
      }
      return;
    }

    // C. Native Recording via expo-audio (fallback if native speech module unavailable)
    try {
      const permission = await getRecordingPermissionsAsync();
      let granted = permission.granted;
      if (!granted) {
        const request = await requestRecordingPermissionsAsync();
        granted = request.granted;
      }
      if (!granted) {
        setError(
          targetLang === "ml-IN"
            ? "ശബ്ദം റെക്കോർഡ് ചെയ്യാൻ അനുമതി ആവശ്യമാണ്."
            : "Microphone permission is required."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setIsListening(true);
      setIsProcessing(false);

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error("🎙️ [VoiceSearch] Start recording failed:", err);
      setIsListening(false);
      setIsProcessing(false);
      setError("മൈക്രോഫോൺ ആരംഭിക്കാൻ സാധിച്ചില്ല.");
    }
  };

  /**
   * Stops listening.
   */
  const stopListening = async () => {
    // Android Native
    if (Platform.OS === "android" && SpeechRecognitionModule) {
      try {
        await SpeechRecognitionModule.stopListening();
      } catch {}
      setIsListening(false);
      return;
    }

    // Web Speech API
    if (Platform.OS === "web" && webRecognizerRef.current) {
      try {
        webRecognizerRef.current.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    // Fallback audio recorder
    const status = audioRecorder.getStatus();
    if (!status.isRecording) {
      setIsListening(false);
      return;
    }

    try {
      setIsListening(false);
      setIsProcessing(true);

      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) return;

      const fileResponse = await fetch(uri);
      const fileBlob = await fileResponse.blob();

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(",")[1];
          await transcribeAudio(base64Data);
        } catch {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(fileBlob);
    } catch {
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  /**
   * Cancels listening immediately without transcribing.
   */
  const cancelListening = async () => {
    if (Platform.OS === "android" && SpeechRecognitionModule) {
      try {
        await SpeechRecognitionModule.cancelListening();
      } catch {}
    } else if (Platform.OS === "web" && webRecognizerRef.current) {
      try {
        webRecognizerRef.current.abort();
      } catch {}
    }
    setIsListening(false);
    setIsProcessing(false);
    setPartialTranscript("");
  };

  /**
   * Fallback transcription for expo-audio.
   */
  const transcribeAudio = async (base64Audio: string) => {
    if (GOOGLE_SPEECH_KEY) {
      try {
        const googleUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_KEY}`;
        const resp = await fetch(googleUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config: {
              encoding: "ENCODING_UNSPECIFIED",
              languageCode: lang,
            },
            audio: { content: base64Audio },
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "";
          if (transcript) {
            const cleaned = cleanSearchKeyword(transcript);
            setPartialTranscript(cleaned);
            onTranscriptRef.current(cleaned);
            setIsProcessing(false);
            return;
          }
        }
      } catch {}
    }

    for (const apiBaseUrl of API_BASE_URLS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`${apiBaseUrl}/api/speech-to-text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            audioContent: base64Audio,
            languageCode: lang,
          }),
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data.transcript || "";
          if (text && !data.isMock) {
            const cleaned = cleanSearchKeyword(text);
            setPartialTranscript(cleaned);
            onTranscriptRef.current(cleaned);
            setIsProcessing(false);
            return;
          }
        }
      } catch {}
    }

    setIsProcessing(false);
    setError(
      lang === "ml-IN"
        ? "ശബ്ദം തിരിച്ചറിയാൻ സാധിച്ചില്ല. വീണ്ടും ശ്രമിക്കുക."
        : "Speech could not be recognized. Please try again."
    );
  };

  const resetVoice = useCallback(() => {
    setIsListening(false);
    setIsProcessing(false);
    setPartialTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    isProcessing,
    partialTranscript,
    error,
    lang,
    setLang,
    startListening,
    stopListening,
    cancelListening,
    resetVoice,
  };
}
