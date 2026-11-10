/**
 * @file speechService.ts
 * @description Comprehensive, multi-tiered text-to-speech and audio pronunciation service 
 * for Malayalam and English vocabulary.
 * 
 * Works seamlessly across Android, iOS, and Web:
 * 1. Web: High-fidelity Google TTS audio via HTML5 Audio with SpeechSynthesis fallback.
 * 2. Native Mobile: High-quality Google TTS audio via expo-audio with playsInSilentMode enabled,
 *    backed by native on-device expo-speech synthesis (Malayalam voice detection on Android, 
 *    offline English on iOS/Android).
 */

import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

// Safely attempt to load expo-audio
let expoAudioModule: any = null;
let createAudioPlayerFn: any = null;
let setAudioModeFn: any = null;

try {
  expoAudioModule = require('expo-audio');
  createAudioPlayerFn = expoAudioModule.createAudioPlayer;
  setAudioModeFn = expoAudioModule.setAudioModeAsync;

  // Ensure audio plays even if the device (especially iPhone) is in Silent / Mute mode
  if (typeof setAudioModeFn === 'function') {
    setAudioModeFn({ playsInSilentMode: true }).catch(() => {});
  }
} catch (e) {
  // expo-audio native module might not be linked in certain runtimes
  expoAudioModule = null;
  createAudioPlayerFn = null;
}

export type SupportedLang = 'ml' | 'en';

type SpeechListener = (activeWord: string | null, isSpeaking: boolean) => void;

class SpeechService {
  private currentWord: string | null = null;
  private isSpeaking: boolean = false;
  private listeners: Set<SpeechListener> = new Set();

  // Active audio player references for interruption / cleanup
  private currentNativePlayer: any = null;
  private currentWebAudio: any = null;
  private nativePlayerUnsub: (() => void) | null = null;

  // Cached voice detection
  private cachedMlVoiceId: string | undefined = undefined;
  private voicesChecked: boolean = false;

  constructor() {
    this.initAudioMode();
  }

  private async initAudioMode() {
    try {
      if (setAudioModeFn) {
        await setAudioModeFn({ playsInSilentMode: true });
      }
    } catch (e) {
      // Ignore background init failure
    }
  }

  /**
   * Subscribe to global speech state changes.
   */
  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(word: string | null, speaking: boolean) {
    this.currentWord = word;
    this.isSpeaking = speaking;
    this.listeners.forEach((listener) => {
      try {
        listener(word, speaking);
      } catch (err) {
        console.warn("SpeechService listener error:", err);
      }
    });
  }

  /**
   * Cleans a raw vocabulary string by stripping part-of-speech tags,
   * parentheses, brackets, phonetics, and special characters.
   */
  public cleanWord(rawWord: string): string {
    if (!rawWord || typeof rawWord !== 'string') return '';

    return rawWord
      // Strip parenthetical notes like (noun), (ക്രിയ), (വിശേഷണം)
      .replace(/\(.*?\)/g, '')
      // Strip brackets [kiranamaalika]
      .replace(/\[.*?\]/g, '')
      .replace(/\{.*?\}/g, '')
      // Strip bullet points, dashes, numbers at start
      .replace(/^[\d\s.\-•]+/, '')
      // Strip non-letter punctuation except spaces
      .replace(/[,;:"'?!\\/<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Determines if text contains Malayalam Unicode characters.
   */
  public isMalayalamText(text: string): boolean {
    return /[\u0D00-\u0D7F]/.test(text);
  }

  /**
   * Detects the target language: 'ml' if Malayalam characters present, else 'en'.
   */
  public detectLanguage(text: string, preferredLang?: SupportedLang): SupportedLang {
    if (this.isMalayalamText(text)) {
      return 'ml';
    }
    if (preferredLang === 'ml' && !/[a-zA-Z]/.test(text)) {
      return 'ml';
    }
    return 'en';
  }

  /**
   * Builds the Google Translate TTS MP3 stream URL for high-quality pronunciation.
   */
  public getTtsUrl(cleanText: string, lang: SupportedLang): string {
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${lang}&client=tw-ob`;
  }

  /**
   * Queries native speech synthesis voices to locate Malayalam voice if installed.
   */
  private async getMalayalamVoiceIdentifier(): Promise<string | undefined> {
    if (this.voicesChecked) return this.cachedMlVoiceId;

    try {
      if (Speech && typeof Speech.getAvailableVoicesAsync === 'function') {
        const voices = await Speech.getAvailableVoicesAsync();
        const found = voices.find((v) => {
          const l = (v.language || '').toLowerCase().replace('_', '-');
          const n = (v.name || '').toLowerCase();
          const id = (v.identifier || '').toLowerCase();
          return (
            l === 'ml' ||
            l.startsWith('ml-') ||
            n.includes('malayalam') ||
            id.includes('malayalam') ||
            id.startsWith('ml-')
          );
        });
        if (found) {
          this.cachedMlVoiceId = found.identifier;
        }
      }
    } catch (err) {
      console.warn("Could not query available voices:", err);
    } finally {
      this.voicesChecked = true;
    }
    return this.cachedMlVoiceId;
  }

  /**
   * Stops all ongoing audio and speech synthesis immediately.
   */
  public async stop(): Promise<void> {
    // 1. Stop native expo-audio player
    if (this.currentNativePlayer) {
      try {
        if (this.nativePlayerUnsub) {
          this.nativePlayerUnsub();
          this.nativePlayerUnsub = null;
        }
        if (typeof this.currentNativePlayer.pause === 'function') {
          this.currentNativePlayer.pause();
        }
      } catch (err) {
        // player might already be stopped
      }
      this.currentNativePlayer = null;
    }

    // 2. Stop Web Audio element
    if (this.currentWebAudio) {
      try {
        this.currentWebAudio.pause();
        this.currentWebAudio.currentTime = 0;
      } catch (err) {}
      this.currentWebAudio = null;
    }

    // 3. Stop native expo-speech
    try {
      if (Speech && typeof Speech.stop === 'function') {
        await Speech.stop();
      }
    } catch (err) {}

    // 4. Stop web window.speechSynthesis
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {}
    }

    this.notify(null, false);
  }

  /**
   * Primary entry point to play pronunciation of a word.
   * If the word is already speaking, toggles it off.
   * If another word was speaking, interrupts it cleanly and starts the new word.
   */
  public async speak(
    rawWord: string,
    preferredLang?: SupportedLang,
    callbacks?: {
      onStart?: () => void;
      onDone?: () => void;
      onError?: (error: any) => void;
    }
  ): Promise<void> {
    const cleaned = this.cleanWord(rawWord);
    if (!cleaned) {
      callbacks?.onDone?.();
      return;
    }

    // If currently speaking this exact word, tapping stops it
    if (this.isSpeaking && this.currentWord === cleaned) {
      await this.stop();
      callbacks?.onDone?.();
      return;
    }

    // Stop whatever was playing previously
    await this.stop();

    const lang = this.detectLanguage(cleaned, preferredLang);
    this.notify(cleaned, true);
    callbacks?.onStart?.();

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      this.notify(null, false);
      callbacks?.onDone?.();
    };

    const fail = (err: any) => {
      if (finished) return;
      finished = true;
      this.notify(null, false);
      callbacks?.onError?.(err);
      callbacks?.onDone?.();
    };

    // Platform-specific playback flow
    if (Platform.OS === 'web') {
      this.playOnWeb(cleaned, lang, finish, fail);
    } else {
      this.playOnNative(cleaned, lang, finish, fail);
    }
  }

  /**
   * Web browser pronunciation handling
   */
  private playOnWeb(
    text: string,
    lang: SupportedLang,
    onDone: () => void,
    onError: (err: any) => void
  ) {
    const ttsUrl = this.getTtsUrl(text, lang);

    try {
      const audio = new window.Audio(ttsUrl);
      this.currentWebAudio = audio;

      audio.onended = () => {
        this.currentWebAudio = null;
        onDone();
      };

      audio.onerror = () => {
        this.currentWebAudio = null;
        // Fallback to Web Speech API
        this.fallbackWebSpeech(text, lang, onDone, onError);
      };

      audio.play().catch((playErr) => {
        console.warn("Web audio play blocked or failed, falling back to Web Speech:", playErr);
        this.currentWebAudio = null;
        this.fallbackWebSpeech(text, lang, onDone, onError);
      });
    } catch (err) {
      this.fallbackWebSpeech(text, lang, onDone, onError);
    }
  }

  private fallbackWebSpeech(
    text: string,
    lang: SupportedLang,
    onDone: () => void,
    onError: (err: any) => void
  ) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'ml' ? 'ml-IN' : 'en-US';
        utterance.rate = lang === 'ml' ? 0.85 : 0.95;

        utterance.onend = () => onDone();
        utterance.onerror = (e) => onError(e);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        onError(e);
      }
    } else {
      onError(new Error("No speech synthesis available on web"));
    }
  }

  /**
   * Native Mobile (iOS / Android) pronunciation handling
   */
  private async playOnNative(
    text: string,
    lang: SupportedLang,
    onDone: () => void,
    onError: (err: any) => void
  ) {
    // Ensure silent mode audio is enabled on iOS
    try {
      if (setAudioModeFn) {
        await setAudioModeFn({ playsInSilentMode: true });
      }
    } catch (e) {}

    // Priority 1: High Quality Google TTS Audio via expo-audio
    // Google TTS gives natural native pronunciation for Malayalam (which iOS natively lacks)
    // and crisp English pronunciation.
    if (createAudioPlayerFn) {
      try {
        const ttsUrl = this.getTtsUrl(text, lang);
        const player = createAudioPlayerFn({ uri: ttsUrl });

        if (player) {
          this.currentNativePlayer = player;

          let hasTriggeredEnd = false;
          const handleEnd = () => {
            if (hasTriggeredEnd) return;
            hasTriggeredEnd = true;
            if (this.nativePlayerUnsub) {
              this.nativePlayerUnsub();
              this.nativePlayerUnsub = null;
            }
            this.currentNativePlayer = null;
            onDone();
          };

          // Listen for status updates
          if (typeof player.addListener === 'function') {
            const sub = player.addListener('playbackStatusUpdate', (status: any) => {
              if (!status) return;

              // Audio reached completion
              if (
                status.didJustFinish ||
                (status.isLoaded &&
                  !status.playing &&
                  status.currentTime > 0 &&
                  status.currentTime >= (status.duration || 0.1))
              ) {
                handleEnd();
              }
            });

            this.nativePlayerUnsub = () => {
              if (sub && typeof sub.remove === 'function') {
                sub.remove();
              }
            };
          }

          // Safety timeout based on word length so UI never gets permanently stuck
          const maxPlayDurationMs = Math.max(3000, text.length * 350 + 2000);
          const timeout = setTimeout(() => {
            if (this.currentNativePlayer === player) {
              handleEnd();
            }
          }, maxPlayDurationMs);

          if (typeof player.play === 'function') {
            player.play();
            return;
          }
        }
      } catch (audioPlayerErr) {
        console.warn("expo-audio playback failed, transitioning to on-device Speech synthesis:", audioPlayerErr);
        this.currentNativePlayer = null;
      }
    }

    // Priority 2: On-device native expo-speech fallback
    this.fallbackNativeSpeech(text, lang, onDone, onError);
  }

  /**
   * On-device native TTS synthesis via expo-speech
   */
  private async fallbackNativeSpeech(
    text: string,
    lang: SupportedLang,
    onDone: () => void,
    onError: (err: any) => void
  ) {
    try {
      if (!Speech || typeof Speech.speak !== 'function') {
        onError(new Error("expo-speech module not available"));
        return;
      }

      const mlVoiceId = lang === 'ml' ? await this.getMalayalamVoiceIdentifier() : undefined;

      const options: Speech.SpeechOptions = {
        language: lang === 'ml' ? 'ml' : 'en-US',
        voice: mlVoiceId,
        rate: lang === 'ml' ? 0.85 : 0.95,
        pitch: 1.0,
        useApplicationAudioSession: false,
        onStart: () => {},
        onDone: () => onDone(),
        onStopped: () => onDone(),
        onError: (err) => {
          console.warn(`Local Speech synthesis error for "${text}":`, err);
          onError(err);
        },
      };

      Speech.speak(text, options);
    } catch (speechErr) {
      console.error("Local Speech synthesis invocation failed:", speechErr);
      onError(speechErr);
    }
  }

  /**
   * Returns whether a given word is currently playing.
   */
  public isWordPlaying(rawWord: string): boolean {
    const cleaned = this.cleanWord(rawWord);
    return this.isSpeaking && this.currentWord === cleaned;
  }
}

export const speechService = new SpeechService();
export default speechService;

