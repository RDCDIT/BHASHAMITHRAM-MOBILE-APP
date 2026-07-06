/**
 * @file admin.tsx
 * @description Admin dashboard view screen for admin management.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

/**
 * Renders and manages the AdminDashboardScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function AdminDashboardScreen() {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B2C51" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Portal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>Welcome, Administrator</Text>
        <Text style={styles.subtitleText}>Manage app database and user submissions</Text>

        {/* Dashboard Grid */}
        <View style={styles.grid}>
          {/* Card: Word Suggestions */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/suggestedwordsview")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#EBF5FF" }]}>
              <Ionicons name="document-text" size={32} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Word Suggestions</Text>
            <Text style={styles.cardDescription}>
              View, approve, or reject user-submitted vocabulary entries
            </Text>
            <View style={styles.actionRow}>
              <Text style={styles.actionText}>Manage suggestions</Text>
              <Ionicons name="arrow-forward" size={16} color="#2563EB" />
            </View>
          </TouchableOpacity>

          {/* Card: SQL Data Import */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/sqlimport")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#E6F4EA" }]}>
              <Ionicons name="server" size={32} color="#137333" />
            </View>
            <Text style={styles.cardTitle}>SQL Data Import</Text>
            <Text style={styles.cardDescription}>
              Import words from an external SQLite database into MongoDB collections
            </Text>
            <View style={styles.actionRow}>
              <Text style={[styles.actionText, { color: "#137333" }]}>Import database</Text>
              <Ionicons name="arrow-forward" size={16} color="#137333" />
            </View>
          </TouchableOpacity>

          {/* Card: Add Word Record */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/manualinput")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="add-circle" size={32} color="#EA580C" />
            </View>
            <Text style={styles.cardTitle}>Add Word Record</Text>
            <Text style={styles.cardDescription}>
              Manually enter a new vocabulary record and import it directly into a specific dictionary
            </Text>
            <View style={styles.actionRow}>
              <Text style={[styles.actionText, { color: "#EA580C" }]}>Add record</Text>
              <Ionicons name="arrow-forward" size={16} color="#EA580C" />
            </View>
          </TouchableOpacity>

          {/* Card: Manage Dictionary Records */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/records")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="list" size={32} color="#7C3AED" />
            </View>
            <Text style={styles.cardTitle}>Manage Dictionary Records</Text>
            <Text style={styles.cardDescription}>
              View, search, edit, or delete existing records in all dictionary collections
            </Text>
            <View style={styles.actionRow}>
              <Text style={[styles.actionText, { color: "#7C3AED" }]}>Manage records</Text>
              <Ionicons name="arrow-forward" size={16} color="#7C3AED" />
            </View>
          </TouchableOpacity>

          {/* Card: Upload Word Media */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push("/admin/mediaupload")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#FCE7F3" }]}>
              <Ionicons name="cloud-upload" size={32} color="#DB2777" />
            </View>
            <Text style={styles.cardTitle}>Upload Word Media</Text>
            <Text style={styles.cardDescription}>
              Upload images and custom audio pronunciation files for existing dictionary words
            </Text>
            <View style={styles.actionRow}>
              <Text style={[styles.actionText, { color: "#DB2777" }]}>Upload media</Text>
              <Ionicons name="arrow-forward" size={16} color="#DB2777" />
            </View>
          </TouchableOpacity>

          {/* Card Placeholder: Users List (Disabled/Inactive) */}
          <View style={[styles.card, styles.disabledCard]}>
            <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="people" size={32} color="#9CA3AF" />
            </View>
            <Text style={[styles.cardTitle, styles.disabledText]}>User Database</Text>
            <Text style={[styles.cardDescription, styles.disabledText]}>
              Monitor registered contributors and manage permissions
            </Text>
            <View style={styles.actionRow}>
              <Text style={[styles.actionText, styles.disabledText]}>Coming Soon</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F1",
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
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2B2C51",
    marginTop: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: "#7C736B",
    marginTop: 4,
    marginBottom: 24,
  },
  grid: {
    flexDirection: "column",
    gap: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2B2C51",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: "#7C736B",
    lineHeight: 18,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  disabledCard: {
    opacity: 0.7,
    borderColor: "#E5E7EB",
  },
  disabledText: {
    color: "#9CA3AF",
  },
});
