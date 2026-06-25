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

type SynonymEntry = {
  _id: string | number;
  word: string;
  synonyms: string[];
};

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000",
  "http://192.168.1.2:5000",
].filter((value): value is string => Boolean(value));

const MALAYALAM_ALPHABET = [
  "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "അം",
  "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ",
  "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന",
  "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ശ",
  "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
];

export default function MalayalamSynonymScreen() {
  const [selectedLetter, setSelectedLetter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [allEntries, setAllEntries] = useState<SynonymEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    isListening,
    partialTranscript,
    startListening,
    stopListening,
  } = useVoiceSearch((text) => setSearchText(text), "ml-IN");

  const loadEntries = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      setErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Synonyms Browse] Fetching all entries from ${apiBaseUrl}`);
          const response = await fetch(
            `${apiBaseUrl}/api/synonyms?search=&limit=1000`
          );

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          const recordsList = data && Array.isArray(data.records) ? data.records : [];
          setAllEntries(recordsList);
          return;
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error("Could not reach the dictionary backend.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "വാക്കുകൾ ലോഡ് ചെയ്യാൻ സാധിച്ചില്ല."
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
        void saveRecentSearch(searchText.trim(), "synonym");
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchText]);

  // Client-side real-time filtering
  const filteredEntries = useMemo(() => {
    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      return allEntries.filter((entry) =>
        (entry.word || "").toLowerCase().includes(query)
      );
    }
    if (selectedLetter) {
      const letter = selectedLetter;
      return allEntries.filter((entry) =>
        (entry.word || "").startsWith(letter)
      );
    }
    return allEntries;
  }, [allEntries, searchText, selectedLetter]);

  const handleCardPress = (id: string | number) => {
    router.push({
      pathname: "/malayalam_synonym_details" as any,
      params: { dictionaryId: String(id) },
    });
  };

  const renderAlphabetItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.letterTab, selectedLetter === item && !searchText.trim() && styles.activeLetterTab]}
      onPress={() => {
        setSearchText("");
        setSelectedLetter(item);
      }}
    >
      <Text style={[styles.letterText, selectedLetter === item && !searchText.trim() && styles.activeLetterText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item, index }: { item: SynonymEntry; index: number }) => {
    const synonymsList = Array.isArray(item.synonyms)
      ? item.synonyms
      : (item.synonyms ? String(item.synonyms).split(",").map((s) => s.trim()).filter(Boolean) : []);

    return (
      <AnimatedCard index={index} scrollY={scrollY}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleCardPress(item._id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.malayalamWord}>{item.word}</Text>
            </View>
            <SpeakButton word={item.word} lang="ml" />
          </View>

          <View style={styles.definitionBox}>
            <Text style={styles.definitionHeader}>പര്യായപദങ്ങൾ / Synonyms</Text>
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={27} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>പര്യായപദ നിഘണ്ടു</Text>
          <View style={{ width: 27 }} />
        </View>
      </View>

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
          data={MALAYALAM_ALPHABET}
          keyExtractor={(item) => item}
          renderItem={renderAlphabetItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetList}
          style={styles.alphabetFlatList}
        />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Explore synonyms..."
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

      {isLoading ? (
        <SkeletonLoader />
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadEntries()}>
            <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
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
              <Text style={styles.stateTitle}>വാക്കുകൾ കണ്ടെത്തിയില്ല</Text>
              <Text style={styles.stateText}>
                {searchText.trim()
                  ? `"${searchText}" എന്ന വാക്കിന് പര്യായപദങ്ങൾ കണ്ടെത്താൻ സാധിച്ചില്ല.`
                  : `"${selectedLetter}" എന്ന അക്ഷരത്തിൽ തുടങ്ങുന്ന പര്യായപദങ്ങൾ നിലവിലില്ല.`}
              </Text>
            </View>
          }
        />
      )}
      <VoiceSearchOverlay
        visible={isListening}
        partialTranscript={partialTranscript}
        lang="ml-IN"
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
    backgroundColor: "rgba(255, 255, 255, 0.6)",
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
  malayalamWord: {
    color: "#1F2330",
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
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
