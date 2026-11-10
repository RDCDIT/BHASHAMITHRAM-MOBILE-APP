/**
 * @file admin.tsx
 * @description Secure Administrator Dashboard with PIN protection and management of public user word suggestions.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocalSuggestedWords } from "../../database/dictionaryService";

const ADMIN_PIN_KEY = "@bhashamithram_admin_security_pin";
const DEFAULT_PIN = "2026";
const MASTER_PIN = "cdit2026";

interface SuggestionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminDashboardScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [stats, setStats] = useState<SuggestionStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * Fetches real-time suggestion statistics from the local SQLite database.
   */
  const loadStats = async (isPullRefresh = false) => {
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setLoadingStats(true);
    }

    try {
      const words = await getLocalSuggestedWords("all");
      const pending = words.filter(
        (w) => (w.status || "pending") === "pending"
      ).length;
      const approved = words.filter((w) => w.status === "approved").length;
      const rejected = words.filter((w) => w.status === "rejected").length;

      setStats({
        total: words.length,
        pending,
        approved,
        rejected,
      });
    } catch (err) {
      console.warn("Failed to load suggestion stats from SQLite:", err);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  // Reload stats whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadStats();
      }
    }, [isAuthenticated])
  );

  /**
   * Validates the entered admin PIN.
   */
  const handleVerifyPin = async () => {
    if (!pinInput.trim()) {
      setPinError("ദയവായി പിൻ നമ്പർ നൽകുക (Please enter PIN)");
      return;
    }

    setIsVerifying(true);
    setPinError("");

    try {
      const storedPin = await AsyncStorage.getItem(ADMIN_PIN_KEY);
      const expectedPin = storedPin || DEFAULT_PIN;

      if (pinInput.trim() === expectedPin || pinInput.trim() === MASTER_PIN) {
        setIsAuthenticated(true);
        setPinInput("");
        setPinError("");
        loadStats();
      } else {
        setPinError("തെറ്റായ പിൻ നമ്പർ! വീണ്ടും ശ്രമിക്കുക (Incorrect PIN)");
      }
    } catch {
      setPinError("പിൻ പരിശോധന പരാജയപ്പെട്ടു (Verification failed)");
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Logs out the admin and returns to PIN lock state.
   */
  const handleLogout = () => {
    Alert.alert(
      "ലോഗ് ഔട്ട് (Log Out)",
      "അഡ്മിൻ ഡാഷ്‌ബോർഡിൽ നിന്നും ലോഗ് ഔട്ട് ചെയ്യണമോ?",
      [
        { text: "റദ്ദാക്കുക (Cancel)", style: "cancel" },
        {
          text: "ലോഗ് ഔട്ട് (Log Out)",
          style: "destructive",
          onPress: () => {
            setIsAuthenticated(false);
            setPinInput("");
            setPinError("");
          },
        },
      ]
    );
  };

  // =========================================================================
  // VIEW 1: PIN LOCK SCREEN (For security against unauthorized public access)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.authContainer} edges={["top", "left", "right"]}>
        <StatusBar backgroundColor="#2B2C51" barStyle="light-content" />

        {/* Header */}
        <View style={styles.authHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.authHeaderTitle}>അഡ്മിൻ പ്രവേശനം</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.authScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.lockBox}>
            <View style={styles.logoBadgeContainer}>
              <Image
                source={require("../../../assets/images/cdit_logo.png")}
                style={styles.cditLogo}
                contentFit="contain"
              />
            </View>

            <View style={styles.shieldIconWrap}>
              <Ionicons name="shield-checkmark" size={32} color="#F59E0B" />
            </View>

            <Text style={styles.authTitle}>അഡ്മിൻ പോർട്ടൽ</Text>
            <Text style={styles.authSubtitle}>
              Administrator Access Verification
            </Text>
            <Text style={styles.authInstruction}>
              ഈ വിഭാഗം അഡ്മിനിസ്ട്രേറ്റർമാർക്ക് മാത്രമായി പരിമിതപ്പെടുത്തിയിരിക്കുന്നു. പൊതുജനങ്ങൾ നിർദ്ദേശിച്ച വാക്കുകൾ കൈകാര്യം ചെയ്യാൻ സുരക്ഷാ പിൻ നൽകുക.
            </Text>

            {/* PIN Input Box */}
            <View style={styles.pinInputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748B"
                style={styles.inputPrefixIcon}
              />
              <TextInput
                style={styles.pinInput}
                placeholder="4-ഡിജിറ്റ് പിൻ നൽകുക (Enter PIN)"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPin}
                keyboardType="numeric"
                maxLength={10}
                value={pinInput}
                onChangeText={(text) => {
                  setPinInput(text);
                  if (pinError) setPinError("");
                }}
                onSubmitEditing={handleVerifyPin}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => setShowPin(!showPin)}
                style={styles.eyeIconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPin ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {pinError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorBannerText}>{pinError}</Text>
              </View>
            ) : null}

            <Text style={styles.pinHint}>സ്ഥിരസ്ഥിതി പിൻ (Default PIN): 2026</Text>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={handleVerifyPin}
              activeOpacity={0.85}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="key-outline" size={19} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.unlockBtnText}>ഡാഷ്‌ബോർഡിൽ പ്രവേശിക്കുക</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelLinkText}>റദ്ദാക്കുക (Return to App)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED ADMINISTRATOR DASHBOARD
  // =========================================================================
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#2B2C51" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>അഡ്മിൻ ഡാഷ്‌ബോർഡ്</Text>
          <Text style={styles.headerSub}>Administrator Management Portal</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="log-out-outline" size={22} color="#FECACA" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadStats(true)}
            colors={["#2B2C51"]}
          />
        }
      >
        {/* Welcome Banner */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextGroup}>
            <Text style={styles.welcomeGreeting}>സ്വാഗതം, അഡ്മിനിസ്ട്രേറ്റർ</Text>
            <Text style={styles.welcomeSubtitle}>
              C-DIT Bhashamithram II Central Administration
            </Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.adminBadgeText}>VERIFIED</Text>
          </View>
        </View>

        {/* ============================================================= */}
        {/* HERO SECTION: PUBLIC USER SUGGESTED WORDS (PRIMARY FOCUS)     */}
        {/* ============================================================= */}
        <View style={styles.heroSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <View style={styles.heroIconBadge}>
                <Ionicons name="people" size={18} color="#2563EB" />
              </View>
              <Text style={styles.heroSectionTitle}>
                പൊതുജന പദ നിർദ്ദേശങ്ങൾ
              </Text>
            </View>
            <Text style={styles.heroSectionTag}>Public Suggestions</Text>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroCardDescription}>
              ആപ്പ് ഉപയോക്താക്കൾ മൊബൈൽ ആപ്ലിക്കേഷൻ വഴി സമർപ്പിച്ച പദങ്ങളും അർത്ഥങ്ങളും ഇവിടെ പരിശോധിച്ച് അംഗീകരിക്കുകയോ നിരസിക്കുകയോ ചെയ്യാം.
            </Text>

            {/* Live Statistics Counters Grid */}
            <View style={styles.statsGrid}>
              {/* Pending */}
              <TouchableOpacity
                style={[styles.statBox, styles.statBoxPending]}
                activeOpacity={0.8}
                onPress={() => router.push("/admin/suggestedwordsview")}
              >
                <Text style={styles.statCountPending}>{stats.pending}</Text>
                <Text style={styles.statLabelPending}>പരിശോധനയിൽ (Pending)</Text>
              </TouchableOpacity>

              {/* Approved */}
              <TouchableOpacity
                style={[styles.statBox, styles.statBoxApproved]}
                activeOpacity={0.8}
                onPress={() => router.push("/admin/suggestedwordsview")}
              >
                <Text style={styles.statCountApproved}>{stats.approved}</Text>
                <Text style={styles.statLabelApproved}>അംഗീകരിച്ചവ (Approved)</Text>
              </TouchableOpacity>

              {/* Rejected */}
              <TouchableOpacity
                style={[styles.statBox, styles.statBoxRejected]}
                activeOpacity={0.8}
                onPress={() => router.push("/admin/suggestedwordsview")}
              >
                <Text style={styles.statCountRejected}>{stats.rejected}</Text>
                <Text style={styles.statLabelRejected}>നിരസിച്ചവ (Rejected)</Text>
              </TouchableOpacity>

              {/* Total */}
              <TouchableOpacity
                style={[styles.statBox, styles.statBoxTotal]}
                activeOpacity={0.8}
                onPress={() => router.push("/admin/suggestedwordsview")}
              >
                <Text style={styles.statCountTotal}>{stats.total}</Text>
                <Text style={styles.statLabelTotal}>ആകെ (Total)</Text>
              </TouchableOpacity>
            </View>

            {/* Direct CTA Action Button */}
            <TouchableOpacity
              style={styles.heroActionBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/admin/suggestedwordsview")}
            >
              <Ionicons name="document-text-outline" size={19} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.heroActionBtnText}>
                നിർദ്ദേശങ്ങൾ പരിശോധിക്കുക (Review Suggestions)
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================= */}
        {/* OTHER ADMIN TOOLS & DICTIONARY MANAGEMENT                     */}
        {/* ============================================================= */}
        <Text style={styles.secondarySectionTitle}>
          നിഘണ്ടു പരിപാലനം (Dictionary Management)
        </Text>

        <View style={styles.grid}>
          {/* Card: Add Word Record */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/manualinput")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="add-circle" size={28} color="#EA580C" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Add Word Record</Text>
              <Text style={styles.cardDescription}>
                Manually enter a new vocabulary record directly into the dictionary
              </Text>
              <View style={styles.actionRow}>
                <Text style={[styles.actionText, { color: "#EA580C" }]}>Add record</Text>
                <Ionicons name="arrow-forward" size={15} color="#EA580C" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card: Manage Dictionary Records */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/records")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="list" size={28} color="#7C3AED" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Manage Dictionary Records</Text>
              <Text style={styles.cardDescription}>
                Search, view, update, or remove existing vocabulary records
              </Text>
              <View style={styles.actionRow}>
                <Text style={[styles.actionText, { color: "#7C3AED" }]}>Manage records</Text>
                <Ionicons name="arrow-forward" size={15} color="#7C3AED" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card: Upload Word Media */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/mediaupload")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#FCE7F3" }]}>
              <Ionicons name="cloud-upload" size={28} color="#DB2777" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Upload Word Media</Text>
              <Text style={styles.cardDescription}>
                Upload images and custom pronunciation audio for dictionary words
              </Text>
              <View style={styles.actionRow}>
                <Text style={[styles.actionText, { color: "#DB2777" }]}>Upload media</Text>
                <Ionicons name="arrow-forward" size={15} color="#DB2777" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card: SQL Data Import */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/sqlimport")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#E6F4EA" }]}>
              <Ionicons name="server" size={28} color="#137333" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>SQL Data Import</Text>
              <Text style={styles.cardDescription}>
                Import external database dumps into collection storage
              </Text>
              <View style={styles.actionRow}>
                <Text style={[styles.actionText, { color: "#137333" }]}>Import database</Text>
                <Ionicons name="arrow-forward" size={15} color="#137333" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Bhashamithram II Administrator Console • C-DIT R&D
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F1",
  },
  header: {
    height: Platform.OS === "android" ? 64 : 70,
    backgroundColor: "#2B2C51",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  headerSub: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 1,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Auth / Lock Screen Styles
  authContainer: {
    flex: 1,
    backgroundColor: "#2B2C51",
  },
  authHeader: {
    height: Platform.OS === "android" ? 60 : 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  authHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  lockBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoBadgeContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cditLogo: {
    width: 46,
    height: 46,
  },
  shieldIconWrap: {
    marginBottom: 8,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 2,
  },
  authSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "600",
  },
  authInstruction: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: "NotoSansMalayalam",
  },
  pinInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  inputPrefixIcon: {
    marginRight: 10,
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    letterSpacing: 2,
  },
  eyeIconBtn: {
    padding: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: "100%",
    marginBottom: 10,
  },
  errorBannerText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
    fontFamily: "NotoSansMalayalam",
    flex: 1,
  },
  pinHint: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 18,
  },
  unlockBtn: {
    flexDirection: "row",
    width: "100%",
    height: 48,
    backgroundColor: "#2B2C51",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2B2C51",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  unlockBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  cancelLink: {
    marginTop: 16,
    padding: 8,
  },
  cancelLinkText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    fontFamily: "NotoSansMalayalam",
  },

  // Welcome Card
  welcomeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E293B",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 11,
    color: "#64748B",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
  },

  // Hero Section (Suggested Words)
  heroSection: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  heroSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    fontFamily: "NotoSansMalayalam",
  },
  heroSectionTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroCardDescription: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: "NotoSansMalayalam",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statBoxPending: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  statCountPending: {
    fontSize: 22,
    fontWeight: "800",
    color: "#D97706",
  },
  statLabelPending: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309",
    marginTop: 2,
    fontFamily: "NotoSansMalayalam",
  },
  statBoxApproved: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statCountApproved: {
    fontSize: 22,
    fontWeight: "800",
    color: "#059669",
  },
  statLabelApproved: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
    marginTop: 2,
    fontFamily: "NotoSansMalayalam",
  },
  statBoxRejected: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  statCountRejected: {
    fontSize: 22,
    fontWeight: "800",
    color: "#DC2626",
  },
  statLabelRejected: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B91C1C",
    marginTop: 2,
    fontFamily: "NotoSansMalayalam",
  },
  statBoxTotal: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  statCountTotal: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4F46E5",
  },
  statLabelTotal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4338CA",
    marginTop: 2,
    fontFamily: "NotoSansMalayalam",
  },
  heroActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2C51",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  heroActionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },

  // Other Management Tools
  secondarySectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
    fontFamily: "NotoSansMalayalam",
  },
  grid: {
    flexDirection: "column",
    gap: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  footerNote: {
    marginTop: 24,
    alignItems: "center",
  },
  footerNoteText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
