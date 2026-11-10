/**
 * @file settings.tsx
 * @description Application route screen component for settings.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResponsive } from "../utils/responsive";

import BottomTabBar from "../components/BottomTabBar";
import FloatingLettersBackground from "../components/FloatingLettersBackground";

/**
 * Renders and manages the SettingsScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const {
    headerHeight,
    headerTitleFontSize,
    cardPadding,
    cardMarginBottom,
    horizontalPadding,
  } = useResponsive();

  const [voiceSearchEnabled, setVoiceSearchEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const colors = {
    headerBg: "#FFFFFF",
    cardBg: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    primaryBlue: "#2563EB",
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Floating Ambient Background */}
      <FloatingLettersBackground />

      {/* Clean Modern Header (Matching Screen 4) */}
      <View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerInner}>
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
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
              ക്രമീകരണങ്ങൾ
            </Text>
            <Text style={styles.headerSubtitle}>Settings</Text>
          </View>

          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: Math.round(cardMarginBottom * 2.5),
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          പൊതുവായവ (General Settings)
        </Text>

        {/* Setting Card */}
        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.cardBg,
              paddingHorizontal: cardPadding,
              marginBottom: cardMarginBottom,
            },
          ]}
        >
          {/* Voice Search Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconWrapper, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="mic" size={20} color="#2563EB" />
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
              trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
              thumbColor={voiceSearchEnabled ? "#2563EB" : "#F8FAFC"}
            />
          </View>

          {/* Notifications Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconWrapper, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="notifications" size={20} color="#059669" />
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
              trackColor={{ false: "#CBD5E1", true: "#6EE7B7" }}
              thumbColor={notificationsEnabled ? "#059669" : "#F8FAFC"}
            />
          </View>

          {/* Haptic Feedback Toggle */}
          <View style={[styles.settingRow, styles.noBorder]}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconWrapper, { backgroundColor: "#FFF7ED" }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#EA580C" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  ഹാപ്റ്റിക്സ്
                </Text>
                <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>
                  Vibration Feedback
                </Text>
              </View>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: "#CBD5E1", true: "#FDBA74" }}
              thumbColor={hapticFeedback ? "#EA580C" : "#F8FAFC"}
            />
          </View>
        </View>

        {/* Learning & Favorites Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          പഠന സഹായി (Learning Tools)
        </Text>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.cardBg,
              paddingHorizontal: cardPadding,
              marginBottom: cardMarginBottom,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.settingRow, styles.noBorder]}
            onPress={() => router.push("/favorites" as any)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconWrapper, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="heart" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  പ്രിയപ്പെട്ട വാക്കുകൾ
                </Text>
                <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>
                  Favorite Words Collection
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoContainer}>
          <Text style={[styles.versionText, { color: colors.textPrimary }]}>
            ഭാഷാമിത്രം (Bhashamithram) v2.0.0
          </Text>
          <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
            Designed & Developed by R&D C-DIT
          </Text>
          <Text style={[styles.subCopyrightText, { color: colors.textSecondary }]}>
            Centre for Development of Imaging Technology, Government of Kerala
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation Tab Bar */}
      <BottomTabBar activeTab="settings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: Platform.OS === "android" ? 65 : 75,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerInner: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
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
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
      },
      default: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
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
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 4,
    textAlign: "center",
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "center",
  },
  subCopyrightText: {
    fontSize: 10,
    fontWeight: "400",
    textAlign: "center",
  },
});
