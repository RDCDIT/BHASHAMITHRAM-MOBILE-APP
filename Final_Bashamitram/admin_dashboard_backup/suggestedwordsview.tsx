/**
 * @file suggestedwordsview.tsx
 * @description Admin dashboard view screen for managing suggested words via local SQLite and cloud sync.
 */

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  getLocalSuggestedWords,
  updateLocalSuggestedWordStatus,
  deleteLocalSuggestedWord,
  LocalSuggestedWord,
} from "../../database/dictionaryService";

export interface UnifiedSuggestion {
  id: string | number;
  word: string;
  meaning: string;
  language_type?: string;
  status: "pending" | "approved" | "rejected";
  contributor_name?: string;
  contributor_email?: string;
  created_at?: string;
  source: "sqlite" | "cloud";
}

const API_URL = `${process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"}/api/admin/suggestions`;

const SuggestedWordsScreen: React.FC = () => {
  const [suggestions, setSuggestions] = useState<UnifiedSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  /**
   * Loads suggestions directly from local SQLite database, with optional cloud fallback/sync.
   */
  const loadSuggestions = async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const unifiedList: UnifiedSuggestion[] = [];

    // 1. Primary: Load from offline local SQLite database
    try {
      const localRows: LocalSuggestedWord[] = await getLocalSuggestedWords("all");
      localRows.forEach((row) => {
        unifiedList.push({
          id: row.id ?? `local_${Date.now()}_${Math.random()}`,
          word: row.word,
          meaning: row.meaning,
          language_type: row.language_type,
          status: row.status || "pending",
          contributor_name: row.contributor_name,
          contributor_email: row.contributor_email,
          created_at: row.created_at,
          source: "sqlite",
        });
      });
    } catch (sqliteErr) {
      console.warn("Notice: Local SQLite suggestions read:", sqliteErr);
    }

    // 2. Secondary: If online and API URL is available, merge any cloud records
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const cloudData: any[] = Array.isArray(result) ? result : result.data || [];

        cloudData.forEach((item) => {
          const cloudWord = item.word || item.englishWord || "";
          const cloudMeaning = item.meaning || item.malayalamMeaning || "";
          const cloudId = item._id || item.id;

          // Avoid duplicate display if already loaded from SQLite
          const exists = unifiedList.some(
            (u) =>
              u.word.trim().toLowerCase() === cloudWord.trim().toLowerCase() &&
              u.meaning.trim() === cloudMeaning.trim()
          );

          if (!exists && cloudWord) {
            unifiedList.push({
              id: cloudId,
              word: cloudWord,
              meaning: cloudMeaning,
              language_type: item.language_type || "malayalam",
              status: (item.status as any) || "pending",
              contributor_name: item.contributor?.name || item.contributor_name,
              contributor_email: item.contributor?.email || item.contributor_email,
              created_at: item.createdAt || item.created_at,
              source: "cloud",
            });
          }
        });
      }
    } catch (cloudErr) {
      // Graceful offline fallback - no interruption to user
      console.log("[SuggestedWords] Running in local offline SQLite mode.");
    }

    setSuggestions(unifiedList);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  /**
   * Approves or rejects a suggestion directly in local SQLite.
   */
  const handleUpdateStatus = async (
    item: UnifiedSuggestion,
    action: "approve" | "reject"
  ) => {
    const newStatus: "pending" | "approved" | "rejected" =
      action === "approve" ? "approved" : "rejected";

    // Update in local SQLite
    await updateLocalSuggestedWordStatus(item.id, newStatus);

    // Also attempt remote update if from cloud or online
    if (item.source === "cloud" || typeof item.id === "string") {
      try {
        await fetch(`${API_URL}/${item.id}/${action}`, { method: "PUT" });
      } catch (e) {
        // Silently handled
      }
    }

    // Update local state instantly
    setSuggestions((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, status: newStatus } : s))
    );

    Alert.alert(
      "വിജയകരം (Success)",
      `വാക്ക് വിജയകരമായി ${action === "approve" ? "അംഗീകരിച്ചു (Approved)" : "നിരസിച്ചു (Rejected)"}.`
    );
  };

  /**
   * Deletes a suggestion permanently from local database.
   */
  const handleDelete = (item: UnifiedSuggestion) => {
    Alert.alert(
      "ഡിലീറ്റ് ചെയ്യുക (Delete)",
      `"${item.word}" എന്ന നിർദ്ദേശം ലിസ്റ്റിൽ നിന്നും ഒഴിവാക്കണമോ?`,
      [
        { text: "റദ്ദാക്കുക (Cancel)", style: "cancel" },
        {
          text: "ഡിലീറ്റ് (Delete)",
          style: "destructive",
          onPress: async () => {
            await deleteLocalSuggestedWord(item.id);
            setSuggestions((prev) => prev.filter((s) => s.id !== item.id));
          },
        },
      ]
    );
  };

  // Filtered and searched data
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((item) => {
      const matchesFilter = filter === "all" || item.status === filter;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesFilter;

      const matchesSearch =
        item.word.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        (item.contributor_name && item.contributor_name.toLowerCase().includes(query)) ||
        (item.contributor_email && item.contributor_email.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [suggestions, filter, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: suggestions.length,
      pending: suggestions.filter((s) => s.status === "pending").length,
      approved: suggestions.filter((s) => s.status === "approved").length,
      rejected: suggestions.filter((s) => s.status === "rejected").length,
    };
  }, [suggestions]);

  const renderItem = ({ item }: { item: UnifiedSuggestion }) => {
    const isPending = item.status === "pending";
    const isApproved = item.status === "approved";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/admin/suggestiondetail",
            params: { id: String(item.id) },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>
                {(item.language_type || "malayalam").toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isPending
                  ? styles.statusPending
                  : isApproved
                  ? styles.statusApproved
                  : styles.statusRejected,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isPending
                    ? styles.statusPendingText
                    : isApproved
                    ? styles.statusApprovedText
                    : styles.statusRejectedText,
                ]}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.word}>{item.word}</Text>
        <Text style={styles.meaning} numberOfLines={2}>
          {item.meaning}
        </Text>

        {item.contributor_name ? (
          <View style={styles.contributorRow}>
            <Ionicons name="person-outline" size={13} color="#64748B" />
            <Text style={styles.contributorText} numberOfLines={1}>
              {item.contributor_name}
              {item.contributor_email ? ` (${item.contributor_email})` : ""}
            </Text>
          </View>
        ) : null}

        {/* Action Buttons for Pending items */}
        {isPending && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                handleUpdateStatus(item, "approve");
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={17} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>അംഗീകരിക്കുക (Approve)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                handleUpdateStatus(item, "reject");
              }}
            >
              <Ionicons name="close-circle-outline" size={17} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>നിരസിക്കുക (Reject)</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#2B2C51" barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>പദ നിർദ്ദേശങ്ങൾ</Text>
          <Text style={styles.headerSubtitle}>Word Suggestions (Offline SQLite)</Text>
        </View>

        <TouchableOpacity
          onPress={() => loadSuggestions(true)}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="തിരയുക (Search by word, meaning, contributor)..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {(
            [
              { key: "pending", label: "പരിശോധനയിൽ", count: counts.pending },
              { key: "approved", label: "അംഗീകരിച്ചവ", count: counts.approved },
              { key: "rejected", label: "നിരസിച്ചവ", count: counts.rejected },
              { key: "all", label: "എല്ലാം", count: counts.all },
            ] as const
          ).map((tab) => {
            const active = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, active && styles.activeTabButton]}
                onPress={() => setFilter(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, active && styles.activeTabText]}>
                  {tab.label}
                </Text>
                <View style={[styles.countBadge, active && styles.activeCountBadge]}>
                  <Text style={[styles.countText, active && styles.activeCountText]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2B2C51" />
            <Text style={styles.loadingText}>നിർദ്ദേശങ്ങൾ ശേഖരിക്കുന്നു...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadSuggestions(true)}
                colors={["#2B2C51"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="file-tray-outline" size={54} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>നിർദ്ദേശങ്ങളൊന്നും കണ്ടെത്തിയില്ല</Text>
                <Text style={styles.emptySubtitle}>
                  {filter === "pending"
                    ? "പുതിയ പരിശോധനാ നിർദ്ദേശങ്ങളൊന്നും നിലവിലില്ല."
                    : "ഈ വിഭാഗത്തിൽ നിർദ്ദേശിച്ച വാക്കുകൾ ലഭ്യമല്ല."}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SuggestedWordsScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#2B2C51",
  },
  header: {
    height: Platform.OS === "android" ? 64 : 70,
    backgroundColor: "#2B2C51",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  headerSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 1,
  },
  body: {
    flex: 1,
    backgroundColor: "#F9F6F1",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#1E293B",
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: "NotoSansMalayalam",
  },
  activeTabText: {
    color: "#2B2C51",
    fontWeight: "700",
  },
  countBadge: {
    backgroundColor: "#CBD5E1",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  activeCountBadge: {
    backgroundColor: "#2B2C51",
  },
  countText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  activeCountText: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  langBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4F46E5",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusPendingText: {
    color: "#D97706",
  },
  statusApproved: {
    backgroundColor: "#ECFDF5",
  },
  statusApprovedText: {
    color: "#059669",
  },
  statusRejected: {
    backgroundColor: "#FEE2E2",
  },
  statusRejectedText: {
    color: "#DC2626",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  deleteButton: {
    padding: 4,
  },
  word: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },
  meaning: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: "NotoSansMalayalam",
  },
  contributorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  contributorText: {
    fontSize: 11,
    color: "#64748B",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    fontFamily: "NotoSansMalayalam",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 14,
    fontFamily: "NotoSansMalayalam",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    fontFamily: "NotoSansMalayalam",
  },
});