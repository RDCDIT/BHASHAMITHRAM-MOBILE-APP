import React, { useEffect, useState } from "react";
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

// ബാക്കെൻഡ് റെസ്പോൺസ് ഘടനയ്ക്ക് അനുയോജ്യമായ ടൈപ്പ് ഡെഫനിഷൻ
type SynonymEntry = {
  id: number;
  word: string; // മലയാളം വാക്ക്
  synonyms: string; // പര്യായപദങ്ങൾ
};

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000",
  "http://192.168.1.2:5000",
].filter((value): value is string => Boolean(value));

// മലയാളം സ്വരാക്ഷരങ്ങളും പ്രധാന വ്യഞ്ജനാക്ഷരങ്ങളും അടങ്ങിയ ലിസ്റ്റ് (Browsing എളുപ്പമാക്കാൻ)
const MALAYALAM_ALPHABET = [
  "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ",
  "ക", "ഖ", "ഗ", "ഘ", "ച", "ഛ", "ജ", "ഝ", "ട", "ഠ", "ഡ", "ഢ",
  "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", 
  "ല", "വ", "ശ", "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"
];

export default function Naanarthscreen() {
  const [selectedLetter, setSelectedLetter] = useState("അ");
  const [searchText, setSearchText] = useState("");
  const [entries, setEntries] = useState<SynonymEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ബാക്കെൻഡിൽ നിന്നും മലയാളം പര്യായപദങ്ങൾ ഫെച്ച് ചെയ്യാനുള്ള ഫങ്ഷൻ
  const loadEntries = async (searchQuery: string) => {
    try {
      if (!isRefreshing) setIsLoading(true);
      setErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Synonyms Browse] Fetching entries for query "${searchQuery}" from ${apiBaseUrl}`);
          const response = await fetch(
            `${apiBaseUrl}/api/words/browse-synonyms?query=${encodeURIComponent(searchQuery)}`
          );

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setEntries(Array.isArray(data) ? data : []);
          return; // Success, exit function
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error("Could not reach the dictionary backend.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "വാക്കുകൾ ലോഡ് ചെയ്യാൻ സാധിച്ചില്ല."
      );
      setEntries([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // ഉപയോക്താവ് ഒരു അക്ഷരം തിരഞ്ഞെടുക്കുമ്പോൾ ആ അക്ഷരത്തിലുള്ള വാക്കുകൾ ലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    // സെർച്ച് ബാറിൽ ഒന്നും ടൈപ്പ് ചെയ്തിട്ടില്ലെങ്കിൽ മാത്രം അക്ഷരത്തെ അടിസ്ഥാനമാക്കി തിരയുക
    if (!searchText.trim()) {
      void loadEntries(selectedLetter);
    }
  }, [selectedLetter]);

  // സെർച്ച് ബാറിൽ ടൈപ്പ് ചെയ്യുമ്പോൾ ഡൈനാമിക് ആയി ബാക്കെൻഡ് ഫെച്ച് ചെയ്യുക
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText.trim()) {
        void loadEntries(searchText);
      } else {
        void loadEntries(selectedLetter);
      }
    }, 400); // 400ms ഡെബോൺസ് ടൈം (ടൈപ്പിംഗ് നിർത്തുമ്പോൾ മാത്രം റിക്വസ്റ്റ് അയക്കാൻ)

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEntries(searchText.trim() ? searchText : selectedLetter);
  };

  const handleCardPress = (id: number) => {
    router.push({
      pathname: "/details",
      params: { dictionaryId: id },
    });
  };

  const renderAlphabetItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.letterTab, selectedLetter === item && !searchText.trim() && styles.activeLetterTab]}
      onPress={() => {
        setSearchText(""); // അക്ഷരം ക്ലിക്ക് ചെയ്യുമ്പോൾ സെർച്ച് ക്ലിയർ ചെയ്യുക
        setSelectedLetter(item);
      }}
    >
      <Text style={[styles.letterText, selectedLetter === item && !searchText.trim() && styles.activeLetterText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item }: { item: SynonymEntry }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleCardPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.wordBadge}>
          <Text style={styles.wordBadgeText}>
            {item.word?.[0] ?? "അ"}
          </Text>
        </View>

        <View style={styles.cardHeaderText}>
          <Text style={styles.malayalamWord}>{item.word}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#00D2FF" />
      </View>

      <View style={styles.meaningsWrap}>
        <View style={styles.meaningPill}>
          <Text style={styles.meaningText} numberOfLines={3}>
            <Text style={{ fontWeight: "700", color: "#00D2FF" }}>പര്യായപദങ്ങൾ: </Text>
            {item.synonyms}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>നാനാർത്ഥ നിഘണ്ടു</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* മലയാളം അക്ഷരങ്ങളുടെ തിരശ്ചീന ലിസ്റ്റ് (Horizontal Alphabet Strip) */}
      <View style={styles.alphabetContainer}>
        <FlatList
          horizontal
          data={MALAYALAM_ALPHABET}
          keyExtractor={(item) => item}
          renderItem={renderAlphabetItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetList}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E9BB4" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ടൈപ്പ് ചെയ്ത് തിരയുക..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#64748B"
        />
      </View>

      {/* UI State Logic */}
      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#00D2FF" />
          <Text style={styles.stateText}>വാക്കുകൾ കണ്ടെത്തുന്നു...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadEntries(selectedLetter)}>
            <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00D2FF"
              colors={["#00D2FF"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <Text style={styles.stateTitle}>വാക്കുകൾ കണ്ടെത്തിയില്ല</Text>
              <Text style={styles.stateText}>
                {searchText.trim()
                  ? `"${searchText}" എന്ന വാക്കിന് അനുയോജ്യമായ പര്യായപദങ്ങൾ കണ്ടെത്താൻ സാധിച്ചില്ല.`
                  : `"${selectedLetter}" എന്ന അക്ഷരത്തിൽ തുടങ്ങുന്ന പര്യായപദങ്ങളുള്ള വാക്കുകൾ നിലവിലില്ല.`}
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
    backgroundColor: "#090D16",
  },
  header: {
    height: Platform.OS === "android" ? 70 : 90,
    backgroundColor: "#0F1322",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#1E293B33",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 5,
    textAlign: "center",
    flex: 1,
  },
  alphabetContainer: {
    backgroundColor: "#090D16",
    borderBottomWidth: 1,
    borderColor: "#1E293B",
    paddingVertical: 12,
  },
  alphabetList: {
    paddingHorizontal: 12,
  },
  letterTab: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#131926",
    borderWidth: 1,
    borderColor: "#222B3F",
  },
  activeLetterTab: {
    backgroundColor: "#1B2335",
    borderColor: "#00D2FF",
    borderWidth: 1,
  },
  letterText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E9BB4",
    fontFamily: "NotoSansMalayalam",
  },
  activeLetterText: {
    color: "#00D2FF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131926",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222B3F",
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    padding: 0,
    fontFamily: "NotoSansMalayalam",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#131926",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222B3F",
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
    backgroundColor: "#1B2335",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  wordBadgeText: {
    color: "#00D2FF",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  cardHeaderText: {
    flex: 1,
  },
  malayalamWord: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  meaningsWrap: {
    flexDirection: "row",
  },
  meaningPill: {
    backgroundColor: "#1B2335",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#222B3F",
    flex: 1,
  },
  meaningText: {
    color: "#8E9BB4",
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
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 6,
  },
  stateText: {
    color: "#8E9BB4",
    fontSize: 14,
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#1B2335",
    borderColor: "#00D2FF",
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#00D2FF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
});