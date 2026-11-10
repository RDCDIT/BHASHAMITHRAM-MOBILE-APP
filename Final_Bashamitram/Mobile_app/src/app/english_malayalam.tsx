import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import AnimatedCard from "../components/AnimatedCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { saveRecentSearch } from "../utils/recentActivity";
import SpeakButton from "../components/SpeakButton";
import FavoriteButton from "../components/FavoriteButton";
import DictionarySearchBar from "../components/DictionarySearchBar";
import FloatingLettersBackground from "../components/FloatingLettersBackground";

import { searchEnglish } from "../database/dictionaryService";
import type { DictionaryEntry } from "../database/types";
import { useResponsive } from "../utils/responsive";

const PAGE_SIZE = 20;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function EnglishMalayalamScreen() {
  const {
    headerHeight,
    headerTitleFontSize,
    headerSubtitleFontSize,
    dictCardPadding,
    dictCardMargin,
    dictCardRadius,
    dictWordFontSize,
    dictMeaningFontSize,
    alphabetTabSize,
    alphabetFontSize,
    alphabetPadding,
    horizontalPadding,
    isSmallPhone,
  } = useResponsive();

  const { query } = useLocalSearchParams<{ query?: string }>();
  const [selectedLetter, setSelectedLetter] = useState(query ? "" : "A");
  const [searchText, setSearchText] = useState(query || "");
  const [allEntries, setAllEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrollY] = useState(() => new Animated.Value(0));

  const loadEntries = useCallback(async (query: string = "A", isMore = false) => {
    if (isMore) {
      if (isLoadingMore || !hasMore) return;
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setErrorMessage("");
    }

    try {
      const offset = isMore ? allEntries.length : 0;
      const rows = await searchEnglish(query, PAGE_SIZE, offset);

      if (isMore) {
        setAllEntries((prev) => [...prev, ...rows]);
      } else {
        setAllEntries(rows);
      }
      setHasMore(rows.length === PAGE_SIZE);
    } catch {
      if (!isMore) {
        setErrorMessage("Could not load dictionary entries.");
        setAllEntries([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [allEntries.length, isLoadingMore, hasMore]);

  useEffect(() => {
    if (selectedLetter) {
      void loadEntries(selectedLetter, false);
    }
  }, [selectedLetter]);

  useEffect(() => {
    if (searchText === "") {
      if (selectedLetter) {
        void loadEntries(selectedLetter, false);
      }
      return;
    }

    const timer = setTimeout(() => {
      void loadEntries(searchText.trim(), false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchText, selectedLetter]);

  useEffect(() => {
    if (searchText.trim().length > 1) {
      const timer = setTimeout(() => {
        void saveRecentSearch(searchText.trim(), "english", "english_malayalam");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchText]);

  const handleCardPress = (word: string) => {
    router.push({
      pathname: "/english_malayalam_details",
      params: { word },
    });
  };

  const renderAlphabetItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.letterTab,
        {
          width: alphabetTabSize,
          height: alphabetTabSize,
          borderRadius: Math.round(alphabetTabSize / 2),
          marginHorizontal: isSmallPhone ? 3 : 5,
        },
        selectedLetter === item && !searchText.trim() && styles.activeLetterTab,
      ]}
      onPress={() => {
        setSelectedLetter(item);
        setSearchText("");
      }}
    >
      <Text
        style={[
          styles.letterText,
          { fontSize: alphabetFontSize },
          selectedLetter === item && !searchText.trim() && styles.activeLetterText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({
    item,
    index,
  }: {
    item: DictionaryEntry;
    index: number;
  }) => {
    const displayMeanings =
      (item.meanings ?? []).filter((m) => m.meaning?.trim());

    const previewMeanings = displayMeanings.slice(0, 3);
    const pos =
      item.category_names?.[0] ||
      item.categories?.[0]?.category ||
      (Array.isArray(item.category) ? item.category[0] : item.category);

    return (
      <AnimatedCard index={index} scrollY={scrollY}>
        <TouchableOpacity
          style={[
            styles.card,
            {
              padding: dictCardPadding,
              marginBottom: dictCardMargin,
              borderRadius: dictCardRadius,
            },
          ]}
          onPress={() => handleCardPress(item.word)}
          activeOpacity={0.7}
        >
          <View style={[styles.cardHeader, { marginBottom: isSmallPhone ? 8 : 12 }]}>
            <View style={styles.cardHeaderText}>
              <View style={styles.wordTitleRow}>
                <Text style={[styles.englishWord, { fontSize: dictWordFontSize }]}>{item.word}</Text>
                {pos ? (
                  <View style={styles.posBadge}>
                    <Text style={styles.posBadgeText}>{pos}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.cardActionRow}>
              <SpeakButton word={item.word} lang="en" />
              <FavoriteButton
                word={item.word}
                dictionaryType="english_malayalam"
                meaning={previewMeanings[0]?.meaning}
                partOfSpeech={pos}
                size={32}
              />
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </View>

          <View style={[styles.definitionBox, { padding: isSmallPhone ? 10 : 14, borderRadius: Math.max(10, dictCardRadius - 4) }]}>
            {previewMeanings.length === 0 ? (
              <Text style={[styles.definitionText, { fontSize: dictMeaningFontSize }]}>
                No meaning available
              </Text>
            ) : (
              previewMeanings.slice(0, 3).map((m, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.definitionText,
                    {
                      fontSize: dictMeaningFontSize,
                      lineHeight: Math.round(dictMeaningFontSize * 1.45),
                      marginBottom:
                        idx < previewMeanings.length - 1 ? (isSmallPhone ? 3 : 5) : 0,
                    },
                  ]}
                >
                  • {m.meaning}
                </Text>
              ))
            )}
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  return (
    <View style={styles.screen}>
      <FloatingLettersBackground />
      {/* Header (Matching Screen 2) */}
      <View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBackButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>ഭാഷാമിത്രം II</Text>
            <Text style={[styles.headerSubtitle, { fontSize: headerSubtitleFontSize }]}>ഇംഗ്ലീഷ് - മലയാളം പദസേതു</Text>
          </View>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.headerEmblem}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Alphabet strip */}
      <View style={[styles.alphabetContainer, { paddingVertical: alphabetPadding, paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[
            styles.clearFilterButton,
            {
              width: alphabetTabSize,
              height: alphabetTabSize,
              borderRadius: Math.round(alphabetTabSize / 2),
            },
            selectedLetter === "" && searchText === "" && styles.clearFilterButtonDisabled,
          ]}
          onPress={() => {
            setSelectedLetter("");
            setSearchText("");
            void loadEntries("", false);
          }}
          disabled={selectedLetter === "" && searchText === ""}
          activeOpacity={0.7}
        >
          <Ionicons
            name="funnel-outline"
            size={isSmallPhone ? 16 : 18}
            color={selectedLetter === "" && searchText === "" ? "#9CA3AF" : "#EF4444"}
          />
        </TouchableOpacity>
        <FlatList
          horizontal
          data={ALPHABET}
          keyExtractor={(item) => item}
          renderItem={renderAlphabetItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetList}
          style={styles.alphabetFlatList}
        />
      </View>

      {/* Search bar */}
      <DictionarySearchBar
        lang="en"
        value={searchText}
        placeholder="Explore words..."
        onChangeText={(text) => setSearchText(text)}
        onSubmit={() => void loadEntries(searchText.trim(), false)}
      />

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader />
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Unable to load entries</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadEntries(searchText.trim() || selectedLetter, false)}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          renderItem={renderEntry}
          data={allEntries}
          keyExtractor={(item, index) => (item.id ?? item.word ?? index).toString()}
          contentContainerStyle={[
            styles.listContent,
            {
              padding: horizontalPadding,
              paddingBottom: Math.round(dictCardMargin * 2.5),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          onEndReached={() => {
            if (hasMore && !isLoadingMore && !isLoading) {
              const activeQuery = searchText.trim() || selectedLetter || "";
              void loadEntries(activeQuery, true);
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#2B2C51" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <Text style={styles.stateTitle}>No matches found</Text>
              <Text style={styles.stateText}>
                {searchText.trim()
                  ? `No results for "${searchText}".`
                  : selectedLetter
                  ? `No entries found under letter '${selectedLetter}'.`
                  : "Select a letter to browse."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  header: {
    height: Platform.OS === "android" ? 82 : 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "flex-end",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  headerBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
    marginTop: 1,
  },
  headerEmblem: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  alphabetContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  alphabetFlatList: { flex: 1 },
  clearFilterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  clearFilterButtonDisabled: { opacity: 0.5 },
  alphabetList: { paddingHorizontal: 4 },
  letterTab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeLetterTab: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  letterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  activeLetterText: { color: "#FFFFFF", fontWeight: "800" },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderText: { flex: 1, marginRight: 8 },
  wordTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  englishWord: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },
  posBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  posBadgeText: {
    color: "#0284C7",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "lowercase",
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  definitionBox: {
    backgroundColor: "#F8FAFC",
    borderLeftColor: "#2563EB",
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 12,
    marginTop: 2,
  },
  definitionText: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "NotoSansMalayalam",
  },
  stateContainer: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  stateText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "NotoSansMalayalam",
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
