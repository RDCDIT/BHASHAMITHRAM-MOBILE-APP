/**
 * @file DictionarySearchBar.tsx
 * @description Shared search bar for Malayalam dictionary screens.
 *
 * Features:
 *  - Manglish keyboard toggle: when ON, English keystrokes are
 *    transliterated to Malayalam in real-time (e.g. "amma" → "അമ്മ").
 *    When OFF, the input behaves as a plain Malayalam / any-script search.
 *  - Voice search mic button: opens a bottom-sheet overlay, records
 *    the user's voice via useVoiceSearch, and injects the Malayalam
 *    transcript directly into the search field.
 */

import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { transliterate } from "../utils/transliterator";
import { useVoiceSearch } from "../hooks/useVoiceSearch";

interface DictionarySearchBarProps {
  /** Current value shown in the input */
  value: string;
  /** Placeholder text */
  placeholder?: string;
  /** Called whenever the search text changes (already transliterated when Manglish is ON) */
  onChangeText: (text: string) => void;
  /** Called when the user presses the search / return button */
  onSubmit: () => void;
}

export default function DictionarySearchBar({
  value,
  placeholder = "വാക്ക് നൽകുക...",
  onChangeText,
  onSubmit,
}: DictionarySearchBarProps) {
  // --- Manglish toggle state ---
  const [manglishOn, setManglishOn] = useState(true);

  // --- raw English buffer (only used when Manglish is ON) ---
  // We keep the raw Latin text so the cursor stays natural while
  // the displayed value is Malayalam.
  const rawRef = useRef("");

  // --- Voice overlay ---
  const [voiceVisible, setVoiceVisible] = useState(false);

  // Animated pulse for the mic icon while listening
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
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
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
  };

  // Voice search hook — always uses ml-IN for these screens
  const { isListening, partialTranscript, startListening, stopListening } =
    useVoiceSearch((transcript: string) => {
      // Transcript arrives as Malayalam text from the backend / Web Speech API
      rawRef.current = "";
      onChangeText(transcript);
      setVoiceVisible(false);
      stopPulse();
    }, "ml-IN");

  // ---- handlers ----

  const handleTextChange = (text: string) => {
    if (manglishOn) {
      rawRef.current = text;
      if (text === "") {
        onChangeText("");
        return;
      }
      try {
        const malayalam = transliterate(text, { from: "en", to: "ml" });
        onChangeText(malayalam);
      } catch {
        onChangeText(text);
      }
    } else {
      rawRef.current = "";
      onChangeText(text);
    }
  };

  const handleToggleManglish = () => {
    setManglishOn((prev) => !prev);
    // Clear search when switching modes to avoid stale state
    rawRef.current = "";
    onChangeText("");
  };

  const handleMicPress = async () => {
    if (isListening) {
      await stopListening();
      stopPulse();
      setVoiceVisible(false);
    } else {
      setVoiceVisible(true);
      startPulse();
      await startListening();
    }
  };

  const handleCloseVoice = async () => {
    await stopListening();
    stopPulse();
    setVoiceVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        {/* ── Manglish toggle pill ── */}
        <TouchableOpacity
          style={[styles.manglishBtn, manglishOn && styles.manglishBtnActive]}
          onPress={handleToggleManglish}
          activeOpacity={0.75}
          accessibilityLabel={
            manglishOn ? "Manglish keyboard ON — tap to turn off" : "Manglish keyboard OFF — tap to turn on"
          }
        >
          <Text style={[styles.manglishLabel, manglishOn && styles.manglishLabelActive]}>
            മ
          </Text>
          <Text style={[styles.manglishSub, manglishOn && styles.manglishSubActive]}>
            {manglishOn ? "ON" : "OFF"}
          </Text>
        </TouchableOpacity>

        {/* ── Text input ── */}
        <TextInput
          style={styles.input}
          placeholder={
            manglishOn
              ? "Type in English (amma → അമ്മ)..."
              : placeholder
          }
          placeholderTextColor="#898683"
          value={value}
          // When Manglish is ON we feed a raw Latin value to the input
          // so the user sees their keystrokes; the displayed value prop
          // is Malayalam. We override by using the raw buffer as the
          // controlled value only when manglish is on.
          onChangeText={handleTextChange}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={onSubmit}
          keyboardType="default"
        />

        {/* ── Mic button ── */}
        <TouchableOpacity
          style={[styles.iconBtn, isListening && styles.iconBtnActive]}
          onPress={handleMicPress}
          activeOpacity={0.8}
          accessibilityLabel="Voice search"
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons
              name={isListening ? "mic" : "mic-outline"}
              size={20}
              color={isListening ? "#FFFFFF" : "#FFFFFF"}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* ── Search button ── */}
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={onSubmit}
          activeOpacity={0.8}
          accessibilityLabel="Search"
        >
          <Ionicons name="search" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Voice search modal overlay ── */}
      <Modal
        transparent
        visible={voiceVisible}
        animationType="slide"
        onRequestClose={handleCloseVoice}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleCloseVoice}
        >
          {/* Prevent touches on the card from closing */}
          <TouchableOpacity activeOpacity={1} style={styles.voiceCard}>
            {/* Pulsing mic */}
            <Animated.View
              style={[
                styles.micCircle,
                isListening && styles.micCircleListening,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons name="mic" size={38} color="#FFFFFF" />
            </Animated.View>

            <Text style={styles.voiceTitle}>
              {isListening ? "കേൾക്കുന്നു..." : "ശബ്ദ തിരയൽ"}
            </Text>

            <Text style={styles.voiceHint}>
              {isListening
                ? "മലയാളത്തിൽ സംസാരിക്കൂ"
                : "മൈക്ക് ബട്ടൺ അമർത്തി സംസാരിക്കൂ"}
            </Text>

            {/* Live transcript preview */}
            {partialTranscript ? (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptText} numberOfLines={3}>
                  {partialTranscript}
                </Text>
              </View>
            ) : null}

            <View style={styles.voiceActions}>
              {isListening ? (
                <TouchableOpacity
                  style={styles.stopBtn}
                  onPress={handleCloseVoice}
                >
                  <Ionicons name="stop-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.stopBtnText}>നിർത്തുക</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCloseVoice}
                >
                  <Text style={styles.cancelBtnText}>റദ്ദാക്കുക</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Search bar row ──────────────────────────────────────────────────
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
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

  // Manglish toggle pill
  manglishBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0ECE6",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    gap: 3,
    minWidth: 52,
    justifyContent: "center",
  },
  manglishBtnActive: {
    backgroundColor: "#2B2C51",
  },
  manglishLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6B6560",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 20,
  },
  manglishLabelActive: {
    color: "#FFFFFF",
  },
  manglishSub: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6B6560",
    letterSpacing: 0.5,
  },
  manglishSubActive: {
    color: "#A5B4FC",
  },

  // Text input
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    padding: 0,
    fontFamily: "NotoSansMalayalam",
  },

  // Mic icon button
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
  },
  iconBtnActive: {
    backgroundColor: "#E04848",
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

  // ── Voice modal ─────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  voiceCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 32,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    paddingHorizontal: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  micCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  micCircleListening: {
    backgroundColor: "#E04848",
  },
  voiceTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 6,
  },
  voiceHint: {
    fontSize: 14,
    color: "#7C736B",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  transcriptBox: {
    width: "100%",
    backgroundColor: "#F5F5F8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    minHeight: 52,
    justifyContent: "center",
  },
  transcriptText: {
    fontSize: 17,
    color: "#1F2330",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "700",
  },
  voiceActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  stopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E04848",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  stopBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  cancelBtn: {
    backgroundColor: "#F0ECE6",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  cancelBtnText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
});
