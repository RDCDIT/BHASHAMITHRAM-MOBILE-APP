import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useVoiceSearch } from "../hooks/useVoiceSearch";
import VoiceSearchOverlay from "../components/VoiceSearchOverlay";

import AnimatedCard from "../components/AnimatedCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { saveRecentSearch } from "../utils/recentActivity";
import SpeakButton from "../components/SpeakButton";

// Updated type mapping to align directly with your MongoDB query projections
type DictionaryEntry = {
  id: number;
  english_equivalent: string;
  word: string; // Malayalam Word
  primary_malayalam_meaning: string;
  _id: string;
};

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000",
  "http://192.168.1.2:5000",
].filter((value): value is string => Boolean(value));

// Alphabet list for the browser menu layout
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function EnglishMalayalamScreen() {
  const [selectedLetter, setSelectedLetter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [allEntries, setAllEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    isListening,
    partialTranscript,
    startListening,
    stopListening,
  } = useVoiceSearch((text) => setSearchText(text), "en-US");

  const loadEntries = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      setErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Dictionary Browse] Fetching all entries from ${apiBaseUrl}`);
          const response = await fetch(`${apiBaseUrl}/api/english-english?query=`);

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

      throw lastError instanceof Error ? lastError : new Error("Could not reach the dictionary backend.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load dictionary entries right now."
      );
      setAllEntries([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load entries once on mount
  useEffect(() => {
    void loadEntries();
  }, []);

  // Save search queries with a debounce
  useEffect(() => {
    if (searchText.trim().length > 1) {
      const delayDebounceFn = setTimeout(() => {
        void saveRecentSearch(searchText.trim(), "english");
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchText]);

  // Client-side real-time filtering
  const filteredEntries = useMemo(() => {
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      return allEntries.filter((entry) =>
        (entry.english_equivalent || "").toLowerCase().includes(query)
      );
    }
    if (selectedLetter) {
      const letter = selectedLetter.toUpperCase();
      return allEntries.filter((entry) =>
        (entry.english_equivalent || "").toUpperCase().startsWith(letter)
      );
    }
    return allEntries;
  }, [allEntries, searchText, selectedLetter]);

  const handleCardPress = (id: number) => {
    router.push({
      pathname: "/english_details",
      params: { dictionaryId: id, type: "english" },
    });
  };

  const renderAlphabetItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.letterTab, selectedLetter === item && !searchText.trim() && styles.activeLetterTab]}
      onPress={() => {
        setSearchText(""); // Clear search when alphabet is clicked
        setSelectedLetter(item);
      }}
    >
      <Text style={[styles.letterText, selectedLetter === item && !searchText.trim() && styles.activeLetterText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item, index }: { item: DictionaryEntry; index: number }) => {
    const meanings = item.primary_malayalam_meaning
      ? item.primary_malayalam_meaning.split(",").map((m) => m.trim()).filter(Boolean)
      : [];

    return (
      <AnimatedCard index={index} scrollY={scrollY}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleCardPress(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.englishWord}>{item.english_equivalent}</Text>
            </View>
            <SpeakButton word={item.english_equivalent} lang="en" />
          </View>

          <View style={styles.definitionBox}>
            <Text style={styles.definitionHeader}>Definition</Text>
            {meanings.length > 0 ? (
              meanings.map((meaning, index) => (
                <Text key={index} style={styles.definitionText}>
                  • {meaning}
                </Text>
              ))
            ) : (
              <Text style={styles.definitionText}>No meaning available</Text>
            )}
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header Layout */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={27} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ഇംഗ്ലീഷ് - ഇംഗ്ലീഷ് നിഘണ്ടു</Text>
          <View style={{ width: 27 }} />
        </View>
      </View>

      {/* Dynamic Alphabet Filter Strip Menu */}
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

      {/* Input Search Container */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Explore words..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#898683"
        />
        <TouchableOpacity onPress={startListening} style={styles.micButton}>
          <Ionicons name="mic-outline" size={20} color="#2B2C51" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => void loadEntries()} style={styles.searchButton}>
          <Ionicons name="search" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Core Component State Engine Rendering */}
      {isLoading ? (
        <SkeletonLoader />
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Unable to load entries</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadEntries()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredEntries}
          keyExtractor={(item, index) => (item.id || item._id || index).toString()}
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
                  ? "Try a different English word or local keyword variation."
                  : `No records initialized under alphabet group category '${selectedLetter}' yet.`}
              </Text>
            </View>
          }
        />
      )}
      <VoiceSearchOverlay
        visible={isListening}
        partialTranscript={partialTranscript}
        lang="en-US"
        onClose={stopListening}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9F6F1",
  },
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
  alphabetFlatList: {
    flex: 1,
  },
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
  clearFilterButtonDisabled: {
    opacity: 0.5,
  },
  alphabetList: {
    paddingHorizontal: 4,
  },
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
  activeLetterText: {
    color: "#FFFFFF",
  },
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
    fontFamily: "NotoSansMalayalam",
  },
  micButton: {
    padding: 8,
    marginRight: 4,
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2B2C51",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
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
  cardHeaderText: {
    flex: 1,
  },
  englishWord: {
    color: "#2B2C51",
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "Roboto"
  },
  cardSubtext: {
    color: "#2B2C51",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "NotoSansMalayalam",
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#F0EAE1",
  },
  directionBadgeText: {
    color: "#4E473E",
    fontSize: 12,
    fontWeight: "700",
  },
  playButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2B2C51",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  definitionBox: {
    backgroundColor: "#F7F7F9",
    borderLeftColor: "#43AC98",
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
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});