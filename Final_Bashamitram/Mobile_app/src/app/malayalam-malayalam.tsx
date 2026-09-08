import React, { useEffect, useState } from "react";
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
import SpeakButton from "../components/SpeakButton";
import DictionarySearchBar from "../components/DictionarySearchBar";

import { saveRecentSearch } from "../utils/recentActivity";
import { searchMalayalam } from "../database/dictionaryService";
import type { DictionaryEntry } from "../database/types";

type SearchResult = DictionaryEntry;

const PAGE_SIZE = 20;

const MALAYALAM_ALPHABET = [
  "അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "അം",
  "ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ",
  "ട", "ഠ", "ഡ", "ഢ", "ണ",
  "ത", "ഥ", "ദ", "ധ", "ന",
  "പ", "ഫ", "ബ", "ഭ", "മ",
  "യ", "ര", "ല", "വ",
  "ശ", "ഷ", "സ", "ഹ",
  "ള", "ഴ", "റ",
] as const;

export default function MalayalamMalayalamScreen() {
  const [selectedLetter, setSelectedLetter] = useState("അ");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrollY] = useState(new Animated.Value(0));

  const loadEntries = React.useCallback(
    async (query: string = "അ", isMore = false) => {
      if (isMore) {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setErrorMessage("");
      }

      try {
        const offset = isMore ? results.length : 0;
        const rows = await searchMalayalam(query, PAGE_SIZE, offset);

        if (isMore) {
          setResults((prev) => [...prev, ...rows]);
        } else {
          setResults(rows);
        }
        setHasMore(rows.length === PAGE_SIZE);
      } catch (e) {
        console.error(e);
        if (!isMore) {
          setResults([]);
          setErrorMessage("വാക്കുകൾ ലോഡ് ചെയ്യാൻ സാധിച്ചില്ല.");
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [results.length, isLoadingMore, hasMore]
  );

  useEffect(() => {
    if (searchText.trim().length > 1) {
      const timer = setTimeout(() => {
        void saveRecentSearch(searchText.trim(), "character");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [searchText]);

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

  const handleCardPress = (word: string) => {
    if (!word) return;

    router.push({
      pathname: "/malayalam_details",
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

  const renderEntry = ({
    item,
    index,
  }: {
    item: SearchResult;
    index: number;
  }) => (
    <AnimatedCard index={index} scrollY={scrollY}>
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.card}
        onPress={() => handleCardPress(item.word ?? "")}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            {/* Word */}
            <Text style={styles.malayalamWord}>
              {item.word}
            </Text>

            {/* Meaning */}
            {item.meanings?.length ? (
              <View style={styles.meaningContainer}>

                {item.meanings.slice(0, 3).map((m, idx) => (
                  <Text key={idx} style={styles.meaningText}>
                    • {m.meaning}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>

          <SpeakButton word={item.word} lang="ml" />
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
          >
            <Ionicons
              name="chevron-back"
              size={27}
              color="white"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            മലയാളം - മലയാളം നിഘണ്ടു
          </Text>

          <View style={{ width: 27 }} />
        </View>
      </View>

      <View style={styles.alphabetContainer}>
        <TouchableOpacity
          style={styles.clearFilterButton}
          onPress={() => {
            setSelectedLetter("");
            setSearchText("");
            loadEntries("", false);
          }}
        >
          <Ionicons
            name="funnel-outline"
            size={18}
            color="#EF4444"
          />
        </TouchableOpacity>

        <FlatList
          horizontal
          data={MALAYALAM_ALPHABET}
          renderItem={renderAlphabetItem}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetList}
          style={styles.alphabetFlatList}
        />

      </View>

      <DictionarySearchBar
        value={searchText}
        placeholder="വാക്ക് നൽകുക..."
        onChangeText={(text) => setSearchText(text)}
        onSubmit={() => loadEntries(searchText.trim(), false)}
      />


      {isLoading ? (
        <SkeletonLoader />
      ) : errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>
            സാങ്കേതിക തടസ്സം
          </Text>

          <Text style={styles.stateText}>
            {errorMessage}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadEntries(searchText.trim() || selectedLetter, false)}
          >
            <Text style={styles.retryButtonText}>
              വീണ്ടും ശ്രമിക്കുക
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={results.filter(Boolean)}
          renderItem={renderEntry}
          keyExtractor={(item, index) =>
            item?.id
              ? item.id.toString()
              : item?.word
                ? `${item.word}-${index}`
                : index.toString()
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    y: scrollY,
                  },
                },
              },
            ],
            {
              useNativeDriver: true,
            }
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
              <Text style={styles.stateTitle}>
                വാക്ക് കണ്ടെത്താനായില്ല
              </Text>

              <Text style={styles.stateText}>
                {searchText.trim()
                  ? `"${searchText}" എന്ന വാക്ക് കണ്ടെത്തിയില്ല.`
                  : "നിഘണ്ടുവിൽ വാക്കുകൾ ലഭ്യമല്ല."}
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
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },

  alphabetContainer: {
    backgroundColor: "#F9F6F1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  alphabetFlatList: {
    flex: 1,
  },

  alphabetList: {
    paddingHorizontal: 4,
  },

  clearFilterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EAE6DF",
    marginRight: 8,
  },

  letterTab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EAE6DF",
  },

  activeLetterTab: {
    backgroundColor: "#2B2C51",
    borderColor: "#2B2C51",
  },

  letterText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
  },

  activeLetterText: {
    color: "#FFF",
  },

  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0ECE6",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardHeaderText: {
    flex: 1,
    marginRight: 12,
  },

  malayalamWord: {
    fontSize: 20,
    color: "#1F2330",
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },

  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  stateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2330",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 10,
  },

  stateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 22,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#2B2C51",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  retryButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  meaningContainer: {
    marginTop: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#43AC98",
  },

  meaningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2B2C51",
    marginBottom: 8,
  },

  meaningText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    fontFamily: "NotoSansMalayalam",
  },

});