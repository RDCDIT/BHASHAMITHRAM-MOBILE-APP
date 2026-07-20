/**
 * @file english_malayalam.tsx
 * @description English-Malayalam dictionary browse screen.
 *              Letter filtering is done server-side — clicking a letter fetches
 *              only that letter's words from the backend (no client-side slice cap).
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import AnimatedCard from "../components/AnimatedCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { saveRecentSearch } from "../utils/recentActivity";
import SpeakButton from "../components/SpeakButton";

type DictionaryEntry = {
  _id: string;
  word: string;
  meanings?: { meaning: string; context_usage?: string }[];
  Category?: {
    category?: string;
    meaning?: string;
    meanings?: string;
    context_usage?: string;
    context?: string;
  }[];
};

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
   "http://192.168.3.148:5000",
].filter((value): value is string => Boolean(value));

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function EnglishMalayalamScreen() {
  const [selectedLetter, setSelectedLetter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [allEntries, setAllEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrollY] = useState(() => new Animated.Value(0));

  // Fetch words for a given letter prefix from the backend (server-side filtering)
  const loadEntries = useCallback(async (letterQuery: string = "") => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          const encodedQuery = encodeURIComponent(letterQuery);
          const response = await fetch(
            `${apiBaseUrl}/api/english-malayalam/browse-english?query=${encodedQuery}`
          );

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setAllEntries(Array.isArray(data) ? data : []);
          return;
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error("Could not reach the dictionary backend.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load dictionary entries."
      );
      setAllEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial entries on mount
  useEffect(() => {
    void loadEntries("");
  }, [loadEntries]);

  // Re-fetch from backend whenever selected letter changes
  useEffect(() => {
    void loadEntries(selectedLetter);
  }, [selectedLetter, loadEntries]);

  // Save search text for recent activity
  useEffect(() => {
    if (searchText.trim().length > 1) {
      const timer = setTimeout(() => {
        void saveRecentSearch(searchText.trim(), "english");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchText]);

  // Client-side text search only (letter filtering is done server-side)
  const filteredEntries = useMemo(() => {
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      return allEntries.filter((e) => (e.word || "").toLowerCase().includes(q));
    }
    return allEntries;
  }, [allEntries, searchText]);

  const handleCardPress = (id: string) => {
    router.push({
      pathname: "/english_malayalam_details",
      params: { dictionaryId: id },
    });
  };

  const renderAlphabetItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.letterTab,
        selectedLetter === item && !searchText.trim() && styles.activeLetterTab,
      ]}
      onPress={() => {
        setSearchText("");
        setSelectedLetter(item);
      }}
    >
      <Text
        style={[
          styles.letterText,
          selectedLetter === item && !searchText.trim() && styles.activeLetterText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item, index }: { item: DictionaryEntry; index: number }) => {
    // Primary: backend-formatted meanings[]
    let displayMeanings: { meaning: string; context_usage?: string }[] =
      (item.meanings || []).filter((m) => m.meaning?.trim());

    // Fallback: raw Category array
    if (displayMeanings.length === 0 && Array.isArray(item.Category)) {
      item.Category.forEach((c) => {
        const text = c.meanings || c.meaning || "";
        if (text.trim()) {
          displayMeanings.push({ meaning: text, context_usage: c.context_usage || c.context || "" });
        }
      });
    }

    return (
      <AnimatedCard index={index} scrollY={scrollY}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleCardPress(item._id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.englishWord}>{item.word}</Text>
            </View>
            <SpeakButton word={item.word} lang="en" />
          </View>

          <View style={styles.definitionBox}>
            <Text style={styles.definitionHeader}>മലയാളം അർത്ഥം</Text>

            {displayMeanings.length === 0 ? (
              <Text style={styles.definitionText}>No meaning available</Text>
            ) : displayMeanings.length > 5 ? (
              <View style={styles.twoColRow}>
                <View style={styles.twoColLeft}>
                  {displayMeanings.slice(0, 5).map((m, idx) => (
                    <Text key={idx} style={[styles.definitionText, { marginBottom: idx < 4 ? 4 : 0 }]}>
                      • {m.meaning}
                    </Text>
                  ))}
                </View>
                <View style={styles.twoColDivider} />
                <View style={styles.twoColRight}>
                  {displayMeanings.slice(5).map((m, idx) => (
                    <Text key={idx} style={[styles.definitionText, { marginBottom: 4 }]}>
                      • {m.meaning}
                    </Text>
                  ))}
                </View>
              </View>
            ) : (
              displayMeanings.map((m, idx) => (
                <Text key={idx} style={[styles.definitionText, { marginBottom: idx < displayMeanings.length - 1 ? 5 : 0 }]}>
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={27} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ഇംഗ്ലീഷ് - മലയാളം നിഘണ്ടു</Text>
          <View style={{ width: 27 }} />
        </View>
      </View>

      {/* Alphabet strip */}
      <View style={styles.alphabetContainer}>
        <TouchableOpacity
          style={[
            styles.clearFilterButton,
            selectedLetter === "" && styles.clearFilterButtonDisabled,
          ]}
          onPress={() => setSelectedLetter("")}
          disabled={selectedLetter === ""}
          activeOpacity={0.7}
        >
          <Ionicons
            name="funnel-outline"
            size={18}
            color={selectedLetter === "" ? "#9CA3AF" : "#EF4444"}
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Explore words..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#898683"
        />
        <TouchableOpacity
          onPress={() => void loadEntries(selectedLetter)}
          style={styles.searchButton}
        >
          <Ionicons name="search" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader />
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Unable to load entries</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadEntries(selectedLetter)}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredEntries}
          keyExtractor={(item, index) => (item._id || index).toString()}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
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
    height: Platform.OS === "android" ? 75 : 95,
    backgroundColor: "#2B2C51",
    justifyContent: "flex-end",
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  alphabetContainer: {
    backgroundColor: "#F9F6F1",
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  alphabetFlatList: { flex: 1 },
  clearFilterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE6DF",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  clearFilterButtonDisabled: { opacity: 0.5 },
  alphabetList: { paddingHorizontal: 4 },
  letterTab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE6DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  activeLetterTab: {
    backgroundColor: "#2B2C51",
    borderColor: "#2B2C51",
    shadowOpacity: 0.12,
    elevation: 3,
  },
  letterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2B2C51",
  },
  activeLetterText: { color: "#FFFFFF" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EAE6DF",
    paddingLeft: 18,
    paddingRight: 4,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    padding: 0,
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2B2C51",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderText: { flex: 1 },
  englishWord: {
    color: "#1F2330",
    fontSize: 20,
    fontWeight: "800",
  },
  definitionBox: {
    backgroundColor: "#F7F7F9",
    borderLeftColor: "#E07B54",
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  definitionHeader: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F2330",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "NotoSansMalayalam",
  },
  definitionText: {
    color: "#4E473E",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "NotoSansMalayalam",
  },
  twoColRow: { flexDirection: "row" },
  twoColLeft: { flex: 1 },
  twoColDivider: { width: 1, backgroundColor: "#E5E0D8", marginHorizontal: 10 },
  twoColRight: { flex: 1 },
  stateContainer: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: "#1F2330",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  stateText: {
    color: "#6D625A",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "NotoSansMalayalam",
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#2B2C51",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
