/**
 * @file savishesha_thirayal.tsx
 * @description Recent Activity Screen (സമീപകാല തിരയലുകൾ) matching official Bhashamithram-II design.
 * Features:
 * - Branded top navigation header with circular back button and "ഭാഷാമിത്രം II 🍃"
 * - 4 Dictionary Category tabs:
 *   1. ഇംഗ്ലീഷ് - മലയാളം (english_malayalam)
 *   2. മലയാളം - ഇംഗ്ലീഷ് (malayalam_english)
 *   3. മലയാളം - നാനാർത്ഥം (malayalam_synonym)
 *   4. മലയാളം - മലയാളം (malayalam_malayalam)
 * - Sub-filter Pill Switcher:
 *   - തുറന്ന വാക്കുകൾ (Recent Opened Words)
 *   - തിരച്ചിലുകൾ (Recent Searches)
 * - Real-time filtering by dictionary type using AsyncStorage (recentActivity.ts)
 * - Word tap navigation to corresponding dictionary details screen or search screen
 * - Delete individual item and Clear History actions
 * - Styled empty state with open book illustration matching the design system
 */

import React, { useState, useCallback } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import FloatingLettersBackground from "../components/FloatingLettersBackground";
import {
  getRecentActivity,
  inferDictionaryType,
  removeRecentOpening,
  removeRecentSearch,
  clearRecentActivity,
  RecentOpening,
  RecentSearch,
  DictionaryType,
} from "../utils/recentActivity";

type ActivePill = "openings" | "searches";

interface DictionaryTabItem {
  id: DictionaryType;
  label: string;
  detailRoute: string;
  searchRoute: string;
}

const DICTIONARY_TABS: DictionaryTabItem[] = [
  {
    id: "english_malayalam",
    label: "ഇംഗ്ലീഷ്\nമലയാളം",
    detailRoute: "/english_malayalam_details",
    searchRoute: "/english_malayalam",
  },
  {
    id: "malayalam_english",
    label: "മലയാളം\nഇംഗ്ലീഷ്",
    detailRoute: "/malayalam_english_details",
    searchRoute: "/malayalam_english",
  },
  {
    id: "malayalam_synonym",
    label: "മലയാളം\nനാനാർത്ഥം",
    detailRoute: "/malayalam_synonym_details",
    searchRoute: "/malayalam_synonym",
  },
  {
    id: "malayalam_malayalam",
    label: "മലയാളം\nമലയാളം",
    detailRoute: "/malayalam_details",
    searchRoute: "/malayalam-malayalam",
  },
];

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

export default function SavisheshaThirayalScreen() {
  const [activeTab, setActiveTab] = useState<DictionaryType>("english_malayalam");
  const [activePill, setActivePill] = useState<ActivePill>("openings");

  const [allOpenings, setAllOpenings] = useState<RecentOpening[]>([]);
  const [allSearches, setAllSearches] = useState<RecentSearch[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load activities from AsyncStorage
  const loadActivity = async () => {
    try {
      const { recentSearches, recentOpenings } = await getRecentActivity();
      setAllSearches(recentSearches);
      setAllOpenings(recentOpenings);
    } catch (err) {
      console.warn("Failed to load recent activity:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadActivity();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    void loadActivity();
  };

  // Filter activities strictly for the currently selected dictionary tab
  const activeOpenings = allOpenings.filter(
    (item) => inferDictionaryType(item) === activeTab
  );

  const activeSearches = allSearches.filter(
    (item) => inferDictionaryType(item) === activeTab
  );

  const currentTab =
    DICTIONARY_TABS.find((t) => t.id === activeTab) || DICTIONARY_TABS[0];

  const currentCount =
    activePill === "openings" ? activeOpenings.length : activeSearches.length;

  // Direct single item delete without confirmation alert
  const handleDeleteOpening = async (id: string, word: string) => {
    const updated = await removeRecentOpening(id, word);
    setAllOpenings(updated);
  };

  const handleDeleteSearch = async (id: string, title: string) => {
    const updated = await removeRecentSearch(id, title);
    setAllSearches(updated);
  };

  // Clear all history for current tab & pill
  const confirmClearHistory = () => {
    const typeLabel = activePill === "openings" ? "തുറന്ന വാക്കുകൾ" : "തിരച്ചിലുകൾ";
    Alert.alert(
      "ചരിത്രം ഇല്ലാതാക്കുക",
      `ഈ നിഘണ്ടുവിലെ സമീപകാല ${typeLabel} ചരിത്രം പൂർണ്ണമായും ഒഴിവാക്കണോ?`,
      [
        { text: "അല്ല", style: "cancel" },
        {
          text: "അതെ",
          style: "destructive",
          onPress: async () => {
            await clearRecentActivity(
              activePill === "openings" ? "openings" : "searches",
              activeTab
            );
            await loadActivity();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Floating Animated Malayalam letters & waves */}
      <FloatingLettersBackground />

      {/* ===================== TOP NAVIGATION HEADER ===================== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          style={styles.circleBackButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Header Title: ഭാഷാമിത്രം II 🍃 */}
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitleText}>ഭാഷാമിത്രം II</Text>
          <MaterialCommunityIcons
            name="leaf"
            size={22}
            color="#16A34A"
            style={styles.headerLeaf}
          />
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* ===================== DICTIONARY TABS ===================== */}
      <View style={styles.categoryTabsBar}>
        {DICTIONARY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.categoryTabBtn}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryTabLabel,
                  isActive && styles.categoryTabLabelActive,
                ]}
                numberOfLines={2}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ===================== SUB-FILTER PILLS ===================== */}
      <View style={styles.filterPillContainer}>
        {/* Left Pill: തുറന്ന വാക്കുകൾ (Recent Openings) */}
        <TouchableOpacity
          style={[
            styles.filterPill,
            activePill === "openings" && styles.filterPillActive,
          ]}
          onPress={() => setActivePill("openings")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="book-outline"
            size={16}
            color={activePill === "openings" ? "#FFFFFF" : "#64748B"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.filterPillText,
              activePill === "openings" && styles.filterPillTextActive,
            ]}
          >
            {`തുറന്ന വാക്കുകൾ (${activeOpenings.length})`}
          </Text>
        </TouchableOpacity>

        {/* Right Pill: തിരച്ചിലുകൾ (Recent Searches) */}
        <TouchableOpacity
          style={[
            styles.filterPill,
            activePill === "searches" && styles.filterPillActive,
          ]}
          onPress={() => setActivePill("searches")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color={activePill === "searches" ? "#FFFFFF" : "#64748B"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.filterPillText,
              activePill === "searches" && styles.filterPillTextActive,
            ]}
          >
            {`തിരച്ചിലുകൾ (${activeSearches.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===================== MAIN CONTENT / LIST / EMPTY STATE ===================== */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          currentCount === 0 && styles.scrollContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D9488"]}
            tintColor="#0D9488"
          />
        }
      >
        {currentCount === 0 ? (
          /* Empty State matching the uploaded screenshot */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyBookWrapper}>
              <Image
                source={require("../../assets/images/empty_suggestions_book.png")}
                style={styles.emptyBookImage}
                contentFit="contain"
              />
            </View>

            <Text style={styles.emptyTitle}>
              {activePill === "openings"
                ? "തുറന്ന വാക്കുകൾ ലഭ്യമല്ല"
                : "തിരച്ചിലുകൾ ലഭ്യമല്ല"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activePill === "openings"
                ? "ഈ നിഘണ്ടുവിൽ സമീപകാലത്ത് തുറന്ന വാക്കുകൾ നിലവിലില്ല."
                : "ഈ നിഘണ്ടുവിൽ സമീപകാലത്ത് തിരച്ചിലുകൾ നിലവിലില്ല."}
            </Text>
          </View>
        ) : (
          /* List of Recent Items */
          <View style={styles.listContainer}>
            {/* Header row with count and clear button */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderCount}>
                {activePill === "openings"
                  ? `${activeOpenings.length} വാക്കുകൾ`
                  : `${activeSearches.length} തിരച്ചിലുകൾ`}
              </Text>
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={confirmClearHistory}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={13}
                  color="#EF4444"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.clearAllText}>എല്ലാം ഒഴിവാക്കുക</Text>
              </TouchableOpacity>
            </View>

            {activePill === "openings"
              ? activeOpenings.map((item) => (
                  <View key={item._id} style={styles.activityCard}>
                    <TouchableOpacity
                      style={styles.cardMainAction}
                      activeOpacity={0.7}
                      onPress={() => {
                        router.push({
                          pathname: currentTab.detailRoute as any,
                          params: { word: item.word },
                        });
                      }}
                      onLongPress={() => void handleDeleteOpening(item._id, item.word)}
                    >
                      <View style={styles.cardIconBadge}>
                        <Ionicons
                          name="book-outline"
                          size={18}
                          color="#0D9488"
                        />
                      </View>

                      <View style={styles.cardTextCol}>
                        <Text style={styles.cardWordTitle}>{item.word}</Text>
                        <View style={styles.cardTimeRow}>
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color="#94A3B8"
                          />
                          <Text style={styles.cardTimeText}>
                            {formatDateTime(item.openedAt)}
                          </Text>
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#CBD5E1"
                        style={{ marginRight: 6 }}
                      />
                    </TouchableOpacity>

                    {/* Single Word Delete Button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.6}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      onPress={() => void handleDeleteOpening(item._id, item.word)}
                      accessibilityLabel={`Delete ${item.word}`}
                    >
                      <View style={styles.deleteIconBadge}>
                        <Ionicons name="trash-outline" size={15} color="#EF4444" />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              : activeSearches.map((item) => (
                  <View key={item._id} style={styles.activityCard}>
                    <TouchableOpacity
                      style={styles.cardMainAction}
                      activeOpacity={0.7}
                      onPress={() => {
                        router.push({
                          pathname: currentTab.searchRoute as any,
                          params: { query: item.title },
                        });
                      }}
                      onLongPress={() => void handleDeleteSearch(item._id, item.title)}
                    >
                      <View style={styles.cardIconBadge}>
                        <Ionicons
                          name="search-outline"
                          size={18}
                          color="#0D9488"
                        />
                      </View>

                      <View style={styles.cardTextCol}>
                        <Text style={styles.cardWordTitle}>{item.title}</Text>
                        <View style={styles.cardTimeRow}>
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color="#94A3B8"
                          />
                          <Text style={styles.cardTimeText}>
                            {formatDateTime(item.searchedAt)}
                          </Text>
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#CBD5E1"
                        style={{ marginRight: 6 }}
                      />
                    </TouchableOpacity>

                    {/* Single Search Delete Button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.6}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      onPress={() => void handleDeleteSearch(item._id, item.title)}
                      accessibilityLabel={`Delete ${item.title}`}
                    >
                      <View style={styles.deleteIconBadge}>
                        <Ionicons name="trash-outline" size={15} color="#EF4444" />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  /* ===================== TOP HEADER ===================== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 4 : 8,
    paddingBottom: 8,
    zIndex: 10,
  },
  circleBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleText: {
    fontFamily: "NotoSansMalayalam",
    fontSize: 21,
    fontWeight: "800",
    color: "#0D5C75",
    letterSpacing: 0.2,
  },
  headerLeaf: {
    marginLeft: 6,
    transform: [{ rotate: "-15deg" }],
  },

  /* ===================== DICTIONARY TABS ===================== */
  categoryTabsBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 10,
  },
  categoryTabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    position: "relative",
  },
  categoryTabLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 16,
  },
  categoryTabLabelActive: {
    color: "#0F766E",
    fontWeight: "800",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: -1,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: "#0D9488",
    borderRadius: 2,
  },

  /* ===================== SUB-FILTER PILLS ===================== */
  filterPillContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 4,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: "#0D7482",
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "NotoSansMalayalam",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  /* ===================== SCROLL CONTENT & EMPTY STATE ===================== */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    zIndex: 10,
  },
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyBookWrapper: {
    width: 160,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyBookImage: {
    width: "100%",
    height: "100%",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 270,
  },

  /* ===================== LIST CARDS ===================== */
  listContainer: {
    width: "100%",
    paddingTop: 4,
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  listHeaderCount: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#64748B",
    fontFamily: "NotoSansMalayalam",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },
  clearAllText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#EF4444",
    fontFamily: "NotoSansMalayalam",
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardMainAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 6,
  },
  cardIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTextCol: {
    flex: 1,
    justifyContent: "center",
  },
  cardWordTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
  },
  cardTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  cardTimeText: {
    fontSize: 11.5,
    color: "#64748B",
    marginLeft: 4,
    fontFamily: "NotoSansMalayalam",
  },
  deleteButton: {
    padding: 6,
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
});