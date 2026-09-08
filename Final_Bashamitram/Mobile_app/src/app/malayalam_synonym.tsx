import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import AnimatedCard from "../components/AnimatedCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { saveRecentSearch } from "../utils/recentActivity";
import SpeakButton from "../components/SpeakButton";
import DictionarySearchBar from "../components/DictionarySearchBar";

import type { DictionaryEntry } from "../database/types";
import { searchSynonym } from "../database/dictionaryService";

const PAGE_SIZE = 20;

const MALAYALAM_ALPHABET = Object.freeze([
  "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "അം",
  "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ",
  "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന",
  "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ",
  "ഷ", "സ", "ഹ", "ള", "ഴ", "റ",
]);

export default function MalayalamSynonymScreen() {
  const [selectedLetter, setSelectedLetter] = useState("അ");
  const [searchText, setSearchText] = useState("");
  const [allEntries, setAllEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrollY] = useState(() => new Animated.Value(0));

  const loadEntries = useCallback(async (query: string = "അ", isMore = false) => {
    if (isMore) {
      if (isLoadingMore || !hasMore) return;
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setErrorMessage("");
    }

    try {
      const offset = isMore ? allEntries.length : 0;
      const rows = await searchSynonym(query, PAGE_SIZE, offset);

      if (isMore) {
        setAllEntries((prev) => [...prev, ...rows]);
      } else {
        setAllEntries(rows);
      }
      setHasMore(rows.length === PAGE_SIZE);
    } catch {
      if (!isMore) {
        setErrorMessage("വാക്കുകൾ ലോഡ് ചെയ്യാൻ സാധിച്ചില്ല.");
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
    if (searchText === "") return;

    const timer = setTimeout(() => {
      void loadEntries(searchText.trim(), false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (searchText.trim().length > 1) {
      const timer = setTimeout(() => {
        void saveRecentSearch(searchText.trim(), "synonym");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchText]);

  const handleCardPress = (word: string) => {
    router.push({
      pathname: "/malayalam_synonym_details",
      params: { word },
    });
  };

  const renderAlphabetItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.letterTab,
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
          selectedLetter === item && !searchText.trim() && styles.activeLetterText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item, index }: { item: DictionaryEntry; index: number }) => {
    const synonymsList = (item.synonyms ?? [])
      .flat(Infinity)
      .map((s) => String(s).trim())
      .filter(Boolean);
       

    return (
      <AnimatedCard index={index} scrollY={scrollY}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleCardPress(item.word)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.malayalamWord}>{item.word}</Text>
            </View>
            <SpeakButton word={item.word} lang="ml" />
          </View>

          <View style={styles.definitionBox}>
            {synonymsList.length > 0 ? (
              synonymsList.slice(0, 5).map((synonym, idx) => (
                <Text key={idx} style={styles.definitionText}>
                  • {synonym}
                </Text>
              ))
            ) : (
              <Text style={styles.definitionText}>No synonyms available</Text>
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
          <TouchableOpacity onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/");
                }
              }}>
            <Ionicons name="chevron-back" size={27} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>മലയാളം തെസോറസ് നിഘണ്ടു</Text>
          <View style={{ width: 27 }} />
        </View>
      </View>

      {/* Alphabet strip */}
      <View style={styles.alphabetContainer}>
        <TouchableOpacity
          style={[
            styles.clearFilterButton,
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
            size={18}
            color={selectedLetter === "" && searchText === "" ? "#9CA3AF" : "#EF4444"}
          />
        </TouchableOpacity>
        <FlatList
          horizontal
          data={MALAYALAM_ALPHABET}
          keyExtractor={(item) => item}
          renderItem={renderAlphabetItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetList}
          style={styles.alphabetFlatList}
        />
      </View>

      {/* Search bar */}
      <DictionarySearchBar
        value={searchText}
        placeholder="Explore synonyms..."
        onChangeText={(text) => setSearchText(text)}
        onSubmit={() => void loadEntries(searchText.trim(), false)}
      />

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader />
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadEntries(searchText.trim() || selectedLetter, false)}
          >
            <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={allEntries}
          keyExtractor={(item, index) =>
            (item.id ?? item.word ?? index).toString()
          }
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
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
              <Text style={styles.stateTitle}>വാക്ക് കണ്ടെത്താനായില്ല</Text>
              <Text style={styles.stateText}>
                {searchText.trim()
                  ? `"${searchText}" എന്ന വാക്കിന് പര്യായപദങ്ങൾ കണ്ടെത്താൻ സാധിച്ചില്ല.`
                  : selectedLetter
                  ? `"${selectedLetter}" എന്ന അക്ഷരത്തിൽ തുടങ്ങുന്ന പര്യായപദങ്ങൾ നിലവിലില്ല.`
                  : "ഒരു അക്ഷരം തിരഞ്ഞെടുക്കുക."}
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
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
  },
  activeLetterText: { color: "#FFFFFF" },
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
  malayalamWord: {
    color: "#1F2330",
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  definitionBox: {
    backgroundColor: "#F7F7F9",
    borderLeftColor: "#9333EA",
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
    fontFamily: "NotoSansMalayalam",
    marginBottom: 6,
  },
  stateText: {
    color: "#6D625A",
    fontSize: 14,
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
    lineHeight: 20,
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
