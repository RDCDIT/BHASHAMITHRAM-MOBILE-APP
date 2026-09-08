/**
 * @file malayalam_synonym_details.tsx
 * @description Application route screen component for malayalam_synonym_details.
 */

import React, { useEffect, useState } from "react";
import {
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

import type { DictionaryEntry } from "../database/types";
import { getSynonymWord } from "../database/dictionaryService";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


/**
 * Renders and manages the MalayalamSynonymDetailsScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function MalayalamSynonymDetailsScreen() {
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

  const renderSynonyms = (syns?: string[]) => {
    if (!syns || !Array.isArray(syns) || syns.length === 0) return null;
    const flatSyns = syns.flat(Infinity)
      .map(s => typeof s === 'string' ? s.trim() : String(s).trim())
      .filter(s => s.length > 0);
    return (
      <View style={styles.bulletList}>
        {flatSyns.map((item, idx) => (
          <View key={idx} style={styles.bulletItem}>
            <Text style={styles.bulletIcon}>{idx + 1}.</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  let cardIndex = 0;

  return (
    <View style={styles.screen}>
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isLoading ? "വിവരങ്ങൾ" : details?.word || "വിവരങ്ങൾ"}
          </Text>
          <View style={{ width: 27 }} />
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
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >

          {/* Synonyms Card rendered under Meanings */}
          {details.synonyms && details.synonyms.length > 0 && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("synonyms")}
                delayPressIn={0}
                style={getAnimatedCardStyle("synonyms")}
              >
                <Text style={styles.sectionTitle}>പര്യായപദങ്ങൾ / Synounyms</Text>
                {renderSynonyms(details.synonyms)}
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
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    flex: 1,
    textAlign: "center",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  wordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0ECE6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  wordBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#2B2C51",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  wordBadgeText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  mainWord: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderLeftColor: "#43AC98",
    borderLeftWidth: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#F4EEE7",
    paddingBottom: 6,
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
