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
  id: number;
  word: string;
  phonetic_transcription?: string;
  root?: string;
  etymology?: string;
  cultural_note?: string;
  synonyms?: string;
  antonyms?: string;
  dialects?: string;
  proverb?: string;
  similar_word?: string;
  novel_words?: string;
  pronunciation?: string;
  cross_reference?: string;
  inflections?: string;
  gender?: string;
  metadata?: any;

  equivalents?: {
    kannada?: string;
    tamil?: string;
    telugu?: string;
    tulu?: string;
    english?: string;
    malayalam?: string;
  };

  images?: string[];
  category_names?: string[];
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
};

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000",
  "http://192.168.1.2:5000",
].filter((value): value is string => Boolean(value));

export default function MalayalamWordDetailsScreen() {
  const { dictionaryId, type } = useLocalSearchParams();
  const [details, setDetails] = useState<DictionaryEntryDetails | null>(null);
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

  const loadDetails = async () => {
    if (!dictionaryId) {
      setErrorMessage("ശരിയായ വാക്ക് കണ്ടെത്താൻ സാധിച്ചില്ല.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      let lastError: unknown = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Details] Fetching details for ID: ${dictionaryId} from ${apiBaseUrl}`);
          const response = await fetch(`${apiBaseUrl}/api/malayalam-malayalam/${dictionaryId}`);

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setDetails(data);
          if (data && data.word) {
            void saveRecentOpening(Number(dictionaryId), data.word);
          }
          return; // Success, exit function
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError instanceof Error ? lastError : new Error("Could not reach the dictionary backend.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "വിവരങ്ങൾ ലഭ്യമാക്കാൻ സാധിച്ചില്ല."
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
                <Text style={styles.sectionTitle}>വ്യാകരണവിഭാഗം / Category</Text>
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
          {!!(details.gender || details.metadata?.gender) && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("gender")}
                delayPressIn={0}
                style={getAnimatedCardStyle("gender")}
              >
                <Text style={styles.sectionTitle}>ലിംഗം / Gender</Text>
                {renderBulletedList(details.gender || details.metadata?.gender)}
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
                <Text style={styles.sectionTitle}>ധാതു / Root</Text>
                {renderBulletedList(details.root)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 5. Phonetic transcription */}
          {!!details.phonetic_transcription && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("phonetic")}
                delayPressIn={0}
                style={getAnimatedCardStyle("phonetic")}
              >
                <Text style={styles.sectionTitle}>Phonetic transcription</Text>
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
                <Text style={styles.sectionTitle}>അർത്ഥങ്ങൾ & സന്ദർഭം / Meanings & Context</Text>
                {details.meanings.map((m, idx) => (
                  <View key={m.id || idx} style={styles.meaningItem}>
                    <View style={styles.meaningNumberBox}>
                      <Text style={styles.meaningNumber}>{idx + 1}</Text>
                    </View>
                    <View style={styles.meaningContent}>
                      <Text style={styles.meaningText}>{m.meaning}</Text>
                      {!!m.context_usage && (
                        <Text style={styles.contextUsage}>
                          <Text style={{ fontWeight: "700" }}>പ്രയോഗം: </Text>
                          {m.context_usage}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 7. Proverbs & Context */}
          {((details.proverbs && details.proverbs.length > 0) || !!details.proverb) && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("proverbs")}
                delayPressIn={0}
                style={getAnimatedCardStyle("proverbs")}
              >
                <Text style={styles.sectionTitle}>പഴഞ്ചൊല്ലുകൾ & സന്ദർഭം / Proverbs & Context</Text>

                {!!details.proverb && (
                  <View style={styles.proverbItem}>
                    <Ionicons name="bookmark-outline" size={20} color="#2B2C51" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.proverbText}>{details.proverb}</Text>
                  </View>
                )}

                {details.proverbs?.map((p, idx) => (
                  <View key={p.id || idx} style={styles.proverbContainer}>
                    <View style={styles.proverbHeader}>
                      <Ionicons name="chatbubbles-outline" size={18} color="#2B2C51" style={{ marginRight: 6 }} />
                      <Text style={styles.proverbTitle}>ശൈലി {idx + 1}</Text>
                    </View>
                    <Text style={styles.proverbText}>{p.proverb}</Text>
                    {!!p.context_usage && (
                      <Text style={styles.proverbContext}>
                        <Text style={{ fontWeight: "700" }}>പ്രയോഗം: </Text>
                        {p.context_usage}
                      </Text>
                    )}
                  </View>
                ))}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 8. Etymology */}
          {!!details.etymology && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("etymology")}
                delayPressIn={0}
                style={getAnimatedCardStyle("etymology")}
              >
                <Text style={styles.sectionTitle}>വാക്കിന്റെ ഉത്ഭവം / Etymology</Text>
                {renderBulletedList(details.etymology)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 9. Cultural Notes */}
          {!!details.cultural_note && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("cultural_note")}
                delayPressIn={0}
                style={getAnimatedCardStyle("cultural_note")}
              >
                <Text style={styles.sectionTitle}>സാംസ്കാരിക കുറിപ്പ് / Cultural Notes</Text>
                <View style={styles.culturalCard}>
                  <Ionicons name="globe-outline" size={24} color="#2B2C51" style={{ marginBottom: 6 }} />
                  {renderBulletedList(details.cultural_note)}
                </View>
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 10. Similar words */}
          {!!details.similar_word && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("similar_word")}
                delayPressIn={0}
                style={getAnimatedCardStyle("similar_word")}
              >
                <Text style={styles.sectionTitle}>സമാന പദങ്ങൾ / Similar Words</Text>
                {renderBulletedList(details.similar_word)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 11. Novel Words */}
          {!!details.novel_words && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("novel_words")}
                delayPressIn={0}
                style={getAnimatedCardStyle("novel_words")}
              >
                <Text style={styles.sectionTitle}>നവീന പ്രയോഗങ്ങൾ / Novel Words</Text>
                {renderBulletedList(details.novel_words)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 12. Synonyms */}
          {!!details.synonyms && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("synonyms")}
                delayPressIn={0}
                style={getAnimatedCardStyle("synonyms")}
              >
                <Text style={styles.sectionTitle}>പര്യായപദങ്ങൾ / Synonyms</Text>
                {renderBulletedList(details.synonyms)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 13. Antonyms */}
          {!!details.antonyms && (
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

          {/* 14. Dialects */}
          {!!details.dialects && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("dialects")}
                delayPressIn={0}
                style={getAnimatedCardStyle("dialects")}
              >
                <Text style={styles.sectionTitle}>പ്രാദേശിക പ്രയോഗങ്ങൾ / Dialects</Text>
                {renderBulletedList(details.dialects)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 15. Cross Reference */}
          {!!details.cross_reference && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("cross_reference")}
                delayPressIn={0}
                style={getAnimatedCardStyle("cross_reference")}
              >
                <Text style={styles.sectionTitle}>പരാമർശങ്ങൾ / Cross References</Text>
                {renderBulletedList(details.cross_reference)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 16. Inflections */}
          {!!details.inflections && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("inflections")}
                delayPressIn={0}
                style={getAnimatedCardStyle("inflections")}
              >
                <Text style={styles.sectionTitle}>വ്യാകരണ രൂപങ്ങൾ / Inflections</Text>
                {renderBulletedList(details.inflections)}
              </AnimatedTouchableOpacity>
            </AnimatedCard>
          )}

          {/* 17. Language Equivalents */}
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
                  {/* English Sub Card */}
                  {!!details.equivalents.english && (
                    <View style={styles.subCard}>
                      <Text style={styles.subCardTitle}>English</Text>
                      <Text style={styles.subCardValue}>{details.equivalents.english}</Text>
                    </View>
                  )}
                  {/* Kannada Sub Card */}
                  {!!details.equivalents.kannada && (
                    <View style={styles.subCard}>
                      <Text style={styles.subCardTitle}>ಕನ್ನಡ / Kannada</Text>
                      <Text style={styles.subCardValue}>{details.equivalents.kannada}</Text>
                    </View>
                  )}
                  {/* Tamil Sub Card */}
                  {!!details.equivalents.tamil && (
                    <View style={styles.subCard}>
                      <Text style={styles.subCardTitle}>தமிழ் / Tamil</Text>
                      <Text style={styles.subCardValue}>{details.equivalents.tamil}</Text>
                    </View>
                  )}
                  {/* Telugu Sub Card */}
                  {!!details.equivalents.telugu && (
                    <View style={styles.subCard}>
                      <Text style={styles.subCardTitle}>తెలుగు / Telugu</Text>
                      <Text style={styles.subCardValue}>{details.equivalents.telugu}</Text>
                    </View>
                  )}
                  {/* Tulu Sub Card */}
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

          {/* Images */}
          {details.images && details.images.length > 0 && (
            <AnimatedCard index={cardIndex++} scrollY={scrollY}>
              <AnimatedTouchableOpacity
                activeOpacity={0.95}
                onPressIn={() => toggleHighlight("images")}
                delayPressIn={0}
                style={getAnimatedCardStyle("images")}
              >
                <Text style={styles.sectionTitle}>ചിത്രങ്ങൾ (Gallery)</Text>
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
    fontFamily: "NotoSansMalayalam",
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
  culturalCard: {
    backgroundColor: "#F9F6F1",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2D7CB",
  },
  proverbItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    backgroundColor: "#F9F6F1",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2D7CB",
  },
  proverbContainer: {
    backgroundColor: "#F9F6F1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2D7CB",
  },
  proverbHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  proverbTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
  },
  proverbText: {
    fontSize: 15,
    color: "#333",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 20,
  },
  proverbContext: {
    fontSize: 13,
    color: "#7C736B",
    fontFamily: "NotoSansMalayalam",
    marginTop: 6,
    fontStyle: "italic",
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
});
