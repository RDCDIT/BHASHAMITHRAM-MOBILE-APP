import React, { useState, useEffect } from "react";
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
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

// ബാക്കെൻഡ് റെസ്പോൺസ് ഘടനയ്ക്ക് അനുയോജ്യമായ ടൈപ്പ് ഡെഫനിഷനുകൾ
type DictionaryEntry = {
  id: number;
  word: string; // മലയാളം വാക്ക്
  english_equivalent: string;
  primary_malayalam_meaning: string;
};

type RecentSearch = {
  _id: string;
  itemId: string;
  itemType: "english" | "character" | "synonym";
  title: string;
  searchedAt: string;
};

type RecentOpening = {
  _id: string;
  wordId: number;
  word: string;
  openedAt: string;
};

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000",
  "http://192.168.1.2:5000",
].filter((value): value is string => Boolean(value));

export default function SavisheshaThirayalScreen() {
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [recentOpenings, setRecentOpenings] = useState<RecentOpening[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activityErrorMessage, setActivityErrorMessage] = useState("");

  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState("");

  // ബാക്കെൻഡിൽ നിന്നും സമീപകാല വിവരങ്ങൾ ഫെച്ച് ചെയ്യാനുള്ള ഫങ്ഷൻ
  const loadRecentActivity = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setIsLoadingActivity(true);
      setActivityErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Recent Activity] Fetching from ${apiBaseUrl}`);
          const response = await fetch(`${apiBaseUrl}/api/words/recent-activity`);

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setRecentSearches(Array.isArray(data.recentSearches) ? data.recentSearches : []);
          setRecentOpenings(Array.isArray(data.recentOpenings) ? data.recentOpenings : []);
          return; // Success
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error("Could not fetch recent activity.");
    } catch (error) {
      console.error(error);
      setActivityErrorMessage(
        error instanceof Error ? error.message : "സമീപകാല വിവരങ്ങൾ ലോഡ് ചെയ്യാൻ സാധിച്ചില്ല."
      );
    } finally {
      setIsLoadingActivity(false);
      setIsRefreshing(false);
    }
  };

  // ബാക്കെൻഡിൽ നിന്നും മലയാളം വാക്കുകൾ തിരയാനുള്ള ഫങ്ഷൻ
  const loadSearchEntries = async (queryText: string) => {
    try {
      setIsLoadingResults(true);
      setSearchErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Special Search] Fetching entries for query "${queryText}" from ${apiBaseUrl}`);
          const response = await fetch(
            `${apiBaseUrl}/api/words/browse-malayalam?query=${encodeURIComponent(queryText)}`
          );

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setSearchResults(Array.isArray(data) ? data : []);
          return; // Success
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error("Could not reach the dictionary backend.");
    } catch (error) {
      setSearchErrorMessage(
        error instanceof Error ? error.message : "വാക്കുകൾ ലോഡ് ചെയ്യാൻ സാധിച്ചില്ല."
      );
      setSearchResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // സ്ക്രീൻ ഫോക്കസ് ആകുമ്പോൾ സമീപകാല ലിസ്റ്റ് ലോഡ് ചെയ്യുന്നു
  useFocusEffect(
    React.useCallback(() => {
      void loadRecentActivity(true);
    }, [])
  );

  // സെർച്ച് ബാറിൽ ടൈപ്പ് ചെയ്യുമ്പോൾ ഡൈനാമിക് ആയി ബാക്കെൻഡ് ഫെച്ച് ചെയ്യുക
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      void loadSearchEntries(searchText);
    }, 400); // 400ms ഡെബോൺസ് ടൈം

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (searchText.trim()) {
      void loadSearchEntries(searchText);
    } else {
      void loadRecentActivity(false);
    }
  };

  // സമീപകാല ചരിത്രം ഇല്ലാതാക്കാനുള്ള ഫങ്ഷൻ
  const handleClearHistory = async () => {
    try {
      setIsLoadingActivity(true);
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Recent Activity] Clearing activity at ${apiBaseUrl}`);
          const response = await fetch(`${apiBaseUrl}/api/words/clear-recent-activity`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "all" }),
          });

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          setRecentSearches([]);
          setRecentOpenings([]);
          return; // Success
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error("Could not clear recent activity.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error instanceof Error ? error.message : "ചരിത്രം ഇല്ലാതാക്കാൻ സാധിച്ചില്ല.");
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const confirmClearHistory = () => {
    Alert.alert(
      "ചരിത്രം ഇല്ലാതാക്കുക",
      "സമീപകാല തിരച്ചിലുകളും അവസാനം തുറന്നതുമായ വിവരങ്ങളും പൂർണ്ണമായും ഒഴിവാക്കണോ?",
      [
        { text: "അല്ല", style: "cancel" },
        { text: "അതെ", style: "destructive", onPress: () => void handleClearHistory() },
      ]
    );
  };

  const handleRecentSearchPress = (title: string) => {
    setSearchText(title);
  };

  const handleRecentOpeningPress = (wordId: number) => {
    router.push({
      pathname: "/details",
      params: { dictionaryId: wordId },
    });
  };

  const handleSearchResultPress = (id: number) => {
    router.push({
      pathname: "/details",
      params: { dictionaryId: id },
    });
  };

  // തീയതിയും സമയവും രൂപപ്പെടുത്താനുള്ള ഫങ്ഷൻ
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return dateStr;
    }
  };

  const renderSearchResult = ({ item }: { item: DictionaryEntry }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSearchResultPress(item.id)}
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
          <Text style={styles.cardSubtext}>English: {item.english_equivalent}</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={27} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>സവിശേഷ തിരയൽ</Text>

        {/* Clear history button inside header */}
        {!searchText.trim() && (recentSearches.length > 0 || recentOpenings.length > 0) ? (
          <TouchableOpacity onPress={confirmClearHistory}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ടൈപ്പ് ചെയ്ത് തിരയുക..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#898683"
        />
        {searchText.trim().length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearSearchIcon}>
            <Ionicons name="close-circle" size={20} color="#777" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content Rendering */}
      {searchText.trim() ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSearchResult}
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
            isLoadingResults ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="large" color="#2B2C51" />
                <Text style={styles.stateText}>തിരയുന്നു...</Text>
              </View>
            ) : searchErrorMessage ? (
              <View style={styles.stateContainer}>
                <Text style={styles.stateTitle}>കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല</Text>
                <Text style={styles.stateText}>{searchErrorMessage}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => void loadSearchEntries(searchText)}>
                  <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.stateContainer}>
                <Text style={styles.stateTitle}>ഫലങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല</Text>
                <Text style={styles.stateText}>
                  `"${searchText}" എന്ന വാക്ക് നിഘണ്ടുവിൽ കണ്ടെത്താൻ സാധിച്ചില്ല.`
                </Text>
              </View>
            )
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#2B2C51"
              colors={["#2B2C51"]}
            />
          }
        >
          {isLoadingActivity ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color="#2B2C51" />
              <Text style={styles.stateText}>വിവരങ്ങൾ ശേഖരിക്കുന്നു...</Text>
            </View>
          ) : activityErrorMessage ? (
            <View style={styles.stateContainer}>
              <Text style={styles.stateTitle}>വിവരങ്ങൾ ലഭ്യമാക്കാൻ സാധിച്ചില്ല</Text>
              <Text style={styles.stateText}>{activityErrorMessage}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void loadRecentActivity(true)}>
                <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
              </TouchableOpacity>
            </View>
          ) : recentSearches.length === 0 && recentOpenings.length === 0 ? (
            <View style={styles.stateContainer}>
              <Text style={styles.stateTitle}>ചരിത്രം ലഭ്യമല്ല</Text>
              <Text style={styles.stateText}>സമീപകാല തിരച്ചിലുകളോ തുറന്ന വാക്കുകളോ നിലവിലില്ല.</Text>
            </View>
          ) : (
            <>
              {/* Recent Searches (as cards) */}
              {recentSearches.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.openingCard}
                  onPress={() => handleRecentSearchPress(item.title)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.wordBadge, { backgroundColor: "#5F585F" }]}>
                      <Ionicons name="search" size={20} color="white" />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.malayalamWord}>{item.title}</Text>
                      <Text style={styles.timestampText}>
                        തിരഞ്ഞത്: {formatDateTime(item.searchedAt)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#BCAFA1" />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Recent Openings (as cards) */}
              {recentOpenings.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.openingCard}
                  onPress={() => handleRecentOpeningPress(item.wordId)}
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
                      <Text style={styles.timestampText}>
                        തുറന്നത്: {formatDateTime(item.openedAt)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#BCAFA1" />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  clearSearchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    padding: 0,
    fontFamily: "NotoSansMalayalam",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  openingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E7E0D7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E7E0D7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
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
    fontFamily: "NotoSansMalayalam",
  },
  cardHeaderText: {
    flex: 1,
  },
  malayalamWord: {
    color: "#1F2330",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  timestampText: {
    color: "#7C736B",
    fontSize: 12,
    fontFamily: "NotoSansMalayalam",
    marginTop: 2,
  },
  cardSubtext: {
    color: "#7C736B",
    fontSize: 13,
    marginTop: 1,
  },
  meaningsWrap: {
    flexDirection: "row",
    marginTop: 10,
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
    fontFamily: "NotoSansMalayalam",
  },
});