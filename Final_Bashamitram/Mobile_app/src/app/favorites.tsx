/**
 * @file favorites.tsx
 * @description Dedicated Favorites screen for learning and reviewing starred words.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import BottomTabBar from "../components/BottomTabBar";
import FloatingLettersBackground from "../components/FloatingLettersBackground";
import SpeakButton from "../components/SpeakButton";
import {
  clearAllFavorites,
  FavoriteItem,
  getFavorites,
  removeFavorite,
} from "../utils/favorites";
import { useResponsive } from "../utils/responsive";

export default function FavoritesScreen() {
  const router = useRouter();
  const { isSmallPhone } = useResponsive();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const loadFavoritesData = async () => {
    setLoading(true);
    const data = await getFavorites();
    setFavorites(data);
    setLoading(false);
  };

  // Reload when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadFavoritesData();
    }, [])
  );

  const handleRemove = (id: string, word: string) => {
    Alert.alert(
      "ഒഴിവാക്കുക (Remove)",
      `"${word}" പ്രിയപ്പെട്ടവയിൽ നിന്ന് ഒഴിവാക്കണമോ?`,
      [
        { text: "റദ്ദാക്കുക (Cancel)", style: "cancel" },
        {
          text: "ഒഴിവാക്കുക (Remove)",
          style: "destructive",
          onPress: async () => {
            await removeFavorite(id);
            setFavorites((prev) => prev.filter((f) => f.id !== id));
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (favorites.length === 0) return;
    Alert.alert(
      "എല്ലാം നീക്കം ചെയ്യുക (Clear All)",
      "സൂക്ഷിച്ച എല്ലാ വാക്കുകളും ഒഴിവാക്കണമോ?",
      [
        { text: "റദ്ദാക്കുക", style: "cancel" },
        {
          text: "നീക്കം ചെയ്യുക",
          style: "destructive",
          onPress: async () => {
            await clearAllFavorites();
            setFavorites([]);
          },
        },
      ]
    );
  };

  const handleWordPress = (item: FavoriteItem) => {
    // Navigate to appropriate detail screen based on dictionaryType
    if (item.dictionaryType === "english_malayalam") {
      router.push({
        pathname: "/english_malayalam_details",
        params: { word: item.word },
      });
    } else if (item.dictionaryType === "malayalam_english") {
      router.push({
        pathname: "/malayalam_english_details",
        params: { word: item.word },
      });
    } else if (item.dictionaryType === "malayalam_thesaurus") {
      router.push({
        pathname: "/malayalam_synonym_details",
        params: { word: item.word },
      });
    } else {
      router.push({
        pathname: "/malayalam_details",
        params: { word: item.word },
      });
    }
  };

  const getDictionaryLabel = (type: string) => {
    switch (type) {
      case "english_malayalam":
        return "Eng - Mal";
      case "malayalam_english":
        return "Mal - Eng";
      case "malayalam_thesaurus":
        return "Thesaurus";
      default:
        return "Mal - Mal";
    }
  };

  const getDictionaryBadgeColor = (type: string) => {
    switch (type) {
      case "english_malayalam":
        return { bg: "#D1FAE5", text: "#059669" };
      case "malayalam_english":
        return { bg: "#DBEAFE", text: "#2563EB" };
      case "malayalam_thesaurus":
        return { bg: "#CCFBF1", text: "#0D9488" };
      default:
        return { bg: "#E0F2FE", text: "#0284C7" };
    }
  };

  // Filter and search
  const filteredFavorites = favorites.filter((f) => {
    const matchesFilter =
      selectedFilter === "all" || f.dictionaryType === selectedFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      f.word.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (f.meaning && f.meaning.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="dark" />

      {/* Floating Letters Background Layer */}
      <FloatingLettersBackground />

      <View style={styles.contentWrapper}>
        {/* ===================== TOP HEADER ===================== */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/")}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTitleCenter}>
            <Text style={styles.headerTitle}>പ്രിയപ്പെട്ടവ (Favorites)</Text>
            <Text style={styles.headerSubtitle}>പഠനത്തിനായി സൂക്ഷിച്ച വാക്കുകൾ</Text>
          </View>

          {favorites.length > 0 ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* ===================== SEARCH & FILTER STRIP ===================== */}
        <View style={styles.controlsSection}>
          {/* Search bar inside favorites */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="പ്രിയപ്പെട്ടവയിൽ തിരയുക..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsRow}>
            {[
              { key: "all", label: "എല്ലാം (All)" },
              { key: "english_malayalam", label: "Eng - Mal" },
              { key: "malayalam_english", label: "Mal - Eng" },
              { key: "malayalam_malayalam", label: "Mal - Mal" },
              { key: "malayalam_thesaurus", label: "Thesaurus" },
            ].map((f) => {
              const active = selectedFilter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setSelectedFilter(f.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ===================== FAVORITES LIST ===================== */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : filteredFavorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="star" size={38} color="#F59E0B" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? "വാക്കുകളൊന്നും കണ്ടെത്തിയില്ല" : "പ്രിയപ്പെട്ട വാക്കുകൾ ഇല്ല"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "നിങ്ങൾ തിരഞ്ഞ വാക്ക് പ്രിയപ്പെട്ടവയിൽ ഇല്ല."
                : "നിഘണ്ടുവിൽ വാക്കുകൾ തിരയുമ്പോൾ നക്ഷത്ര ചിഹ്നത്തിൽ (⭐) സ്പർശിച്ച് പഠിക്കാനായി വാക്കുകൾ ഇവിടെ സൂക്ഷിക്കാം."}
            </Text>

            {!searchQuery && (
              <TouchableOpacity
                style={styles.browseButton}
                activeOpacity={0.8}
                onPress={() => router.replace("/")}
              >
                <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.browseButtonText}>നിഘണ്ടുവിലേക്ക് പോകുക</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredFavorites}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const badgeStyle = getDictionaryBadgeColor(item.dictionaryType);
              const langCode = item.dictionaryType === "english_malayalam" ? "en" : "ml";

              return (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.88}
                  onPress={() => handleWordPress(item)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.wordTitleWrap}>
                      <Text style={styles.wordTitle}>{item.word}</Text>
                      <View style={[styles.dictBadge, { backgroundColor: badgeStyle.bg }]}>
                        <Text style={[styles.dictBadgeText, { color: badgeStyle.text }]}>
                          {getDictionaryLabel(item.dictionaryType)}
                        </Text>
                      </View>
                    </View>

                    {/* Actions: Speak & Remove Star */}
                    <View style={styles.actionsRow}>
                      <SpeakButton word={item.word} lang={langCode} />
                      <TouchableOpacity
                        style={styles.starButton}
                        onPress={() => handleRemove(item.id, item.word)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="star" size={22} color="#F59E0B" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {item.meaning ? (
                    <Text style={styles.meaningText} numberOfLines={2}>
                      • {item.meaning}
                    </Text>
                  ) : null}

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.viewDetailText}>കൂടുതൽ കാണുക (View Details)</Text>
                    <Ionicons name="chevron-forward" size={15} color="#2563EB" />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* ===================== BOTTOM NAVIGATION TAB BAR ===================== */}
      <BottomTabBar activeTab="favorites" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.9)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    height: "100%",
  },
  filterPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    marginRight: 8,
  },
  wordTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    marginRight: 8,
  },
  dictBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dictBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  meaningText: {
    fontSize: 13.5,
    color: "#334155",
    lineHeight: 19,
    marginTop: 8,
    fontFamily: "NotoSansMalayalam",
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  viewDetailText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#2563EB",
    marginRight: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
    fontFamily: "NotoSansMalayalam",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: "NotoSansMalayalam",
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "NotoSansMalayalam",
  },
});
