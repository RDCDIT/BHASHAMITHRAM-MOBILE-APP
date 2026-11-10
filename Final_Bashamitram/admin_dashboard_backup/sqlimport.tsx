/**
 * @file sqlimport.tsx
 * @description Admin dashboard view screen for sqlimport management.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

/**
 * Renders and manages the SQLImportScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function SQLImportScreen() {
  const [sqlitePath, setSqlitePath] = useState("");
  const [targetDbName, setTargetDbName] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrationReport, setMigrationReport] = useState<string | null>(null);

  /**
 * Asynchronous controller/helper function: handlePickFile.
 */
const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/x-sqlite3",
          size: asset.size,
        });
        // Clear text path when a file is picked
        setSqlitePath("");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("File Error", "Failed to select the database file.");
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
  };

  /**
 * Asynchronous controller/helper function: handleStartMigration.
 */
const handleStartMigration = async () => {
    if (!targetDbName.trim()) {
      Alert.alert("Input Error", "Please specify a target MongoDB database name.");
      return;
    }

    if (!selectedFile && !sqlitePath.trim()) {
      Alert.alert("Input Error", "Please upload a database file or specify a valid local path.");
      return;
    }

    try {
      setLoading(true);
      setMigrationReport(null);

      const API_URL = `${process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"}/api/admin/migrate`;

      let response;

      if (selectedFile) {
        // Upload database file as multipart/form-data
        const formData = new FormData();
        formData.append("targetDbName", targetDbName.trim());
        
        if (Platform.OS === "web") {
          try {
            const blobRes = await fetch(selectedFile.uri);
            const fileBlob = await blobRes.blob();
            const fileObj = new File([fileBlob], selectedFile.name, { type: selectedFile.type });
            formData.append("file", fileObj);
          } catch (blobErr) {
            console.error("Blob conversion failed:", blobErr);
            // Fallback
            formData.append("file", {
              uri: selectedFile.uri,
              name: selectedFile.name,
              type: selectedFile.type,
            } as any);
          }
        } else {
          formData.append("file", {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.type,
          } as any);
        }

        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });
      } else {
        // Submit local database file path on server
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ 
            sqlitePath: sqlitePath.trim(),
            targetDbName: targetDbName.trim()
          }),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to execute migration");
      }

      setMigrationReport(JSON.stringify(result.report, null, 2) || "Migration executed successfully.");
      Alert.alert("Success", "Migration executed successfully!");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Migration Failed", err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B2C51" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import SQLite Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Select Database or SQL Script File</Text>
        <Text style={styles.subtitleText}>
          Upload a local SQLite database (`.db`) or raw SQL script (`.sql`) file directly from your device storage.
        </Text>

        {selectedFile ? (
          <View style={styles.fileContainer}>
            <View style={styles.fileInfo}>
              <Ionicons name="document" size={32} color="#2563EB" />
              <View style={styles.fileTextContainer}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>
                  {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "DB/SQL File"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClearSelectedFile} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadBox} onPress={handlePickFile} activeOpacity={0.7}>
            <Ionicons name="cloud-upload" size={40} color="#2563EB" />
            <Text style={styles.uploadBoxText}>Choose SQLite DB or SQL Script File</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.dividerText}>— OR —</Text>

        <Text style={styles.sectionTitle}>Local Server Path</Text>
        <Text style={styles.subtitleText}>
          Or reference an existing database/script path directly on the backend server filesystem.
        </Text>

        <TextInput
          style={[styles.textInput, selectedFile !== null && styles.disabledInput]}
          placeholder="e.g. data/dictionary.db"
          placeholderTextColor="#9CA3AF"
          value={sqlitePath}
          onChangeText={setSqlitePath}
          editable={selectedFile === null}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.sectionTitle}>Target MongoDB Database Name</Text>
        <Text style={styles.subtitleText}>
          Specify a brand new database name. The import will fail if this database already exists in MongoDB to prevent data replacement.
        </Text>

        <TextInput
          style={styles.textInput}
          placeholder="e.g. Imported_Dictionary_v1"
          placeholderTextColor="#9CA3AF"
          value={targetDbName}
          onChangeText={setTargetDbName}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleStartMigration}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Run Data Import</Text>
              <Ionicons name="play-forward" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        {migrationReport && (
          <View style={styles.reportContainer}>
            <Text style={styles.reportTitle}>Execution Report</Text>
            <ScrollView style={styles.reportScroll} nestedScrollEnabled={true}>
              <Text style={styles.reportText}>{migrationReport}</Text>
            </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2B2C51",
    marginTop: 10,
  },
  subtitleText: {
    fontSize: 13,
    color: "#7C736B",
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  uploadBoxText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 10,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  fileTextContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  fileSize: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  clearBtn: {
    padding: 4,
  },
  dividerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    marginVertical: 12,
  },
  textInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F0ECE6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2B2C51",
    marginBottom: 24,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    color: "#9CA3AF",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  reportContainer: {
    marginTop: 32,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F0ECE6",
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2B2C51",
    marginBottom: 12,
  },
  reportScroll: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  reportText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 12,
    color: "#374151",
  },
});
