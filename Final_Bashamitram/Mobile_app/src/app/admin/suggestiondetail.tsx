/**
 * @file suggestiondetail.tsx
 * @description Admin dashboard view screen for suggestiondetail management.
 */

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

interface SuggestedWordDetails {
  _id: string;
  word: string;
  englishWord: string;
  malayalamMeaning: string;
  status: "pending" | "approved" | "rejected";
  language_type?: string;
  root?: string;
  etymology?: string;
  cultural_note?: string;
  synonyms?: string;
  antonyms?: string;
  dialects?: string;
  proverb?: string;
  similar_word?: string;
  novel_words?: string;
  cross_reference?: string;
  inflections?: string;
  gender?: string;
  phonetic_transcription?: string;
  pronunciation?: string;
  equivalents?: {
    kannada?: string;
    tamil?: string;
    telugu?: string;
    tulu?: string;
    english?: string;
  };
  equivalent_languages?: Array<{
    language: string;
    translation: string;
  }>;
  contributor?: {
    name: string;
    email: string;
  };
  images?: string[];
  meanings?: Array<{
    id: number;
    meaning: string;
    context_usage?: string;
  }>;
  proverbs?: Array<{
    id: number;
    proverb: string;
    context_usage?: string;
  }>;
  createdAt?: string;
}

const API_URL = `${process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"}/api/admin/suggestions`;

const getImageUrl = (imgUrl: string) => {
  if (!imgUrl) return "";
  if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://") || imgUrl.startsWith("data:")) {
    return imgUrl;
  }
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com";
  const relativePath = imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`;
  const finalPath = relativePath.startsWith("/public") ? relativePath : `/public${relativePath}`;
  return `${apiBaseUrl}${finalPath}`;
};

/**
 * Renders and manages the SuggestionDetailScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function SuggestionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [details, setDetails] = useState<SuggestedWordDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  /**
 * Asynchronous controller/helper function: fetchDetails.
 */
const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load details");
      }
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch suggestion details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  /**
 * Asynchronous controller/helper function: updateStatus.
 */
const updateStatus = async (action: "approve" | "reject") => {
    try {
      setUpdating(true);
      const response = await fetch(`${API_URL}/${id}/${action}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} suggestion`);
      }

      Alert.alert(
        "Success",
        `Suggestion successfully ${action === "approve" ? "approved" : "rejected"}.`
      );
      fetchDetails();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", `Unable to update suggestion: ${action}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2B2C51" />
        <Text style={styles.loadingText}>Fetching Details...</Text>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="red" />
        <Text style={styles.errorText}>No details found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderBadgeList = (text?: string) => {
    if (!text || text.trim() === "") return null;
    const items = text.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean);
    return (
      <View style={styles.badgeRow}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.badge}>
            <Text style={styles.badgeText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Word Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Word Card */}
        <View style={styles.card}>
          <Text style={styles.wordTypeLabel}>
            {(details.language_type || "malayalam").toUpperCase()} SUGGESTION
          </Text>
          <Text style={styles.word}>{details.englishWord}</Text>
          {!!details.phonetic_transcription && (
            <Text style={styles.phonetic}>[{details.phonetic_transcription}]</Text>
          )}

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                details.status === "approved"
                  ? styles.approvedBg
                  : details.status === "rejected"
                  ? styles.rejectedBg
                  : styles.pendingBg,
              ]}
            >
              <Text style={styles.statusText}>{details.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {!!details.root && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Root Word:</Text>
              <Text style={styles.infoValue}>{details.root}</Text>
            </View>
          )}
          {!!details.gender && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{details.gender}</Text>
            </View>
          )}
          {!!details.etymology && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Etymology:</Text>
              <Text style={styles.infoValue}>{details.etymology}</Text>
            </View>
          )}
          {!!details.cultural_note && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Cultural Significance:</Text>
              <Text style={styles.infoBlockText}>{details.cultural_note}</Text>
            </View>
          )}
        </View>

        {/* Meanings */}
        {details.meanings && details.meanings.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Meanings &amp; Context</Text>
            {details.meanings.filter(Boolean).map((m, idx) => (
              <View key={m.id || idx} style={styles.meaningItem}>
                <Text style={styles.meaningIndex}>{idx + 1}.</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.meaningText}>{m.meaning}</Text>
                  {!!m.context_usage && (
                    <Text style={styles.contextUsage}>Usage: {m.context_usage}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Language Equivalents */}
        {details.equivalents &&
          (details.equivalents.kannada ||
            details.equivalents.tamil ||
            details.equivalents.telugu ||
            details.equivalents.tulu ||
            details.equivalents.english) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Language Equivalents</Text>
              {Object.entries(details.equivalents).map(([lang, val]) => {
                if (!val) return null;
                return (
                  <View key={lang} style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{lang.toUpperCase()}:</Text>
                    <Text style={styles.infoValue}>{val}</Text>
                  </View>
                );
              })}
            </View>
          )}

        {/* Custom Language Equivalents */}
        {details.equivalent_languages && details.equivalent_languages.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Other Language Equivalents</Text>
            {details.equivalent_languages.map((el, idx) => (
              <View key={idx} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{el.language}:</Text>
                <Text style={styles.infoValue}>{el.translation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Lexical Relationships */}
        {(details.synonyms ||
          details.antonyms ||
          details.dialects ||
          details.novel_words ||
          details.cross_reference) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Lexical Relations &amp; Tags</Text>
            {!!details.synonyms && (
              <View style={styles.relationContainer}>
                <Text style={styles.relationLabel}>Synonyms</Text>
                {renderBadgeList(details.synonyms)}
              </View>
            )}
            {!!details.antonyms && (
              <View style={styles.relationContainer}>
                <Text style={styles.relationLabel}>Antonyms</Text>
                {renderBadgeList(details.antonyms)}
              </View>
            )}
            {!!details.dialects && (
              <View style={styles.relationContainer}>
                <Text style={styles.relationLabel}>Dialects</Text>
                {renderBadgeList(details.dialects)}
              </View>
            )}
            {!!details.novel_words && (
              <View style={styles.relationContainer}>
                <Text style={styles.relationLabel}>Novel Words</Text>
                {renderBadgeList(details.novel_words)}
              </View>
            )}
            {!!details.cross_reference && (
              <View style={styles.relationContainer}>
                <Text style={styles.relationLabel}>Cross References</Text>
                {renderBadgeList(details.cross_reference)}
              </View>
            )}
          </View>
        )}

        {/* Proverbs */}
        {details.proverbs && details.proverbs.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Proverbs &amp; Sayings</Text>
            {details.proverbs.map((p, idx) => (
              <View key={p.id || idx} style={styles.proverbContainer}>
                <Text style={styles.proverbText}>{`"${p.proverb}"`}</Text>
                {!!p.context_usage && (
                  <Text style={styles.proverbContext}>Context: {p.context_usage}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Media Attachments */}
        {details.images && details.images.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Uploaded Media</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {details.images.map((imgUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: getImageUrl(imgUrl) }}
                  style={styles.attachedImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Pronunciation Audio (Placeholder indicator) */}
        {!!details.pronunciation && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pronunciation Audio</Text>
            <View style={styles.audioRow}>
              <Ionicons name="mic-outline" size={24} color="#2B2C51" />
              <Text style={styles.audioText}>Voice recording attached (Base64 data present)</Text>
            </View>
          </View>
        )}

        {/* Contributor Information */}
        {details.contributor && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Contributor Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{details.contributor.name || "Anonymous"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{details.contributor.email || "N/A"}</Text>
            </View>
          </View>
        )}

        {/* Actions Button Panel */}
        {details.status === "pending" && (
          <View style={styles.actionsPanel}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn, updating && styles.disabledBtn]}
              onPress={() => updateStatus("approve")}
              disabled={updating}
            >
              <Text style={styles.btnText}>Approve Suggestion</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn, updating && styles.disabledBtn]}
              onPress={() => updateStatus("reject")}
              disabled={updating}
            >
              <Text style={styles.btnText}>Reject Suggestion</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F1",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F6F1",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#2B2C51",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  header: {
    height: Platform.OS === "android" ? 75 : 95,
    backgroundColor: "#2B2C51",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "android" ? 25 : 35,
  },
  headerBtn: {
    padding: 5,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  wordTypeLabel: {
    fontSize: 11,
    color: "#43AC98",
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  word: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2B2C51",
    textAlign: "center",
  },
  phonetic: {
    fontSize: 16,
    color: "#7C736B",
    marginTop: 4,
  },
  statusContainer: {
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  approvedBg: {
    backgroundColor: "#E6F4EA",
  },
  rejectedBg: {
    backgroundColor: "#FCE8E6",
  },
  pendingBg: {
    backgroundColor: "#FEF7E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#333",
  },
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2B2C51",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3EFE9",
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontSize: 14,
    color: "#7C736B",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#2B2C51",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
    paddingLeft: 10,
  },
  infoBlock: {
    marginTop: 8,
  },
  infoBlockText: {
    fontSize: 14,
    color: "#4E473E",
    lineHeight: 20,
    marginTop: 4,
  },
  meaningItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  meaningIndex: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 6,
    color: "#43AC98",
  },
  meaningText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  contextUsage: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  relationContainer: {
    marginBottom: 10,
  },
  relationLabel: {
    fontSize: 13,
    color: "#7C736B",
    fontWeight: "bold",
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#F4EEE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    color: "#2B2C51",
    fontSize: 12,
    fontWeight: "600",
  },
  proverbContainer: {
    backgroundColor: "#F9F6F1",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#43AC98",
  },
  proverbText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#333",
  },
  proverbContext: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  attachedImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4EEE7",
    padding: 12,
    borderRadius: 10,
  },
  audioText: {
    marginLeft: 10,
    color: "#2B2C51",
    fontSize: 13,
  },
  actionsPanel: {
    marginTop: 10,
  },
  actionBtn: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  approveBtn: {
    backgroundColor: "green",
  },
  rejectBtn: {
    backgroundColor: "red",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  btnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
