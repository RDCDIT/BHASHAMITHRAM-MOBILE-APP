import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Updated type mapping to align directly with your MongoDB query projections
type DictionaryEntry = {
  id: number;
  english_equivalent: string;
  word: string; // Malayalam Word
  primary_malayalam_meaning: string;
};

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000",
  "http://192.168.1.2:5000",
].filter((value): value is string => Boolean(value));

// Alphabet list for the browser menu layout
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function EnglishMalayalamScreen() {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [searchText, setSearchText] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadEntries = async (letter: string) => {
    try {
      if (!isRefreshing) setIsLoading(true);
      setErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Dictionary Browse] Fetching entries for letter ${letter} from ${apiBaseUrl}`);

          const response = await fetch(`${apiBaseUrl}/api/words/browse?letter=${letter}`);
          console.log(`[Dictionary Browse] Response status for ${letter}: ${response.status}`);

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setEntries(Array.isArray(data) ? data : []);
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
      setEntries([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Reload data dynamically whenever the user switches alphabet tabs
  useEffect(() => {
    void loadEntries(selectedLetter);
  }, [selectedLetter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadEntries(selectedLetter);
  };

  // Fast client-side filter for local array items
  const filteredEntries = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return entries;

    return entries.filter((entry) => {
      const engWord = entry.english_equivalent?.toLowerCase() ?? "";
      const malWord = entry.word ?? "";
      const primaryMeaning = entry.primary_malayalam_meaning?.toLowerCase() ?? "";

      return engWord.includes(query) || malWord.includes(query) || primaryMeaning.includes(query);
    });
  }, [entries, searchText]);

  const handleCardPress = (id: number) => {
    // Stage 2: Rout to the detailed overlay template passing down the target Dictionary ID reference hook
    router.push({
      pathname: "/details",
      params: { dictionaryId: id },
    });
  };

  const renderAlphabetItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.letterTab, selectedLetter === item && styles.activeLetterTab]}
      onPress={() => setSelectedLetter(item)}
    >
      <Text style={[styles.letterText, selectedLetter === item && styles.activeLetterText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item }: { item: DictionaryEntry }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleCardPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.wordBadge}>
          <Text style={styles.wordBadgeText}>
            {item.english_equivalent?.[0]?.toUpperCase() ?? "?"}
          </Text>
        </View>

        <View style={styles.cardHeaderText}>
          <Text style={styles.englishWord}>{item.english_equivalent}</Text>
          <Text style={styles.cardSubtext}>{item.word}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#BCAFA1" />
      </View>

      <View style={styles.meaningsWrap}>
        <View style={styles.meaningPill}>
          <Text style={styles.meaningText} numberOfLines={2}>
            {item.primary_malayalam_meaning}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Header Layout */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={27} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ഇംഗ്ലീഷ് - മലയാളം നിഘണ്ടു</Text>
        <View style={{ width: 12 }} />
      </View>

      {/* Dynamic Alphabet Filter Strip Menu */}
      <View style={styles.alphabetContainer}>
        <FlatList
          horizontal
          data={ALPHABET}
          keyExtractor={(item) => item}
          renderItem={renderAlphabetItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetList}
        />
      </View>

      {/* Input Search Container */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search words starting with '${selectedLetter}'...`}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#898683"
        />
      </View>

      {/* Core Component State Engine Rendering */}
      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#2B2C51" />
          <Text style={styles.stateText}>Loading dictionary entries...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Unable to load entries</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadEntries(selectedLetter)}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#2B2C51"
              colors={["#2B2C51"]}
            />
          }
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9F6F1",
  },
  header: {
    height: Platform.OS === "android" ? 70 : 90,
    backgroundColor: "#2B2C51",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 5,
  },
  alphabetContainer: {
    backgroundColor: "#F9F6F1",
    borderBottomWidth: 1,
    borderColor: "#E7E0D7",
    paddingVertical: 10,
  },
  alphabetList: {
    paddingHorizontal: 12,
  },
  letterTab: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#F4EEE7",
  },
  activeLetterTab: {
    backgroundColor: "#2B2C51",
  },
  letterText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4E473E",
  },
  activeLetterText: {
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd7cf",
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    padding: 0,
    fontFamily: "NotoSansMalayalam",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E7E0D7",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  wordBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2B2C51",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  wordBadgeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  cardHeaderText: {
    flex: 1,
  },
  englishWord: {
    color: "#1F2330",
    fontSize: 18,
    fontWeight: "800",
  },
  cardSubtext: {
    color: "#7C736B",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 1,
    fontFamily: "NotoSansMalayalam",
  },
  meaningsWrap: {
    flexDirection: "row",
  },
  meaningPill: {
    backgroundColor: "#F4EEE7",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2D7CB",
    flex: 1,
  },
  meaningText: {
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