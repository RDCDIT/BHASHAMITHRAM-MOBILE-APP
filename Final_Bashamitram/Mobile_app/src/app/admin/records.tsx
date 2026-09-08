/**
 * @file records.tsx
 * @description Admin dashboard view screen for records management.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface MeaningInput {
  meaning: string;
  context_usage: string;
}

interface ProverbInput {
  proverb: string;
  context_usage: string;
}

interface CategoryItem {
  category: string;
  meanings: string;
  context: string;
}

interface RecordType {
  _id: string | number;
  word: string;
  // Category is now an array of objects in the DB
  Category?: CategoryItem[];
  category?: CategoryItem[] | string; // legacy fallback
  gender?: string;
  Gender?: string;
  root?: string;
  phonetic_transcription?: string;
  etymology?: string;
  cultural_note?: string;
  inflections?: string;
  pronunciation?: string;
  synonyms?: string | string[];
  antonyms?: string | string[];
  dialects?: string | string[];
  similar_word?: string | string[];
  novel_words?: string | string[];
  cross_reference?: string | string[];
  proverb?: string;
  equivalents?: {
    english?: string;
    malayalam?: string;
    tamil?: string;
    kannada?: string;
    telugu?: string;
    tulu?: string;
  };
  meanings?: MeaningInput[];
  proverbs?: ProverbInput[];
}

const DICTIONARIES = [
  { id: "malayalam-malayalam", label: "Malayalam-Malayalam" },
  { id: "malayalam-english", label: "Malayalam-English" },
  { id: "english-malayalam", label: "English-Malayalam" },
  { id: "english-english", label: "English-English" },
  { id: "malayalam-synonym", label: "Synonym" },
];

const GENDER_OPTIONS = [
  { id: "പുല്ലിംഗം", label: "പുല്ലിംഗം (Masculine)" },
  { id: "സ്ത്രീലിംഗം", label: "സ്ത്രീലിംഗം (Feminine)" },
  { id: "നപുംസകലിംഗം", label: "നപുംസകലിംഗം (Neuter)" },
  { id: "ഉഭയലിംഗം", label: "ഉഭയലിംഗം (Common)" },
];

/**
 * Renders and manages the RecordsScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function RecordsScreen() {
  const [selectedDictionary, setSelectedDictionary] = useState("malayalam-malayalam");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<RecordType[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | number | null>(null);
  const [word, setWord] = useState("");
  // Category is now an array of { category, meanings, context }
  const [categories, setCategories] = useState<CategoryItem[]>([{ category: "", meanings: "", context: "" }]);
  const [gender, setGender] = useState("");
  const [root, setRoot] = useState("");
  const [phoneticTranscription, setPhoneticTranscription] = useState("");
  const [etymology, setEtymology] = useState("");
  const [culturalNote, setCulturalNote] = useState("");
  const [inflections, setInflections] = useState("");
  const [pronunciation, setPronunciation] = useState("");

  // Equivalents
  const [eqEnglish, setEqEnglish] = useState("");
  const [eqMalayalam, setEqMalayalam] = useState("");
  const [eqTamil, setEqTamil] = useState("");
  const [eqKannada, setEqKannada] = useState("");
  const [eqTelugu, setEqTelugu] = useState("");
  const [eqTulu, setEqTulu] = useState("");

  // Lists
  const [meanings, setMeanings] = useState<MeaningInput[]>([{ meaning: "", context_usage: "" }]);
  const [proverbs, setProverbs] = useState<ProverbInput[]>([{ proverb: "", context_usage: "" }]);

  // Arrays/Comma separated
  const [synonyms, setSynonyms] = useState("");
  const [antonyms, setAntonyms] = useState("");
  const [dialects, setDialects] = useState("");
  const [similarWord, setSimilarWord] = useState("");
  const [novelWords, setNovelWords] = useState("");
  const [crossReference, setCrossReference] = useState("");
  const [proverbSingle, setProverbSingle] = useState(""); // for English-English single proverb

  const [saving, setSaving] = useState(false);

  /**
 * Asynchronous controller/helper function: fetchRecords.
 */
const fetchRecords = async (pageNum = 1) => {
    try {
      setLoading(true);
      const API_URL = `${
        process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"
      }/api/admin/dictionary/words?dictionary=${selectedDictionary}&page=${pageNum}&limit=10&search=${encodeURIComponent(
        searchQuery
      )}`;

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load records.");
      }

      setRecords(data.records);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalRecords(data.total);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchRecords(1);
  }, [selectedDictionary]);

  const handleSearch = () => {
    setPage(1);
    fetchRecords(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
    // Call fetch records with empty string since searchQuery isn't updated instantly in state
    setTimeout(() => {
      fetchRecords(1);
    }, 50);
  };

  const handleOpenEdit = (record: RecordType) => {
    setEditingRecordId(record._id);
    setWord(record.word || "");

    // Parse Category array from DB — support both array and legacy string
    const rawCat = record.Category || record.category;
    if (Array.isArray(rawCat) && rawCat.length > 0) {
      setCategories(
        rawCat.map((c: any) => ({
          category: c.category || "",
          meanings: c.meanings || c.meaning || "",
          context: c.context || c.context_usage || "",
        }))
      );
    } else if (typeof rawCat === "string" && rawCat.trim()) {
      // Legacy single-string fallback
      setCategories([{ category: rawCat, meanings: "", context: "" }]);
    } else {
      setCategories([{ category: "", meanings: "", context: "" }]);
    }

    setGender(record.gender || record.Gender || "");
    setRoot(record.root || "");
    setPhoneticTranscription(record.phonetic_transcription || "");
    setEtymology(record.etymology || "");
    setCulturalNote(record.cultural_note || "");
    setInflections(record.inflections || "");
    setPronunciation(record.pronunciation || "");

    setEqEnglish(record.equivalents?.english || "");
    setEqMalayalam(record.equivalents?.malayalam || "");
    setEqTamil(record.equivalents?.tamil || "");
    setEqKannada(record.equivalents?.kannada || "");
    setEqTelugu(record.equivalents?.telugu || "");
    setEqTulu(record.equivalents?.tulu || "");

    const toCommaString = (val: any) => {
      if (!val) return "";
      if (Array.isArray(val)) return val.join(", ");
      return val.toString();
    };

    setSynonyms(toCommaString(record.synonyms));
    setAntonyms(toCommaString(record.antonyms));
    setDialects(toCommaString(record.dialects));
    setSimilarWord(toCommaString(record.similar_word));
    setNovelWords(toCommaString(record.novel_words));
    setCrossReference(toCommaString(record.cross_reference));
    setProverbSingle(record.proverb || "");

    setMeanings(
      record.meanings && record.meanings.length > 0
        ? record.meanings.map((m) => ({ meaning: m.meaning || "", context_usage: m.context_usage || "" }))
        : [{ meaning: "", context_usage: "" }]
    );

    setProverbs(
      record.proverbs && record.proverbs.length > 0
        ? record.proverbs.map((p) => ({ proverb: p.proverb || "", context_usage: p.context_usage || "" }))
        : [{ proverb: "", context_usage: "" }]
    );

    setEditModalVisible(true);
  };

  const handleAddCategory = () => {
    setCategories([...categories, { category: "", meanings: "", context: "" }]);
  };

  const handleRemoveCategory = (index: number) => {
    const list = [...categories];
    list.splice(index, 1);
    setCategories(list);
  };

  const handleCategoryChange = (index: number, field: keyof CategoryItem, val: string) => {
    const list = [...categories];
    list[index][field] = val;
    setCategories(list);
  };

  const handleAddMeaning = () => {
    setMeanings([...meanings, { meaning: "", context_usage: "" }]);
  };

  const handleRemoveMeaning = (index: number) => {
    const list = [...meanings];
    list.splice(index, 1);
    setMeanings(list);
  };

  const handleMeaningChange = (index: number, field: keyof MeaningInput, val: string) => {
    const list = [...meanings];
    list[index][field] = val;
    setMeanings(list);
  };

  const handleAddProverb = () => {
    setProverbs([...proverbs, { proverb: "", context_usage: "" }]);
  };

  const handleRemoveProverb = (index: number) => {
    const list = [...proverbs];
    list.splice(index, 1);
    setProverbs(list);
  };

  const handleProverbChange = (index: number, field: keyof ProverbInput, val: string) => {
    const list = [...proverbs];
    list[index][field] = val;
    setProverbs(list);
  };

  /**
 * Asynchronous controller/helper function: handleSaveEdit.
 */
const handleSaveEdit = async () => {
    if (!word.trim()) {
      Alert.alert("Validation", "Word is required.");
      return;
    }

    try {
      setSaving(true);
      const API_URL = `${
        process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"
      }/api/admin/dictionary/words/${editingRecordId}`;

      const payload = {
        targetDictionary: selectedDictionary,
        word: word.trim(),
        // Send Category as the new array structure
        Category: categories
          .filter((c) => c.category.trim() || c.meanings.trim())
          .map((c) => ({
            category: c.category.trim(),
            meanings: c.meanings.trim(),
            context: c.context.trim(),
          })),
        gender: gender.trim(),
        root: root.trim(),
        phonetic_transcription: phoneticTranscription.trim(),
        etymology: etymology.trim(),
        cultural_note: culturalNote.trim(),
        synonyms: synonyms.trim(),
        antonyms: antonyms.trim(),
        dialects: dialects.trim(),
        similar_word: similarWord.trim(),
        novel_words: novelWords.trim(),
        cross_reference: crossReference.trim(),
        inflections: inflections.trim(),
        pronunciation: pronunciation.trim(),
        proverb: proverbSingle.trim(),
        equivalents: {
          english: eqEnglish.trim(),
          malayalam: eqMalayalam.trim(),
          tamil: eqTamil.trim(),
          kannada: eqKannada.trim(),
          telugu: eqTelugu.trim(),
          tulu: eqTulu.trim(),
        },
        meanings: meanings.filter((m) => m.meaning.trim() !== ""),
        proverbs: proverbs.filter((p) => p.proverb.trim() !== ""),
      };

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update record.");
      }

      Alert.alert("Success", "Record updated successfully!");
      setEditModalVisible(false);
      fetchRecords(page);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string | number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to permanently delete this dictionary record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const API_URL = `${
                process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"
              }/api/admin/dictionary/words/${id}?dictionary=${selectedDictionary}`;

              const response = await fetch(API_URL, {
                method: "DELETE",
              });
              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || "Failed to delete record.");
              }

              Alert.alert("Success", "Record deleted successfully!");
              fetchRecords(page);
            } catch (error: any) {
              console.error(error);
              Alert.alert("Error", error.message || "Failed to delete record.");
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderRecordItem = ({ item }: { item: RecordType }) => {
    const meaningSnippet =
      item.meanings && item.meanings.length > 0
        ? item.meanings[0].meaning
        : Array.isArray(item.synonyms)
        ? item.synonyms.join(", ")
        : item.synonyms || "No meaning details";

    const catDisplay = Array.isArray(item.Category) && item.Category.length > 0
      ? item.Category.map((c: CategoryItem) => c.category).filter(Boolean).join(" · ")
      : typeof item.category === "string" ? item.category : "";

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordMain}>
          <Text style={styles.recordWord}>{item.word}</Text>
          <Text style={styles.recordSnippet} numberOfLines={2}>
            {meaningSnippet}
          </Text>
          {!!catDisplay && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{catDisplay}</Text>
            </View>
          )}
        </View>
        <View style={styles.recordActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleOpenEdit(item)}>
            <Ionicons name="create-outline" size={18} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item._id)}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B2C51" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dictionary Records</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Dict selector */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {DICTIONARIES.map((dict) => {
            const isSelected = selectedDictionary === dict.id;
            return (
              <TouchableOpacity
                key={dict.id}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setSelectedDictionary(dict.id)}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>{dict.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search words or meanings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2B2C51" />
        </View>
      ) : records.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No records found matching criteria</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={records}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Pagination Footer */}
          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
              disabled={page <= 1}
              onPress={() => fetchRecords(page - 1)}
            >
              <Ionicons name="chevron-back" size={20} color={page <= 1 ? "#9CA3AF" : "#2B2C51"} />
            </TouchableOpacity>

            <Text style={styles.paginationInfo}>
              Page {page} of {totalPages || 1} ({totalRecords} records)
            </Text>

            <TouchableOpacity
              style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
              disabled={page >= totalPages}
              onPress={() => fetchRecords(page + 1)}
            >
              <Ionicons name="chevron-forward" size={20} color={page >= totalPages ? "#9CA3AF" : "#2B2C51"} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Edit Record Modal */}
      <Modal visible={editModalVisible} animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Record</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {/* Word Info Form */}
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Word / പദം *</Text>
                <TextInput style={styles.input} value={word} onChangeText={setWord} />
              </View>

              {selectedDictionary !== "malayalam-synonym" && (
                <>
                  {/* Category Array — one sub-card per category entry */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitleInline}>Category / വിഭാഗം</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
                      <Ionicons name="add" size={16} color="#FFF" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {categories.map((cat, index) => (
                    <View key={`cat-${index}`} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderTitle}>Category #{index + 1}</Text>
                        {categories.length > 1 && (
                          <TouchableOpacity onPress={() => handleRemoveCategory(index)}>
                            <Ionicons name="trash" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Category Name / വിഭാഗം</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Noun, Verb, നാമം, ക്രിയ"
                          value={cat.category}
                          onChangeText={(val) => handleCategoryChange(index, "category", val)}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Meanings / അർത്ഥം *</Text>
                        <TextInput
                          style={[styles.input, styles.multilineInput]}
                          placeholder="Enter the meaning for this category"
                          value={cat.meanings}
                          onChangeText={(val) => handleCategoryChange(index, "meanings", val)}
                          multiline
                          numberOfLines={3}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Context Usage / പ്രയോഗം</Text>
                        <TextInput
                          style={[styles.input, styles.multilineInput]}
                          placeholder="Usage in a sentence or context note"
                          value={cat.context}
                          onChangeText={(val) => handleCategoryChange(index, "context", val)}
                          multiline
                          numberOfLines={2}
                        />
                      </View>
                    </View>
                  ))}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Root Word / ധാതു</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Root/Origin word"
                      value={root}
                      onChangeText={setRoot}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phonetic Transcription / ഉച്ചാരണരീതി</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="International Phonetic Alphabet"
                      value={phoneticTranscription}
                      onChangeText={setPhoneticTranscription}
                    />
                  </View>
                </>
              )}

              {selectedDictionary === "english-malayalam" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Gender / ലിംഗഭേദം</Text>
                  <View style={styles.genderGrid}>
                    {GENDER_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.genderBtn, gender === opt.id && styles.genderBtnSelected]}
                        onPress={() => setGender(opt.id)}
                      >
                        <Text style={[styles.genderBtnText, gender === opt.id && styles.genderBtnTextSelected]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {(selectedDictionary === "malayalam-malayalam" || selectedDictionary === "malayalam-english") && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Gender / ലിംഗഭേദം</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. സ്ത്രീലിംഗം, പുല്ലിംഗം"
                    value={gender}
                    onChangeText={setGender}
                  />
                </View>
              )}
            </View>

            {selectedDictionary !== "malayalam-synonym" && (
              <>
                <Text style={styles.sectionTitle}>Extra Information</Text>
                <View style={styles.card}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Etymology / പദോൽപ്പത്തി</Text>
                    <TextInput style={styles.input} value={etymology} onChangeText={setEtymology} />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cultural Note / സാംസ്കാരിക വിവരങ്ങൾ</Text>
                    <TextInput style={styles.input} value={culturalNote} onChangeText={setCulturalNote} />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Inflections / രൂപഭേദങ്ങൾ</Text>
                    <TextInput style={styles.input} value={inflections} onChangeText={setInflections} />
                  </View>

                  {selectedDictionary === "english-english" && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Pronunciation Audio Path</Text>
                      <TextInput style={styles.input} value={pronunciation} onChangeText={setPronunciation} />
                    </View>
                  )}
                </View>

                {/* Equivalents Section */}
                <Text style={styles.sectionTitle}>Equivalents / സമനാമങ്ങൾ</Text>
                <View style={styles.card}>
                  {selectedDictionary === "english-english" ? (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Malayalam / മലയാളം</Text>
                      <TextInput style={styles.input} value={eqMalayalam} onChangeText={setEqMalayalam} />
                    </View>
                  ) : (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>English / ഇംഗ്ലീഷ്</Text>
                      <TextInput style={styles.input} value={eqEnglish} onChangeText={setEqEnglish} />
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tamil / തമിഴ്</Text>
                    <TextInput style={styles.input} value={eqTamil} onChangeText={setEqTamil} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Kannada / കന്നഡ</Text>
                    <TextInput style={styles.input} value={eqKannada} onChangeText={setEqKannada} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Telugu / തെലുങ്ക്</Text>
                    <TextInput style={styles.input} value={eqTelugu} onChangeText={setEqTelugu} />
                  </View>

                  {selectedDictionary !== "english-english" && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Tulu / തുളു</Text>
                      <TextInput style={styles.input} value={eqTulu} onChangeText={setEqTulu} />
                    </View>
                  )}
                </View>

                {/* Meanings */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitleInline}>Meanings / അർത്ഥങ്ങൾ</Text>
                  <TouchableOpacity style={styles.addButton} onPress={handleAddMeaning}>
                    <Ionicons name="add" size={16} color="#FFF" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {meanings.map((m, index) => (
                  <View key={`mean-${index}`} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardHeaderTitle}>Meaning #{index + 1}</Text>
                      {meanings.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveMeaning(index)}>
                          <Ionicons name="trash" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Meaning *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter meaning"
                        value={m.meaning}
                        onChangeText={(val) => handleMeaningChange(index, "meaning", val)}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Context Usage / പ്രയോഗം</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Usage in sentence"
                        value={m.context_usage}
                        onChangeText={(val) => handleMeaningChange(index, "context_usage", val)}
                      />
                    </View>
                  </View>
                ))}

                {/* Proverbs */}
                {selectedDictionary === "english-english" ? (
                  <>
                    <Text style={styles.sectionTitle}>Proverb / പഴஞ்சൊല്ല്</Text>
                    <View style={styles.card}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Proverb / പഴഞ്ചൊല്ല്</Text>
                        <TextInput style={styles.input} value={proverbSingle} onChangeText={setProverbSingle} />
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitleInline}>Proverbs / പഴഞ്ചൊല്ലുകൾ</Text>
                      <TouchableOpacity style={styles.addButton} onPress={handleAddProverb}>
                        <Ionicons name="add" size={16} color="#FFF" />
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>

                    {proverbs.map((p, index) => (
                      <View key={`prov-${index}`} style={styles.card}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardHeaderTitle}>Proverb #{index + 1}</Text>
                          {proverbs.length > 1 && (
                            <TouchableOpacity onPress={() => handleRemoveProverb(index)}>
                              <Ionicons name="trash" size={18} color="#EF4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Proverb</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Enter proverb"
                            value={p.proverb}
                            onChangeText={(val) => handleProverbChange(index, "proverb", val)}
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Context Usage / പ്രയോഗം</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Usage in sentence"
                            value={p.context_usage}
                            onChangeText={(val) => handleProverbChange(index, "context_usage", val)}
                          />
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Arrays/Comma lists */}
            <Text style={styles.sectionTitle}>Related Terms (Comma Separated)</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Synonyms / പര്യായങ്ങൾ</Text>
                <TextInput style={styles.input} placeholder="synonym1, synonym2..." value={synonyms} onChangeText={setSynonyms} />
              </View>

              {selectedDictionary !== "malayalam-synonym" && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Antonyms / വിപരീതങ്ങൾ</Text>
                    <TextInput style={styles.input} placeholder="antonym1, antonym2..." value={antonyms} onChangeText={setAntonyms} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Dialects / പ്രാദേശികരൂപങ്ങൾ</Text>
                    <TextInput style={styles.input} placeholder="dialect1, dialect2..." value={dialects} onChangeText={setDialects} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Similar Words / സമാനപദങ്ങൾ</Text>
                    <TextInput style={styles.input} placeholder="word1, word2..." value={similarWord} onChangeText={setSimilarWord} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Novel Words / നവപദങ്ങൾ</Text>
                    <TextInput style={styles.input} placeholder="word1, word2..." value={novelWords} onChangeText={setNovelWords} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cross Reference / ഒത്തുനോക്കേണ്ടവ</Text>
                    <TextInput style={styles.input} placeholder="ref1, ref2..." value={crossReference} onChangeText={setCrossReference} />
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  tabContainer: {
    backgroundColor: "#2B2C51",
    paddingBottom: 8,
  },
  tabScroll: {
    paddingHorizontal: 10,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#3A3B68",
  },
  tabButtonActive: {
    backgroundColor: "#F9F6F1",
  },
  tabText: {
    color: "#D1D5DB",
    fontWeight: "600",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#2B2C51",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#1F2937",
  },
  searchBtn: {
    backgroundColor: "#2B2C51",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  searchBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 10,
  },
  recordCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  recordMain: {
    flex: 1,
    marginRight: 12,
  },
  recordWord: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2B2C51",
    marginBottom: 4,
  },
  recordSnippet: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: "#7C3AED",
    fontWeight: "600",
  },
  recordActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  editBtn: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  deleteBtn: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  paginationInfo: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9F6F1",
  },
  modalHeader: {
    height: Platform.OS === "android" ? 75 : 95,
    backgroundColor: "#2B2C51",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "android" ? 25 : 35,
  },
  modalCloseBtn: {
    padding: 5,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalScrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2B2C51",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitleInline: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2B2C51",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2C51",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 6,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 6,
  },
  input: {
    height: 42,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  multilineInput: {
    height: undefined,
    minHeight: 60,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: "top",
  },
  genderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genderBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
  },
  genderBtnSelected: {
    borderColor: "#2B2C51",
    backgroundColor: "#EEF2F6",
  },
  genderBtnText: {
    fontSize: 12,
    color: "#4B5563",
  },
  genderBtnTextSelected: {
    color: "#2B2C51",
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#2B2C51",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
