/**
 * @file suggestedwordsview.tsx
 * @description Admin dashboard view screen for suggestedwordsview management.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";

interface SuggestedWord {
  _id: string;
  englishWord: string;
  malayalamMeaning: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

const API_URL = `${process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"}/api/admin/suggestions`;

const SuggestedWordsScreen: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestedWord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  /**
 * Asynchronous controller/helper function: fetchSuggestions.
 */
const fetchSuggestions = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const result = await response.json();

      setSuggestions(result.data || result);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  /**
 * Asynchronous controller/helper function: updateStatus.
 */
const updateStatus = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/${id}/${action}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      fetchSuggestions();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to update suggestion");
    }
  };

  const filteredSuggestions = suggestions.filter(
    (item) => item.status === filter
  );

  const renderItem = ({
    item,
  }: {
    item: SuggestedWord;
  }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/admin/suggestiondetail",
          params: { id: item._id },
        })
      }
    >
      <Text style={styles.word}>
        {item.englishWord}
      </Text>

      <Text style={styles.meaning}>
        {item.malayalamMeaning}
      </Text>

      <Text style={styles.status}>
        Status: {item.status}
      </Text>

      {item.status === "pending" && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            onPress={(e) => {
              e.stopPropagation();
              updateStatus(item._id, "approve");
            }}
          >
            <Text style={styles.buttonText}>
              Approve
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={(e) => {
              e.stopPropagation();
              updateStatus(item._id, "reject");
            }}
          >
            <Text style={styles.buttonText}>
              Reject
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Suggested Words Dashboard
      </Text>

      <View style={styles.tabs}>
        {(["pending", "approved", "rejected"] as const).map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.tab,
                filter === status && styles.activeTab,
              ]}
              onPress={() => setFilter(status)}
            >
              <Text>{status.toUpperCase()}</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchSuggestions}
        />
      )}
    </View>
  );
};

export default SuggestedWordsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  tabs: {
    flexDirection: "row",
    marginBottom: 15,
  },

  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  activeTab: {
    backgroundColor: "#dceeff",
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
  },

  word: {
    fontSize: 20,
    fontWeight: "bold",
  },

  meaning: {
    fontSize: 16,
    marginTop: 4,
  },

  status: {
    marginTop: 8,
    color: "#666",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  approveButton: {
    backgroundColor: "green",
    marginRight: 5,
  },

  rejectButton: {
    backgroundColor: "red",
    marginLeft: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});