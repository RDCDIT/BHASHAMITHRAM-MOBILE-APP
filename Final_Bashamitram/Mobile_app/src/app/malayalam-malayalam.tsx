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
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import AnimatedCard from "../components/AnimatedCard";
import SkeletonLoader from "../components/SkeletonLoader";
import SpeakButton from "../components/SpeakButton";
import FavoriteButton from "../components/FavoriteButton";
import DictionarySearchBar from "../components/DictionarySearchBar";
import FloatingLettersBackground from "../components/FloatingLettersBackground";

import { saveRecentSearch } from "../utils/recentActivity";
import { searchMalayalam } from "../database/dictionaryService";
import type { DictionaryEntry } from "../database/types";
import { useResponsive } from "../utils/responsive";

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
  const [selectedLetter, setSelectedLetter] = useState(query ? "" : "അ");
  const [searchText, setSearchText] = useState(query || "");
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
        void saveRecentSearch(searchText.trim(), "character", "malayalam_malayalam");
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
    item: SearchResult;
    index: number;
  }) => {
    const firstMeaning = item.meanings?.[0]?.meaning;

    return (
      <AnimatedCard index={index} scrollY={scrollY}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={[
            styles.card,
            {
              padding: dictCardPadding,
              marginBottom: dictCardMargin,
              borderRadius: dictCardRadius,
            },
          ]}
          onPress={() => handleCardPress(item.word ?? "")}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.malayalamWord, { fontSize: dictWordFontSize }]}>
                {item.word}
              </Text>
            </View>

            <View style={styles.cardActionRow}>
              <SpeakButton word={item.word} lang="ml" />
              <FavoriteButton
                word={item.word}
                dictionaryType="malayalam-malayalam"
                meaning={firstMeaning}
                size={32}
              />
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </View>

          {/* Meaning Box */}
          {item.meanings?.length ? (
            <View style={[styles.meaningContainer, { marginTop: isSmallPhone ? 4 : 8 }]}>
              {item.meanings.slice(0, 3).map((m, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.meaningText,
                    {
                      fontSize: dictMeaningFontSize,
                      lineHeight: Math.round(dictMeaningFontSize * 1.45),
                    },
                  ]}
                >
                  • {m.meaning}
                </Text>
              ))}
            </View>
          ) : null}
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
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.headerBackButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
              ഭാഷാമിത്രം II
            </Text>
            <Text style={[styles.headerSubtitle, { fontSize: headerSubtitleFontSize }]}>
              മലയാളം - മലയാളം പദമിത്രം
            </Text>
          </View>

          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.headerEmblem}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={[styles.alphabetContainer, { paddingVertical: alphabetPadding, paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[
            styles.clearFilterButton,
            {
              width: alphabetTabSize,
              height: alphabetTabSize,
              borderRadius: Math.round(alphabetTabSize / 2),
            },
          ]}
          onPress={() => {
            setSelectedLetter("");
            setSearchText("");
            loadEntries("", false);
          }}
        >
          <Ionicons
            name="funnel-outline"
            size={isSmallPhone ? 16 : 18}
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
          contentContainerStyle={[
            styles.listContent,
            {
              padding: horizontalPadding,
              paddingBottom: Math.round(dictCardMargin * 2.5),
            },
          ]}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  alphabetFlatList: {
    flex: 1,
  },
  alphabetList: {
    paddingHorizontal: 4,
  },
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
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
  },
  activeLetterText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
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
  },
  cardHeaderText: {
    flex: 1,
    marginRight: 10,
  },
  malayalamWord: {
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meaningContainer: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB",
  },
  meaningText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    fontFamily: "NotoSansMalayalam",
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    minHeight: 260,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 6,
  },
  stateText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});