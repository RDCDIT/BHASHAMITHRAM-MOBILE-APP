/**
 * @file settings.tsx
 * @description Application route screen component for settings.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearRecentActivity } from "../utils/recentActivity";

/**
 * Renders and manages the SettingsScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const [voiceSearchEnabled, setVoiceSearchEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const colors = {
    headerBg: "#2B2C51",
    containerBg: "transparent",
    cardBg: "rgba(255, 255, 255, 0.6)",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    danger: "#EF4444",
  };

  const handleClearHistory = () => {
    Alert.alert(
      "ചരിത്രം ഇല്ലാതാക്കുക",
      "തിരച്ചിൽ ചരിത്രം പൂർണ്ണമായും ഇല്ലാതാക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുണ്ടോ?",
      [
        { text: "അല്ല", style: "cancel" },
        {
          text: "അതെ",
          style: "destructive",
          onPress: async () => {
            await clearRecentActivity("all");
            Alert.alert("വിജയം", "തിരച്ചിൽ ചരിത്രം ഇല്ലാതാക്കിയിരിക്കുന്നു.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.containerBg }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar backgroundColor={colors.headerBg} barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

        <Text style={styles.headerTitle}>ക്രമീകരണങ്ങൾ</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          പൊതുവായവ (General Settings)
        </Text>

        {/* Setting Card */}
        <View style={[styles.settingsCard, { backgroundColor: colors.cardBg }]}>
          {/* Voice Search Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconWrapper, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="mic-outline" size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  ശബ്ദ തിരച്ചിൽ
                </Text>
                <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>
                  Voice Search
                </Text>
              </View>
            </View>
            <Switch
              value={voiceSearchEnabled}
              onValueChange={setVoiceSearchEnabled}
              trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
              thumbColor={voiceSearchEnabled ? "#2B2C51" : "#F3F4F6"}
            />
          </View>

          {/* Notifications Toggle */}
          <View style={[styles.settingRow, styles.noBorder]}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconWrapper, { backgroundColor: "#FFF1F2" }]}>
                <Ionicons name="notifications-outline" size={20} color="#F43F5E" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  അറിയിപ്പുകൾ
                </Text>
                <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>
                  Notifications
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
              thumbColor={notificationsEnabled ? "#2B2C51" : "#F3F4F6"}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ഡാറ്റ മാനേജ്‌മെന്റ് (Data Management)
        </Text>

        <View style={[styles.settingsCard, { backgroundColor: colors.cardBg }]}>
          {/* Clear History Button */}
          <TouchableOpacity
            style={styles.settingRowClickable}
            activeOpacity={0.7}
            onPress={handleClearHistory}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconWrapper, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.danger }]}>
                  ചരിത്രം ഇല്ലാതാക്കുക
                </Text>
                <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>
                  Clear History
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version: 2.0.0 (R&D C-DIT)
          </Text>
          <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
            Developed by R&D C-DIT
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: Platform.OS === "android" ? 65 : 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  settingsCard: {
    borderRadius: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      },
      default: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingRowClickable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 1,
  },
  settingSubLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 2,
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
