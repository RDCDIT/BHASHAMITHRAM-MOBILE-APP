/**
 * @file mediaupload.tsx
 * @description Admin dashboard view screen for mediaupload management.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

const DICTIONARIES = [
  { id: "malayalam-malayalam", label: "Malayalam - Malayalam" },
  { id: "malayalam-english", label: "Malayalam - English" },
  { id: "english-malayalam", label: "English - Malayalam" },
  { id: "english-english", label: "English - English" },
  { id: "malayalam-synonym", label: "Malayalam Synonym" },
];

interface WordRecord {
  _id: number;
  word: string;
  meanings?: Array<{ meaning: string }>;
}

/**
 * Renders and manages the MediaUploadScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function MediaUploadScreen() {
  const [selectedDictionary, setSelectedDictionary] = useState("malayalam-malayalam");
  const [searchQuery, setSearchQuery] = useState("");
  const [words, setWords] = useState<WordRecord[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordRecord | null>(null);
  const [searching, setSearching] = useState(false);

  // Media state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Search words as query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setWords([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchWords();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedDictionary]);

  /**
 * Asynchronous controller/helper function: searchWords.
 */
const searchWords = async () => {
    try {
      setSearching(true);
      const API_URL = `${
        process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"
      }/api/admin/dictionary/words?dictionary=${selectedDictionary}&page=1&limit=20&search=${encodeURIComponent(
        searchQuery
      )}`;

      const response = await fetch(API_URL);
      const data = await response.json();

      if (response.ok && data.records) {
        setWords(data.records);
      } else {
        setWords([]);
      }
    } catch (error) {
      console.error("Error searching words:", error);
    } finally {
      setSearching(false);
    }
  };

  /**
 * Asynchronous controller/helper function: handlePickImage.
 */
const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Permission to access camera roll is required to select an image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  /**
 * Asynchronous controller/helper function: handlePickAudio.
 */
const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAudioUri(result.assets[0].uri);
        setAudioName(result.assets[0].name);
      }
    } catch (error) {
      console.error("Error picking audio:", error);
      Alert.alert("Error", "Failed to pick an audio file.");
    }
  };

  /**
 * Asynchronous controller/helper function: handleUpload.
 */
const handleUpload = async () => {
    if (!selectedWord) {
      Alert.alert("Required Field", "Please select a word first.");
      return;
    }

    if (!imageUri && !audioUri) {
      Alert.alert("Required Field", "Please select an image or an audio pronunciation file to upload.");
      return;
    }

    try {
      setUploading(true);

      const API_URL = `${
        process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"
      }/api/admin/dictionary/upload-media`;

      const formData = new FormData();
      formData.append("dictionary", selectedDictionary);
      formData.append("wordId", String(selectedWord._id));

      if (imageUri) {
        if (Platform.OS === "web") {
          const res = await fetch(imageUri);
          const blob = await res.blob();
          const uriParts = imageUri.split(".");
          const fileType = uriParts[uriParts.length - 1] || "png";
          const file = new File([blob], `image-${selectedWord._id}.${fileType}`, { type: blob.type });
          formData.append("image", file);
        } else {
          const uriParts = imageUri.split(".");
          const fileType = uriParts[uriParts.length - 1] || "png";
          formData.append("image", {
            uri: imageUri,
            name: `image-${selectedWord._id}.${fileType}`,
            type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
          } as any);
        }
      }

      if (audioUri) {
        if (Platform.OS === "web") {
          const res = await fetch(audioUri);
          const blob = await res.blob();
          const uriParts = audioUri.split(".");
          const fileType = uriParts[uriParts.length - 1] || "mp3";
          const file = new File([blob], audioName || `audio-${selectedWord._id}.${fileType}`, { type: blob.type });
          formData.append("audio", file);
        } else {
          const uriParts = audioUri.split(".");
          const fileType = uriParts[uriParts.length - 1] || "mp3";
          formData.append("audio", {
            uri: audioUri,
            name: audioName || `audio-${selectedWord._id}.${fileType}`,
            type: `audio/${fileType === "mp3" ? "mpeg" : fileType}`,
          } as any);
        }
      }

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Media uploaded successfully!");
        // Reset media fields
        setImageUri(null);
        setAudioUri(null);
        setAudioName(null);
      } else {
        throw new Error(data.error || "Failed to upload media files.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message || "Failed to connect to the server.");
    } finally {
      setUploading(false);
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
        <Text style={styles.headerTitle}>Upload Word Media</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>1. Select Dictionary Collection</Text>
        <View style={styles.dictGrid}>
          {DICTIONARIES.map((dict) => {
            const isSelected = selectedDictionary === dict.id;
            return (
              <TouchableOpacity
                key={dict.id}
                style={[styles.dictButton, isSelected && styles.dictButtonSelected]}
                onPress={() => {
                  setSelectedDictionary(dict.id);
                  setSelectedWord(null);
                  setWords([]);
                  setSearchQuery("");
                }}
              >
                <Text style={[styles.dictText, isSelected && styles.dictTextSelected]}>
                  {dict.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>2. Search & Select Word</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7C736B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Type word to search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searching && <ActivityIndicator size="small" color="#2B2C51" />}
        </View>

        {words.length > 0 && !selectedWord && (
          <View style={styles.resultsContainer}>
            {words.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.resultItem}
                onPress={() => {
                  setSelectedWord(item);
                  setSearchQuery(item.word);
                  setWords([]);
                }}
              >
                <Text style={styles.resultWord}>{item.word}</Text>
                {item.meanings && item.meanings[0] && (
                  <Text style={styles.resultMeaning} numberOfLines={1}>
                    {item.meanings[0].meaning}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedWord && (
          <View style={styles.selectedWordCard}>
            <View style={styles.selectedWordInfo}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.selectedWordTitle}>{selectedWord.word}</Text>
                <Text style={styles.selectedWordId}>Database ID: {selectedWord._id}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeWordBtn}
              onPress={() => {
                setSelectedWord(null);
                setSearchQuery("");
              }}
            >
              <Text style={styles.changeWordBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>3. Insertion Slots</Text>

        {/* Image Slot */}
        <View style={styles.mediaSlotCard}>
          <View style={styles.slotHeader}>
            <Ionicons name="image" size={24} color="#DB2777" />
            <Text style={styles.slotTitle}>Image Asset</Text>
          </View>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)}>
                <Ionicons name="trash" size={18} color="#EF4444" />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickerBtn} onPress={handlePickImage}>
              <Ionicons name="add" size={24} color="#DB2777" />
              <Text style={[styles.pickerBtnText, { color: "#DB2777" }]}>Choose Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Audio Slot */}
        <View style={styles.mediaSlotCard}>
          <View style={styles.slotHeader}>
            <Ionicons name="musical-notes" size={24} color="#2563EB" />
            <Text style={styles.slotTitle}>Pronunciation Audio (MP3)</Text>
          </View>
          {audioUri ? (
            <View style={styles.audioPreviewContainer}>
              <Ionicons name="volume-high" size={32} color="#2563EB" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.audioFilename} numberOfLines={1}>
                  {audioName || "pronunciation.mp3"}
                </Text>
              </View>
              <TouchableOpacity style={styles.removeBtn} onPress={() => { setAudioUri(null); setAudioName(null); }}>
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickerBtn} onPress={handlePickAudio}>
              <Ionicons name="add" size={24} color="#2563EB" />
              <Text style={[styles.pickerBtnText, { color: "#2563EB" }]}>Choose Audio File</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, (!imageUri && !audioUri) && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading || (!imageUri && !audioUri)}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.uploadButtonText}>Upload Media Files</Text>
            </>
          )}
        </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#2B2C51",
    marginTop: 15,
    marginBottom: 10,
  },
  dictGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  dictButton: {
    backgroundColor: "#FFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dictButtonSelected: {
    backgroundColor: "#2B2C51",
    borderColor: "#2B2C51",
  },
  dictText: {
    fontSize: 13,
    color: "#4B5563",
  },
  dictTextSelected: {
    color: "#FFF",
    fontWeight: "bold",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  resultsContainer: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resultWord: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  resultMeaning: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  selectedWordCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  selectedWordInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedWordTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065F46",
  },
  selectedWordId: {
    fontSize: 12,
    color: "#047857",
    marginTop: 2,
  },
  changeWordBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeWordBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  mediaSlotCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  slotTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  pickerBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
  },
  pickerBtnText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  removeBtnText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  audioPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 10,
  },
  audioFilename: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E40AF",
  },
  uploadButton: {
    backgroundColor: "#2B2C51",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  uploadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
