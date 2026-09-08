import React, { useState, useEffect } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import AnimatedCard from "../components/AnimatedCard";
import SkeletonLoader from "../components/SkeletonLoader";

import {
  getRecentActivity,
  clearRecentActivity,
  saveRecentSearch,
  saveRecentOpening,
  RecentSearch,
  RecentOpening,
} from "../utils/recentActivity";

import {
  searchMalayalam,
} from "../database/dictionaryService";

import { DictionaryEntry } from "../database/types";


export default function SavisheshaThirayalScreen() {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"searches" | "openings">("searches");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [recentOpenings, setRecentOpenings] = useState<RecentOpening[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activityErrorMessage, setActivityErrorMessage] = useState("");

  const [searchScrollY] = React.useState(() => new Animated.Value(0));
  const [recentScrollY] = React.useState(() => new Animated.Value(0));

  const [containerWidth, setContainerWidth] = useState(0);
  const [tabTranslateX] = React.useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(tabTranslateX, {
      toValue: activeTab === "searches" ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);



  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState("");

const loadRecentActivity = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setIsLoadingActivity(true);
      setActivityErrorMessage("");

      const { recentSearches: searches, recentOpenings: openings } = await getRecentActivity();
      setRecentSearches(searches);
      setRecentOpenings(openings);
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

  
  const loadSearchEntries = async (queryText: string) => {
  try {
    setIsLoadingResults(true);
    setSearchErrorMessage("");

    const results = await searchMalayalam(queryText);

    setSearchResults(results);

    if (results.length > 0) {
      await saveRecentSearch(queryText, "character");
    }
  } catch (error) {
    setSearchErrorMessage(
      error instanceof Error
        ? error.message
        : "വാക്കുകൾ ലോഡ് ചെയ്യാൻ സാധിച്ചില്ല."
    );
    setSearchResults([]);
  } finally {
    setIsLoadingResults(false);
  }
};

  useFocusEffect(
    React.useCallback(() => {
      void loadRecentActivity(true);
    }, [])
  );

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

 
const handleClearHistory = async (type: "searches" | "openings") => {
    try {
      setIsLoadingActivity(true);
      await clearRecentActivity(type);
      if (type === "searches") {
        setRecentSearches([]);
      } else {
        setRecentOpenings([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error instanceof Error ? error.message : "ചരിത്രം ഇല്ലാതാക്കാൻ സാധിച്ചില്ല.");
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const confirmClearHistory = () => {
    const typeLabel = activeTab === "searches" ? "തിരച്ചിലുകൾ" : "തുറന്ന വാക്കുകൾ";
    Alert.alert(
      "ചരിത്രം ഇല്ലാതാക്കുക",
      `സമീപകാലത്തെ ${typeLabel} ചരിത്രം പൂർണ്ണമായും ഒഴിവാക്കണോ?`,
      [
        { text: "അല്ല", style: "cancel" },
        { text: "അതെ", style: "destructive", onPress: () => void handleClearHistory(activeTab) },
      ]
    );
  };

  const handleRecentSearchPress = (title: string) => {
    setSearchText(title);
  };

  const handleRecentOpeningPress = (word: string) => {
  router.push({
    pathname: "/malayalam_details",
    params: { word },
  });
};

  const handleSearchResultPress = async (item: DictionaryEntry) => {
  await saveRecentOpening(item.id ?? 0, item.word);

  router.push({
    pathname: "/malayalam_details",
    params: {
      word: item.word,
    },
  });
};


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

  const renderSearchResult = ({ item, index }: { item: DictionaryEntry; index: number }) => (
    <AnimatedCard index={index} scrollY={searchScrollY}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSearchResultPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.malayalamWord}>{item.word}</Text>
            <Text style={styles.cardSubtext}>
              English: {item.english_equivalent}
            </Text>
          </View>
        </View>

        <View style={styles.definitionBox}>
          <Text style={styles.definitionHeader}>Definition</Text>
          <Text style={styles.definitionText} numberOfLines={2}>
            • {item.primary_malayalam_meaning}
          </Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );

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

          <Text style={styles.headerTitle}>സമീപകാല തിരയൽ</Text>

          {/* Clear history button inside header */}
          {!searchText.trim() &&
            ((activeTab === "searches" && recentSearches.length > 0) ||
              (activeTab === "openings" && recentOpenings.length > 0)) ? (
            <TouchableOpacity onPress={confirmClearHistory}>
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>
      </View>

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Explore words..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#898683"
        />
        {searchText.trim().length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearSearchIcon}>
            <Ionicons name="close-circle" size={20} color="#777" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => void loadSearchEntries(searchText)} style={styles.searchButton}>
          <Ionicons name="search" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      {!searchText.trim() && (
        <View
          style={styles.tabContainer}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {containerWidth > 0 && (
            <Animated.View
              style={[
                styles.activeIndicator,
                {
                  width: (containerWidth - 8) / 2,
                  transform: [
                    {
                      translateX: tabTranslateX.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, (containerWidth - 8) / 2],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab("searches")}
            activeOpacity={0.9}
          >
            <Text style={[styles.tabButtonText, activeTab === "searches" && styles.activeTabButtonText]}>
              Recent Searches
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab("openings")}
            activeOpacity={0.9}
          >
            <Text style={[styles.tabButtonText, activeTab === "openings" && styles.activeTabButtonText]}>
              Recent Openings
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content Rendering */}
      {searchText.trim() ? (
        isLoadingResults ? (
          <SkeletonLoader />
        ) : searchErrorMessage ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല</Text>
            <Text style={styles.stateText}>{searchErrorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadSearchEntries(searchText)}>
              <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.FlatList
            data={searchResults}
            keyExtractor={(item, index) => (item.id ?? index).toString()}
            renderItem={renderSearchResult}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: searchScrollY } } }],
              { useNativeDriver: true }
            )}
            ListEmptyComponent={
              <View style={styles.stateContainer}>
                <Text style={styles.stateTitle}>ഫലങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല</Text>
                <Text style={styles.stateText}>
                  &quot;{searchText}&quot; എന്ന വാക്ക് നിഘണ്ടുവിൽ കണ്ടെത്താൻ സാധിച്ചില്ല.
                </Text>
              </View>
            }
          />
        )
      ) : (
        isLoadingActivity ? (
          <SkeletonLoader />
        ) : activityErrorMessage ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>വിവരങ്ങൾ ലഭ്യമാക്കാൻ സാധിച്ചില്ല</Text>
            <Text style={styles.stateText}>{activityErrorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadRecentActivity(true)}>
              <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: recentScrollY } } }],
              { useNativeDriver: true }
            )}
          >
            <>
              {activeTab === "searches" ? (
                recentSearches.length === 0 ? (
                  <View style={styles.stateContainer}>
                    <Text style={styles.stateTitle}>തിരച്ചിലുകൾ ലഭ്യമല്ല</Text>
                    <Text style={styles.stateText}>സമീപകാല തിരച്ചിലുകൾ നിലവിലില്ല.</Text>
                  </View>
                ) : (
                  recentSearches.map((item, index) => (
                    <AnimatedCard
                      key={`${item.title}-${index}`}
                      index={index}
                      scrollY={recentScrollY}
                    >
                      <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => handleRecentSearchPress(item.title)}
                          >
                            <View style={styles.cardHeader}>
                              <View style={styles.cardHeaderText}>
                                <Text style={styles.malayalamWord}>{item.title}</Text>
                                <Text style={styles.timestampText}>
                                  {formatDateTime(item.searchedAt)}
                                </Text>
                              </View>

                              <View style={styles.cardHeaderRight}>
                                <View style={styles.directionBadge}>
                                  <Text style={styles.directionBadgeText}>
                                    {item.itemType}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                    </AnimatedCard>
                  ))
                )
              ) : (
                recentOpenings.length === 0 ? (
                  <View style={styles.stateContainer}>
                    <Text style={styles.stateTitle}>തുറന്ന വാക്കുകൾ ലഭ്യമല്ല</Text>
                    <Text style={styles.stateText}>സമീപകാലത്ത് തുറന്ന വാക്കുകൾ നിലവിലില്ല.</Text>
                  </View>
                ) : (
                  recentOpenings.map((item, index) => (
                    <AnimatedCard
                      key={item._id}
                      index={index}
                      scrollY={recentScrollY}
                    >
                      <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => handleRecentOpeningPress(item.word)}
                      >
                        <View style={styles.cardHeader}>
                          <View style={styles.cardHeaderText}>
                            <Text style={styles.malayalamWord}>{item.word}</Text>

                            <Text style={styles.timestampText}>
                              {formatDateTime(item.openedAt)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </AnimatedCard>
                  ))
                )
              )}
            </>
          </Animated.ScrollView>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
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
    width: "100%",
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
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
  clearSearchIcon: {
    padding: 4,
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
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
  malayalamWord: {
    color: "#1F2330",
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  timestampText: {
    color: "#7C736B",
    fontSize: 12,
    fontFamily: "NotoSansMalayalam",
    marginTop: 4,
  },
  cardSubtext: {
    color: "#4E473E",
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
    backgroundColor: "#F5F5F7",
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
    fontFamily: "NotoSansMalayalam",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EBE6DF",
    borderRadius: 20,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    position: "relative",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 16,
    zIndex: 1,
  },
  activeIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: "#2B2C51",
    borderRadius: 16,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5F564E",
    fontFamily: "NotoSansMalayalam",
  },
  activeTabButtonText: {
    color: "#FFFFFF",
  },
});