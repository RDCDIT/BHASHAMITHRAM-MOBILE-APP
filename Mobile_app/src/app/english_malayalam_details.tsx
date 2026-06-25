import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

import AnimatedCard from "../components/AnimatedCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { saveRecentOpening } from "../utils/recentActivity";

type DictionaryEntryDetails = {
  _id: string;
  id: string;
  word: string;
  phonetic_transcription?: string;
  root?: string;
  gender?: string;
  category_names?: string[];
  images?: string[];
  meanings?: Array<{
    id: number;
    meaning: string;
    context_usage?: string;
    category_id?: number;
  }>;
  proverbs?: Array<{
    id: number;
    proverb: string;
    context_usage?: string;
  }>;
  equivalents?: {
    english?: string;
    kannada?: string;
    tamil?: string;
    telugu?: string;
    tulu?: string;
  };
};

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000",
  "http://192.168.1.2:5000",
].filter((value): value is string => Boolean(value));

export default function EnglishMalayalamDetailsScreen() {
  const { dictionaryId } = useLocalSearchParams();
  const [details, setDetails] = useState<DictionaryEntryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [highlightedCard, _setHighlightedCard] = useState<string | null>(null);
  const highlightAnim = useRef(new Animated.Value(0)).current;

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

  const scrollY = useRef(new Animated.Value(0)).current;

  const loadDetails = async () => {
    if (!dictionaryId) {
      setErrorMessage("Could not find the requested word.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[English-Malayalam Details] Fetching details for ID: ${dictionaryId} from ${apiBaseUrl}`);
          const response = await fetch(`${apiBaseUrl}/api/english-malayalam/${dictionaryId}`);

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setDetails(data);
          if (data && data.word) {
            void saveRecentOpening(Number(dictionaryId) || 0, data.word);
          }
          return; // Success, exit function
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error("Could not reach the dictionary backend.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load word details."
      );
      setDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDetails();
  }, [dictionaryId]);

  let cardIndex = 0;

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

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={27} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isLoading ? "Word Details" : details?.word || "Word Details"}
          </Text>
          <View style={{ width: 27 }} />
        </View>
      </View>

      {isLoading ? (
        <SkeletonLoader />
      ) : errorMessage || !details ? (
        <View style={styles.stateContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#7C736B" />
          <Text style={styles.stateTitle}>Connection Failed</Text>
          <Text style={styles.stateText}>{errorMessage || "Details are unavailable."}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadDetails()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
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
          {/* 1. Word */}
          <AnimatedCard index={cardIndex++} scrollY={scrollY}>
            <AnimatedTouchableOpacity
              activeOpacity={0.95}
              onPressIn={() => toggleHighlight("word")}
              delayPressIn={0}
              style={getAnimatedCardStyle("word", false)}
            >
              <Text style={styles.mainWord}>{details.word}</Text>
            </AnimatedTouchableOpacity>
          </AnimatedCard>

          {/* 2. Category */}
          {details.category_names && details.category_names.length > 0 && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("category_names")}
                delayPressIn={0}
                style={getAnimatedCardStyle("category_names")}
              >
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.categoriesContainer}>
                  {details.category_names.map((catName, idx) => (
                    <View key={idx} style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{catName}</Text>
                    </View>
                  ))}
                </View>
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 3. Gender */}
          {!!details.gender && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("gender")}
                delayPressIn={0}
                style={getAnimatedCardStyle("gender")}
              >
                <Text style={styles.sectionTitle}>Gender</Text>
                {renderBulletedList(details.gender)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 4. Root */}
          {!!details.root && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("root")}
                delayPressIn={0}
                style={getAnimatedCardStyle("root")}
              >
                <Text style={styles.sectionTitle}>Root</Text>
                {renderBulletedList(details.root)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 5. Phonetic Transcription */}
          {!!details.phonetic_transcription && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("phonetic")}
                delayPressIn={0}
                style={getAnimatedCardStyle("phonetic")}
              >
                <Text style={styles.sectionTitle}>Phonetic Transcription</Text>
                <Text style={styles.phonetic}>[{details.phonetic_transcription}]</Text>
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 6. Meanings & Context */}
          {details.meanings && details.meanings.length > 0 && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("meanings")}
                delayPressIn={0}
                style={getAnimatedCardStyle("meanings")}
              >
                <Text style={styles.sectionTitle}>അർത്ഥങ്ങൾ / Meanings & Context</Text>
                {details.meanings.map((m, idx) => (
                  <View key={m.id || idx} style={styles.meaningItem}>
                    <View style={styles.meaningNumberBox}>
                      <Text style={styles.meaningNumber}>{idx + 1}</Text>
                    </View>
                    <View style={styles.meaningContent}>
                      <Text style={styles.meaningText}>{m.meaning}</Text>
                      {!!m.context_usage && (
                        <Text style={styles.contextUsage}>
                          <Text style={{ fontWeight: "700" }}>സന്ദർഭം: </Text>
                          {m.context_usage}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 7. Language Equivalents */}
          {details.equivalents && (!!details.equivalents.english || !!details.equivalents.kannada || !!details.equivalents.tamil || !!details.equivalents.telugu || !!details.equivalents.tulu) && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("equivalents")}
                delayPressIn={0}
                style={getAnimatedCardStyle("equivalents")}
              >
                <Text style={styles.sectionTitle}>ഭാഷാ തുല്യതകൾ / Language Equivalents</Text>
                <View style={styles.equivalentsGrid}>
                  {!!details.equivalents.kannada && (
                    <View style={styles.subCard}>
                      <Text style={styles.subCardTitle}>ಕನ್ನಡ / Kannada</Text>
                      <Text style={styles.subCardValue}>{details.equivalents.kannada}</Text>
                    </View>
                  )}
                  {!!details.equivalents.tamil && (
                    <View style={styles.subCard}>
                      <Text style={styles.subCardTitle}>தமிழ் / Tamil</Text>
                      <Text style={styles.subCardValue}>{details.equivalents.tamil}</Text>
                    </View>
                  )}
                  {!!details.equivalents.telugu && (
                    <View style={styles.subCard}>
                      <Text style={styles.subCardTitle}>తెలుగు / Telugu</Text>
                      <Text style={styles.subCardValue}>{details.equivalents.telugu}</Text>
                    </View>
                  )}
                  {!!details.equivalents.tulu && (
                    <View style={styles.subCard}>
                      <Text style={styles.subCardTitle}>ತುಳು / Tulu</Text>
                      <Text style={styles.subCardValue}>{details.equivalents.tulu}</Text>
                    </View>
                  )}
                </View>
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 8. Images */}
          {details.images && details.images.length > 0 && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("images")}
                delayPressIn={0}
                style={getAnimatedCardStyle("images")}
              >
                <Text style={styles.sectionTitle}>Images</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
                  {details.images.map((imgUrl, idx) => (
                    <View key={idx} style={styles.imageWrapper}>
                      <Image source={{ uri: imgUrl }} style={styles.galleryImage} resizeMode="cover" />
                    </View>
                  ))}
                </ScrollView>
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
    backgroundColor: "rgba(255, 255, 255, 0.6)",
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
    borderLeftWidth: 4,
    borderLeftColor: "#43AC98",
  },
  highlightedCard: {
    borderColor: "#2B2C51",
    borderWidth: 1.5,
  },
  mainWord: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2B2C51",
    fontFamily: "Roboto",
    textAlign: "center",
  },
  phonetic: {
    fontSize: 16,
    color: "#7C736B",
    marginTop: 6,
    fontFamily: "Roboto",
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
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
  highlightedSection: {
    borderColor: "#2B2C51",
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
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
    fontFamily: "NotoSansMalayalam",
  },
  contextUsage: {
    fontSize: 13,
    color: "#7C736B",
    fontFamily: "NotoSansMalayalam",
    marginTop: 6,
    backgroundColor: "#F9F6F1",
    padding: 8,
    borderRadius: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: "#F4EEE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryBadgeText: {
    color: "#2B2C51",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bulletIcon: {
    fontSize: 16,
    color: "#43AC98",
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 15,
    color: "#4E473E",
    flex: 1,
    lineHeight: 20,
    fontFamily: "NotoSansMalayalam",
  },
  gallery: {
    paddingVertical: 4,
  },
  imageWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F4EEE7",
    borderWidth: 1,
    borderColor: "#EAE6DF",
  },
  galleryImage: {
    width: 140,
    height: 140,
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
  equivalentsGrid: {
    marginTop: 4,
  },
  subCard: {
    backgroundColor: "#F9F6F1",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2D7CB",
  },
  subCardTitle: {
    fontSize: 12,
    color: "#898683",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  subCardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2B2C51",
  },
});
