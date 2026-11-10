/**
 * @file DictionarySearchBar.tsx
 * @description Shared search bar for Malayalam & English dictionaries.
 *
 * Features:
 *  - Offline Manglish typing for Malayalam dictionaries (real-time conversion, space trigger, submit)
 *  - Clean language toggle button ("മ ON" / "OFF" - no Google branding)
 *  - Voice search with native Android silence/break auto-stop
 *  - Simple inline listening indicator ("കേൾക്കുന്നു..." / "Listening...") with no popup modals or manual stop button
 *  - Fully reusable across all 4 dictionaries (ml-ml, ml-en, ml-synonym, en-ml) via the `lang` prop
 */

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchGoogleMalayalamSuggestions,
  transliterateOffline,
} from "../utils/transliterator";
import { useVoiceSearch } from "../hooks/useVoiceSearch";
import { sanitizeHtmlTags } from "../utils/security";
import { useResponsive } from "../utils/responsive";

interface DictionarySearchBarProps {
  /** Current value shown in the input */
  value: string;
  /** Placeholder text */
  placeholder?: string;
  /** Language mode: "ml" for Malayalam dictionaries, "en" for English-Malayalam */
  lang?: "ml" | "en";
  /** Called whenever the search text changes */
  onChangeText: (text: string) => void;
  /** Called when search is submitted */
  onSubmit: () => void;
}

export default function DictionarySearchBar({
  value,
  placeholder,
  lang = "ml",
  onChangeText,
  onSubmit,
}: DictionarySearchBarProps) {
  const { searchBarHeight, isSmallPhone } = useResponsive();
  const [inputText, setInputText] = useState(value);
  const [manglishOn, setManglishOn] = useState(lang === "ml");

  // Candidate suggestions strip
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Timers for debounce auto-conversion and suggestions
  const autoConvertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pulse animation for mic button while listening
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Sync external value with local input
  useEffect(() => {
    setInputText(value);
  }, [value]);

  // Voice Search Hook
  const voiceLangCode = lang === "en" ? "en-IN" : "ml-IN";
  const {
    isListening,
    partialTranscript,
    error: voiceError,
    startListening,
    stopListening,
    cancelListening,
    resetVoice,
  } = useVoiceSearch((transcript: string) => {
    if (!transcript) return;

    let finalWord = transcript.trim();
    // If Malayalam dictionary and voice returned Latin letters, transliterate offline
    if (lang === "ml" && /[a-zA-Z]/.test(finalWord)) {
      finalWord = transliterateOffline(finalWord);
    }

    setInputText(finalWord);
    onChangeText(finalWord);
    setSuggestions([]);
    resetVoice();

    // Auto trigger search on speech completion
    setTimeout(() => {
      onSubmit();
    }, 100);
  }, voiceLangCode);

  // Pulse animation controller
  useEffect(() => {
    if (isListening) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.22,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening]);

  // Mic button press handler
  const handleMicPress = async () => {
    if (isListening) {
      await stopListening();
    } else {
      resetVoice();
      await startListening(voiceLangCode);
    }
  };

  // Helper to get trailing English word being typed
  const getActiveEnglishWord = (text: string): string => {
    if (text.endsWith(" ")) return "";
    const words = text.split(/\s+/);
    const lastWord = words[words.length - 1] || "";
    return /[a-zA-Z]/.test(lastWord) ? lastWord : "";
  };

  // Load suggestions
  const loadSuggestions = async (word: string) => {
    if (!word || !/[a-zA-Z]/.test(word)) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const candidates = await fetchGoogleMalayalamSuggestions(word, 4);
      setSuggestions(candidates);
    } catch {
      const offline = transliterateOffline(word);
      setSuggestions(offline ? [offline] : []);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Text change handler
  const handleTextChange = (rawText: string) => {
    const newText = sanitizeHtmlTags(rawText);
    // If English dictionary or Manglish is turned OFF: direct input
    if (lang === "en" || !manglishOn) {
      if (autoConvertTimerRef.current) clearTimeout(autoConvertTimerRef.current);
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
      setInputText(newText);
      onChangeText(newText);
      setSuggestions([]);
      return;
    }

    // Empty input
    if (newText === "") {
      if (autoConvertTimerRef.current) clearTimeout(autoConvertTimerRef.current);
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
      setInputText("");
      onChangeText("");
      setSuggestions([]);
      return;
    }

    // Space-triggered instant offline transliteration (e.g. "amma " -> "അമ്മ ")
    if (newText.endsWith(" ") && !inputText.endsWith(" ")) {
      if (autoConvertTimerRef.current) clearTimeout(autoConvertTimerRef.current);
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);

      const words = newText.trimEnd().split(/\s+/);
      const lastWord = words[words.length - 1];

      if (lastWord && /[a-zA-Z]/.test(lastWord)) {
        const convertedWord = transliterateOffline(lastWord);
        words[words.length - 1] = convertedWord;
        const fullConverted = words.join(" ") + " ";
        setInputText(fullConverted);
        onChangeText(fullConverted);
        setSuggestions([]);
        return;
      }
    }

    setInputText(newText);

    // Check active English word being typed
    const activeWord = getActiveEnglishWord(newText);
    if (activeWord) {
      // Debounce suggestions fetch
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
      suggestionTimerRef.current = setTimeout(() => {
        void loadSuggestions(activeWord);
      }, 150);

      // Debounce automatic offline word conversion in search bar (400ms pause)
      if (autoConvertTimerRef.current) clearTimeout(autoConvertTimerRef.current);
      autoConvertTimerRef.current = setTimeout(() => {
        const converted = transliterateOffline(activeWord);
        const words = newText.split(/\s+/);
        words[words.length - 1] = converted;
        const fullConverted = words.join(" ");
        setInputText(fullConverted);
        onChangeText(fullConverted);
        setSuggestions([]);
      }, 400);
    } else {
      if (autoConvertTimerRef.current) clearTimeout(autoConvertTimerRef.current);
      if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
      setSuggestions([]);
      onChangeText(newText);
    }
  };

  // User taps candidate suggestion chip
  const handleSelectSuggestion = (candidate: string) => {
    if (autoConvertTimerRef.current) clearTimeout(autoConvertTimerRef.current);
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);

    const words = inputText.split(/\s+/);
    words[words.length - 1] = candidate;
    const result = words.join(" ");
    setInputText(result);
    onChangeText(result);
    setSuggestions([]);
  };

  // Clear input
  const handleClear = () => {
    if (autoConvertTimerRef.current) clearTimeout(autoConvertTimerRef.current);
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    setInputText("");
    setSuggestions([]);
    onChangeText("");
    resetVoice();
  };

  // Submit search: ensure any remaining English text is converted
  const handleSubmit = () => {
    if (autoConvertTimerRef.current) clearTimeout(autoConvertTimerRef.current);
    if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current);
    setSuggestions([]);

    let queryToSubmit = inputText;
    if (lang === "ml" && manglishOn && /[a-zA-Z]/.test(inputText)) {
      queryToSubmit = transliterateOffline(inputText);
      setInputText(queryToSubmit);
      onChangeText(queryToSubmit);
    }
    onSubmit();
  };

  const defaultPlaceholder =
    lang === "en"
      ? "Explore words..."
      : manglishOn
      ? "Manglish (amma → അമ്മ)..."
      : "വാക്ക് നൽകുക...";

  const displayPlaceholder = placeholder || defaultPlaceholder;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { height: searchBarHeight, borderRadius: Math.round(searchBarHeight / 2) }, isListening && styles.containerListening]}>
        {/* ── Language / Manglish toggle pill (Only for Malayalam dictionaries) ── */}
        {lang === "ml" ? (
          <TouchableOpacity
            style={[styles.manglishBtn, manglishOn && styles.manglishBtnActive]}
            onPress={() => {
              setManglishOn(!manglishOn);
              setSuggestions([]);
            }}
            activeOpacity={0.75}
            accessibilityLabel={manglishOn ? "Manglish typing ON" : "Malayalam typing only"}
          >
            <Text style={[styles.manglishLabel, manglishOn && styles.manglishLabelActive]}>
              മ
            </Text>
            <Text style={[styles.manglishSub, manglishOn && styles.manglishSubActive]}>
              {manglishOn ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* ── Text Input / Inline Voice Indicator ── */}
        <TextInput
          style={[styles.input, isListening && styles.inputListening]}
          placeholder={
            isListening
              ? lang === "en"
                ? "Listening... speak now"
                : "കേൾക്കുന്നു... പറയൂ"
              : displayPlaceholder
          }
          placeholderTextColor={isListening ? "#DC2626" : "#898683"}
          value={isListening && partialTranscript ? partialTranscript : inputText}
          onChangeText={handleTextChange}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSubmit}
          editable={!isListening}
        />

        {/* ── Clear button ── */}
        {inputText.length > 0 && !isListening ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            activeOpacity={0.7}
            accessibilityLabel="Clear text"
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}

        {/* ── Voice search mic button (Simple inline, auto-stop on silence) ── */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micBtnActive]}
            onPress={handleMicPress}
            activeOpacity={0.8}
            accessibilityLabel={isListening ? "Listening... tap to cancel" : "Voice search"}
          >
            <Ionicons
              name={isListening ? "mic" : "mic-outline"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Search submit button ── */}
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSubmit}
          activeOpacity={0.8}
          accessibilityLabel="Search"
        >
          <Ionicons name="search" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Inline Voice Error indicator if any ── */}
      {voiceError ? (
        <View style={styles.inlineErrorRow}>
          <Ionicons name="alert-circle" size={14} color="#DC2626" />
          <Text style={styles.inlineErrorText}>{voiceError}</Text>
        </View>
      ) : null}

      {/* ── Candidate suggestions strip ── */}
      {lang === "ml" && manglishOn && suggestions.length > 0 ? (
        <View style={styles.suggestionContainer}>
          <View style={styles.suggestionList}>
            {suggestions.map((item, idx) => (
              <TouchableOpacity
                key={`${item}-${idx}`}
                style={[
                  styles.suggestionChip,
                  idx === 0 && styles.firstSuggestionChip,
                ]}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    idx === 0 && styles.firstSuggestionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {loadingSuggestions ? (
            <ActivityIndicator size="small" color="#2B2C51" style={{ marginLeft: 4 }} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EAE6DF",
    paddingLeft: 6,
    paddingRight: 4,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  containerListening: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  // Clean Manglish toggle pill
  manglishBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0ECE6",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    gap: 4,
    minWidth: 50,
    justifyContent: "center",
  },
  manglishBtnActive: {
    backgroundColor: "#2B2C51",
  },
  manglishLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6B6560",
    fontFamily: "NotoSansMalayalam",
  },
  manglishLabelActive: {
    color: "#FFFFFF",
  },
  manglishSub: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B6560",
    letterSpacing: 0.5,
  },
  manglishSubActive: {
    color: "#C7D2FE",
  },
  // Text input
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 0,
    paddingHorizontal: 4,
    fontFamily: "NotoSansMalayalam",
  },
  inputListening: {
    color: "#DC2626",
    fontWeight: "600",
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  // Mic button
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
  },
  micBtnActive: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  // Search submit button
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2B2C51",
    justifyContent: "center",
    alignItems: "center",
  },
  // Inline error
  inlineErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginLeft: 12,
  },
  inlineErrorText: {
    fontSize: 12,
    color: "#DC2626",
    fontFamily: "NotoSansMalayalam",
  },
  // Candidate suggestions
  suggestionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  suggestionList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  suggestionChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  firstSuggestionChip: {
    backgroundColor: "#2B2C51",
    borderColor: "#2B2C51",
  },
  suggestionText: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "NotoSansMalayalam",
  },
  firstSuggestionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
