import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

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
  
  equivalents?: {
    kannada?: string;
    tamil?: string;
    telugu?: string;
    tulu?: string;
    english?: string;
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
  Platform.OS === "android" ? "http://192.168.1.5:5000" : "http://localhost:5000",
  "http://192.168.1.5:5000",
].filter((value): value is string => Boolean(value));

export default function WordDetailsScreen() {
  const { dictionaryId } = useLocalSearchParams();
  const [details, setDetails] = useState<DictionaryEntryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
          const response = await fetch(`${apiBaseUrl}/api/words/details/${dictionaryId}`);

          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Request failed with status ${response.status}`);
          }

          const data = await response.json();
          setDetails(data);
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

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color="#2B2C51" />
        <Text style={styles.stateText}>വിവരങ്ങൾ ശേഖരിക്കുന്നു...</Text>
      </View>
    );
  }

  if (errorMessage || !details) {
    return (
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={27} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>വിവരങ്ങൾ</Text>
          <View style={{ width: 27 }} />
        </View>

        <View style={styles.stateContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#7C736B" />
          <Text style={styles.stateTitle}>കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല</Text>
          <Text style={styles.stateText}>{errorMessage || "വിവരങ്ങൾ ലഭ്യമല്ല."}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadDetails()}>
            <Text style={styles.retryButtonText}>വീണ്ടും ശ്രമിക്കുക</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={27} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {details.word}
        </Text>
        <View style={{ width: 27 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Core Word Banner */}
        <View style={styles.wordCard}>
          <View style={styles.wordBadge}>
            <Text style={styles.wordBadgeText}>
              {details.word?.[0] ?? "അ"}
            </Text>
          </View>
          <Text style={styles.mainWord}>{details.word}</Text>
          
          {details.phonetic_transcription && (
            <Text style={styles.phonetic}>phonetic-transcription: [{details.phonetic_transcription}]</Text>
          )}

          {details.equivalents?.english && (
            <View style={styles.englishContainer}>
              <Text style={styles.englishLabel}>English Equivalent:</Text>
              <Text style={styles.englishValue}>{details.equivalents.english}</Text>
            </View>
          )}
        </View>

        {/* Meanings Section */}
        {details.meanings && details.meanings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>അർത്ഥങ്ങൾ (Meanings)</Text>
            {details.meanings.map((m, idx) => (
              <View key={m.id || idx} style={styles.meaningItem}>
                <View style={styles.meaningNumberBox}>
                  <Text style={styles.meaningNumber}>{idx + 1}</Text>
                </View>
                <View style={styles.meaningContent}>
                  <Text style={styles.meaningText}>{m.meaning}</Text>
                  {m.context_usage && (
                    <Text style={styles.contextUsage}>
                      <Text style={{ fontWeight: "700" }}>പ്രയോഗം: </Text>
                      {m.context_usage}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Lexical Information Cards */}
        {details.root && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ധാതു (Root)</Text>
            <Text style={styles.infoValue}>{details.root}</Text>
          </View>
        )}
        {details.category_names && details.category_names.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>വ്യാകരണ വിഭാഗം (Category)</Text>
            <View style={styles.categoriesContainer}>
              {details.category_names.map((catName, idx) => (
                <View key={idx} style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{catName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {details.etymology && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>വ്യുല്പത്തി (Etymology)</Text>
            <Text style={styles.infoValue}>{details.etymology}</Text>
          </View>
        )}
        {details.pronunciation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ഉച്ചാരണം (Pronunciation)</Text>
            <Text style={styles.infoValue}>{details.pronunciation}</Text>
          </View>
        )}
        {details.inflections && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>രൂപങ്ങൾ (Inflections)</Text>
            <Text style={styles.infoValue}>{details.inflections}</Text>
          </View>
        )}
        {details.synonyms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>പര്യായപദങ്ങൾ (Synonyms)</Text>
            <Text style={styles.infoValue}>{details.synonyms}</Text>
          </View>
        )}
        {details.antonyms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>വിപരീതപദങ്ങൾ (Antonyms)</Text>
            <Text style={styles.infoValue}>{details.antonyms}</Text>
          </View>
        )}
        {details.dialects && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>പ്രാദേശിക രൂപങ്ങൾ (Dialects)</Text>
            <Text style={styles.infoValue}>{details.dialects}</Text>
          </View>
        )}
        {details.similar_word && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>സമാന പദങ്ങൾ (Similar Words)</Text>
            <Text style={styles.infoValue}>{details.similar_word}</Text>
          </View>
        )}
        {details.novel_words && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>നവീന പ്രയോഗങ്ങൾ (Novel Words)</Text>
            <Text style={styles.infoValue}>{details.novel_words}</Text>
          </View>
        )}
        {details.cross_reference && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>മറ്റു സൂചനകൾ (Cross Ref)</Text>
            <Text style={styles.infoValue}>{details.cross_reference}</Text>
          </View>
        )}

        {/* Proverbs Section */}
        {((details.proverbs && details.proverbs.length > 0) || details.proverb) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>പഴഞ്ചൊല്ലുകൾ / ശൈലികൾ</Text>
            
            {details.proverb && (
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
                {p.context_usage && (
                  <Text style={styles.proverbContext}>
                    <Text style={{ fontWeight: "700" }}>പ്രയോഗം: </Text>
                    {p.context_usage}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Cultural Note */}
        {details.cultural_note && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>സാംസ്കാരിക പശ്ചാത്തലം</Text>
            <View style={styles.culturalCard}>
              <Ionicons name="globe-outline" size={24} color="#2B2C51" style={{ marginBottom: 6 }} />
              <Text style={styles.culturalText}>{details.cultural_note}</Text>
            </View>
          </View>
        )}

        {/* Images Section */}
        {details.images && details.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ചിത്രങ്ങൾ (Gallery)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
              {details.images.map((imgUrl, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image source={{ uri: imgUrl }} style={styles.galleryImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 5,
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
    borderColor: "#E7E0D7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    color: "#1F2330",
    fontFamily: "NotoSansMalayalam",
    textAlign: "center",
  },
  phonetic: {
    fontSize: 16,
    color: "#7C736B",
    marginTop: 4,
    fontStyle: "italic",
  },
  englishContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F4EEE7",
    width: "100%",
    alignItems: "center",
  },
  englishLabel: {
    fontSize: 12,
    color: "#898683",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  englishValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2B2C51",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E7E0D7",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
    color: "#4E473E",
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
  equivalentsGrid: {
    marginTop: 4,
  },
  equivalentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F4EEE7",
  },
  equivalentLang: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C736B",
  },
  equivalentValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2330",
  },
  infoList: {
    marginTop: 4,
  },
  infoItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F4EEE7",
  },
  infoLabel: {
    fontSize: 12,
    color: "#898683",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "600",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 20,
  },
  proverbItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9F6F1",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  proverbText: {
    fontSize: 15,
    color: "#4E473E",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 22,
    flex: 1,
    fontStyle: "italic",
  },
  proverbContainer: {
    backgroundColor: "#F9F6F1",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  proverbHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  proverbTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2B2C51",
  },
  proverbContext: {
    fontSize: 13,
    color: "#7C736B",
    marginTop: 6,
    fontFamily: "NotoSansMalayalam",
  },
  culturalCard: {
    backgroundColor: "#F9F6F1",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2B2C51",
  },
  culturalText: {
    fontSize: 15,
    color: "#4E473E",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 22,
  },
  gallery: {
    paddingVertical: 4,
  },
  imageWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E7E0D7",
  },
  galleryImage: {
    width: 200,
    height: 150,
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
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: "#F4EEE7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2D7CB",
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
  },
});
