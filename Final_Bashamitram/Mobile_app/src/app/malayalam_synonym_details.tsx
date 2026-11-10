/**
 * @file malayalam_synonym_details.tsx
 * @description Application route screen component for malayalam_synonym_details.
 */

import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import AnimatedCard from "../components/AnimatedCard";
import SkeletonLoader from "../components/SkeletonLoader";
import SpeakButton from "../components/SpeakButton";
import FavoriteButton from "../components/FavoriteButton";
import FloatingLettersBackground from "../components/FloatingLettersBackground";

import type { DictionaryEntry } from "../database/types";
import { getSynonymWord } from "../database/dictionaryService";
import { saveRecentOpening } from "../utils/recentActivity";
import { useResponsive } from "../utils/responsive";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


/**
 * Renders and manages the MalayalamSynonymDetailsScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function MalayalamSynonymDetailsScreen() {
  const {
    headerHeight,
    headerTitleFontSize,
    detailWordCardPadding,
    detailSectionPadding,
    detailWordFontSize,
    cardMarginBottom,
    dictCardRadius,
    horizontalPadding,
    isSmallPhone,
  } = useResponsive();

  const { word } = useLocalSearchParams<{ word: string }>();
  const [details, setDetails] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [highlightedCard, _setHighlightedCard] = useState<string | null>(null);
  const [highlightAnim] = React.useState(() => new Animated.Value(0));

  const toggleHighlight = (key: string) => {
    if (highlightedCard === key) {
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        _setHighlightedCard(null);
      });
    } else if (highlightedCard !== null) {
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        _setHighlightedCard(key);
        Animated.spring(highlightAnim, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }).start();
      });
    } else {
      _setHighlightedCard(key);
      Animated.spring(highlightAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const getAnimatedCardStyle = (key: string, isSection = true) => {
    const isHighlighted = highlightedCard === key;
    const scale = isHighlighted
      ? highlightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.03],
      })
      : 1;

    return [
      isSection ? styles.section : styles.wordCard,
      isHighlighted && (isSection ? styles.highlightedSection : styles.highlightedCard),
      {
        padding: isSection ? detailSectionPadding : detailWordCardPadding,
        marginBottom: cardMarginBottom,
        borderRadius: dictCardRadius,
      },
      { transform: [{ scale }] },
    ];
  };

  const [scrollY] = React.useState(() => new Animated.Value(0));

  /**
 * Asynchronous controller/helper function: loadDetails.
 */
const loadDetails = async () => {
  if (!word) {
    setErrorMessage("ശരിയായ വാക്ക് കണ്ടെത്താൻ സാധിച്ചില്ല.");
    setIsLoading(false);
    return;
  }

  try {
    setIsLoading(true);
    setErrorMessage("");

    const data = await getSynonymWord(word);

    if (!data) {
      setDetails(null);
      setErrorMessage("വാക്ക് കണ്ടെത്തിയില്ല.");
      return;
    }

    setDetails(data);
    void saveRecentOpening(data.id ?? 0, data.word, "malayalam_synonym");
  } catch {
    setDetails(null);
    setErrorMessage("വിവരങ്ങൾ ലഭ്യമാക്കാൻ സാധിച്ചില്ല.");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    void loadDetails();
  }, [word]);

  // Returns true only when a field has meaningful content
  const hasValue = (val?: string | string[] | null): boolean => {
    if (val === null || val === undefined) return false;
    if (Array.isArray(val)) return val.filter(Boolean).length > 0;
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed !== "" && trimmed.toLowerCase() !== "null" && trimmed.toLowerCase() !== "undefined" && trimmed !== "N/A";
    }
    return false;
  };

  const renderBulletedList = (text?: string | string[]) => {
    if (!text) return null;
    let items: string[] = [];
    if (Array.isArray(text)) {
      items = text.map(item => String(item).trim()).filter(Boolean);
    } else if (typeof text === "string") {
      items = text.split(/[,;\n]+/).map(item => item.trim()).filter(Boolean);
    } else {
      items = [String(text).trim()];
    }
    if (items.length === 0) return null;
    return (
      <View style={styles.bulletList}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.bulletItem}>
            <Text style={styles.bulletIcon}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  let cardIndex = 0;

  const meaningItems: { meaning: string; context?: string }[] = [];
  if (details?.meanings && details.meanings.length > 0) {
    details.meanings.filter(Boolean).forEach(m => {
      if (hasValue(m?.meaning)) meaningItems.push({ meaning: m.meaning, context: m.context_usage });
    });
  }
  if (meaningItems.length === 0 && details?.synonyms && details.synonyms.length > 0) {
    details.synonyms.flat(Infinity).forEach(s => {
      const str = typeof s === "string" ? s.trim() : String(s).trim();
      if (hasValue(str)) meaningItems.push({ meaning: str });
    });
  }

  const primaryMeaning =
    meaningItems[0]?.meaning ||
    (details?.meanings?.[0]?.meaning as string) ||
    "";

  return (
    <View style={styles.screen}>
      <FloatingLettersBackground />
      {/* Header (Matching Screen 3) */}
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
            <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]} numberOfLines={1}>
              ഭാഷാമിത്രം II
            </Text>
            <Text style={styles.headerSubtitle}>നാനാർത്ഥ വിവരണം (Synonyms)</Text>
          </View>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.headerEmblem}
            resizeMode="contain"
          />
        </View>
      </View>

      {isLoading ? (
        <SkeletonLoader />
      ) : errorMessage || !details ? (
        <View style={styles.stateContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#7C736B" />
          <Text style={styles.stateTitle}>കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല</Text>
          <Text style={styles.stateText}>{errorMessage || "വിവരങ്ങൾ ലഭ്യമല്ല."}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadDetails()}>
            <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            {
              padding: horizontalPadding,
              paddingBottom: Math.round(cardMarginBottom * 2.5),
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          {/* Word Hero Card (Matching Screen 3) */}
          <AnimatedCard index={cardIndex++} scrollY={scrollY}>
            <View
              style={[
                styles.wordCard,
                {
                  padding: detailWordCardPadding,
                  marginBottom: cardMarginBottom,
                  borderRadius: dictCardRadius,
                },
              ]}
            >
              <View style={styles.wordBadge}>
                <Text style={styles.wordBadgeText}>
                  {details.word ? details.word.charAt(0) : "?"}
                </Text>
              </View>

              <Text style={[styles.mainWord, { fontSize: detailWordFontSize }]}>
                {details.word}
              </Text>

              {hasValue(details.phonetic_transcription) && (
                <Text style={styles.phonetic}>[{details.phonetic_transcription}]</Text>
              )}

              {/* Action Buttons Row */}
              <View style={styles.heroActionsRow}>
                <SpeakButton word={details.word} lang="ml" />
                <FavoriteButton
                  word={details.word}
                  dictionaryType="malayalam_synonym"
                  meaning={primaryMeaning}
                  phonetic={details.phonetic_transcription}
                  size={36}
                />
              </View>
            </View>
          </AnimatedCard>

          {/* Categories, Meanings & Context */}
          {meaningItems.length > 0 && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("meanings")}
                delayPressIn={0}
                style={getAnimatedCardStyle("meanings")}
              >
                <Text style={styles.sectionTitle}>അർത്ഥങ്ങൾ / Meanings & Context</Text>
                {meaningItems.map((item, idx) => (
                  <View key={idx} style={styles.meaningItem}>
                    <View style={styles.meaningNumberBox}>
                      <Text style={styles.meaningNumber}>{idx + 1}</Text>
                    </View>
                    <View style={styles.meaningContent}>
                      <Text style={styles.meaningText}>{item.meaning}</Text>
                      {!!item.context && (
                        <Text style={styles.contextUsage}>
                          <Text style={{ fontWeight: "700" }}>പ്രയോഗം: </Text>
                          {item.context}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* Antonyms */}
          {hasValue(details.antonyms) && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("antonyms")}
                delayPressIn={0}
                style={getAnimatedCardStyle("antonyms")}
              >
                <Text style={styles.sectionTitle}>വിപരീതപദങ്ങൾ / Antonyms</Text>
                {renderBulletedList(details.antonyms)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}
        </Animated.ScrollView>
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  wordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  wordBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  wordBadgeText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  mainWord: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
  },
  phonetic: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 4,
    fontFamily: "Roboto",
  },
  heroActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 14,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
    borderLeftColor: "#2563EB",
    borderLeftWidth: 3.5,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
  },
  meaningItem: {
    flexDirection: "row",
    marginBottom: 14,
  },
  meaningNumberBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#F4EEE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  meaningNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
  },
  meaningContent: {
    flex: 1,
  },
  meaningText: {
    fontSize: 13,
    color: "#333333",
    lineHeight: 22,
    fontFamily: "NotoSansMalayalam",
  },
  contextUsage: {
    fontSize: 10,
    color: "#7C736B",
    fontFamily: "NotoSansMalayalam",
    marginTop: 6,
    backgroundColor: "#F9F6F1",
    padding: 8,
    borderRadius: 8,
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 4,
  },
  bulletIcon: {
    fontSize: 16,
    color: "#2B2C51",
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 15,
    color: "#333333",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 20,
    flex: 1,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F9F6F1",
  },
  stateTitle: {
    color: "#1F2330",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
    marginTop: 12,
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
    marginTop: 18,
    backgroundColor: "#2B2C51",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  highlightedCard: {
    zIndex: 10,
    ...Platform.select({
      web: {
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  highlightedSection: {
    zIndex: 10,
    ...Platform.select({
      web: {
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
});
