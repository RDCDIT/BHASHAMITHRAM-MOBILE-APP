/**
 * @file VoiceSearchOverlay.tsx
 * @description React Native UI Component: VoiceSearchOverlay.
 */

import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VoiceSearchOverlayProps {
  visible: boolean;
  partialTranscript: string;
  lang: "en-US" | "ml-IN";
  onClose: () => void;
}

/**
 * Renders and manages the VoiceSearchOverlay component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function VoiceSearchOverlay({
  visible,
  partialTranscript,
  lang,
  onClose,
}: VoiceSearchOverlayProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.micCircle}>
            <Ionicons name="mic" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.listeningText}>
            {lang === "en-US" ? "Listening (English)..." : "കേൾക്കുന്നു (മലയാളം)..."}
          </Text>
       
       
          <Text style={styles.transcriptText} numberOfLines={3}>
            {partialTranscript || (lang === "en-US" ? "Speak now" : "സംസാരിക്കൂ...")}
          </Text>
          <TouchableOpacity style={styles.stopButton} onPress={onClose}>
            <Text style={styles.stopButtonText}>
              {lang === "en-US" ? "Stop" : "നിർത്തുക"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E04848",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  listeningText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 12,
  },
  transcriptText: {
    fontSize: 15,
    color: "#7C736B",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    minHeight: 44,
  },
  stopButton: {
    backgroundColor: "#2B2C51",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 14,
  },
  stopButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
});
