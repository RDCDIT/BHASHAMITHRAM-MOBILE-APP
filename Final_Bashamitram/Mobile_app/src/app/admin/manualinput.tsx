/**
 * @file manualinput.tsx
 * @description Admin dashboard view screen for manualinput management.
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

const DICTIONARIES = [
  { id: "malayalam-malayalam", label: "Malayalam - Malayalam" },
  { id: "malayalam-english", label: "Malayalam - English" },
  { id: "english-malayalam", label: "English - Malayalam" },
  { id: "english-english", label: "English - English" },
  { id: "malayalam-synonym", label: "Malayalam Synonym" },
];

const GENDER_OPTIONS = [
  { id: "പുല്ലിംഗം", label: "പുല്ലിംഗം (Masculine)" },
  { id: "സ്ത്രീലിംഗം", label: "സ്ത്രീലിംഗം (Feminine)" },
  { id: "നപുംസകലിംഗം", label: "നപുംസകലിംഗം (Neuter)" },
  { id: "ഉഭയലിംഗം", label: "ഉഭയലിംഗം (Common)" },
];

/**
 * Renders and manages the ManualInputScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function ManualInputScreen() {
  const [targetDictionary, setTargetDictionary] = useState("malayalam-malayalam");
  const [word, setWord] = useState("");
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

  const [loading, setLoading] = useState(false);

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
 * Asynchronous controller/helper function: handleSave.
 */
const handleSave = async () => {
    if (!word.trim()) {
      Alert.alert("Input Validation", "Word is required.");
      return;
    }

    try {
      setLoading(true);

      const API_URL = `${process.env.EXPO_PUBLIC_API_URL || "https://bhashamithram-mobile-app-2.onrender.com"}/api/admin/dictionary/import-manual`;

      const payload = {
        targetDictionary,
        word: word.trim(),
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
        equivalents: {
          english: eqEnglish.trim(),
          malayalam: eqMalayalam.trim(),
          tamil: eqTamil.trim(),
          kannada: eqKannada.trim(),
          telugu: eqTelugu.trim(),
          tulu: eqTulu.trim(),
        },
        meanings: meanings.filter(m => m.meaning.trim() !== ""),
        proverbs: proverbs.filter(p => p.proverb.trim() !== ""),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import manual entry.");
      }

      Alert.alert("Success", "Word successfully added to the dictionary collection!");
      // Reset form
      setWord("");
      setCategories([{ category: "", meanings: "", context: "" }]);
      setGender("");
      setRoot("");
      setPhoneticTranscription("");
      setEtymology("");
      setCulturalNote("");
      setInflections("");
      setPronunciation("");
      setEqEnglish("");
      setEqMalayalam("");
      setEqTamil("");
      setEqKannada("");
      setEqTelugu("");
      setEqTulu("");
      setMeanings([{ meaning: "", context_usage: "" }]);
      setProverbs([{ proverb: "", context_usage: "" }]);
      setSynonyms("");
      setAntonyms("");
      setDialects("");
      setSimilarWord("");
      setNovelWords("");
      setCrossReference("");

    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to import word.");
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
        <Text style={styles.headerTitle}>Add Word Record</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dictionary Selection */}
        <Text style={styles.sectionTitle}>Select Dictionary Collection</Text>
        <View style={styles.dictGrid}>
          {DICTIONARIES.map((dict) => {
            const isSelected = targetDictionary === dict.id;
            return (
              <TouchableOpacity
                key={dict.id}
                style={[styles.dictCard, isSelected && styles.dictCardSelected]}
                onPress={() => setTargetDictionary(dict.id)}
              >
                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={isSelected ? "#2B2C51" : "#6B7280"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.dictLabel, isSelected && styles.dictLabelSelected]}>
                  {dict.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Word Info Form */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Word / പദം</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. അമ്മ, Love, etc."
              value={word}
              onChangeText={setWord}
            />
          </View>

          {targetDictionary !== "malayalam-synonym" && (
            <>
              {/* Category Array Inputs */}
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
                    <Text style={styles.inputLabel}>Meanings / അർത്ഥം</Text>
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
                    <Text style={styles.inputLabel}>Context / പ്രയോഗം</Text>
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

          {targetDictionary === "english-malayalam" && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender / ലിംഗഭേദം</Text>
              <View style={styles.genderGrid}>
                {GENDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.genderBtn, gender === opt.id && styles.genderBtnSelected]}
                    onPress={() => setGender(opt.id)}
                  >
                    <Text
                      style={[
                        styles.genderBtnText,
                        gender === opt.id && styles.genderBtnTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(targetDictionary === "malayalam-malayalam" ||
            targetDictionary === "malayalam-english") && (
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

        {targetDictionary !== "malayalam-synonym" && (
          <>
            <Text style={styles.sectionTitle}>Extra Information</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Etymology / പദോൽപ്പത്തി</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Etymology context"
                  value={etymology}
                  onChangeText={setEtymology}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cultural Note / സാംസ്കാരിക വിവരങ്ങൾ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Cultural background details"
                  value={culturalNote}
                  onChangeText={setCulturalNote}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Inflections / രൂപഭേദങ്ങൾ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Grammatical inflections"
                  value={inflections}
                  onChangeText={setInflections}
                />
              </View>

              {targetDictionary === "english-english" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Pronunciation Audio Path / ഫയൽ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. words/audio/example.mp3"
                    value={pronunciation}
                    onChangeText={setPronunciation}
                  />
                </View>
              )}
            </View>

            {/* Equivalents Section */}
            <Text style={styles.sectionTitle}>Equivalents / സമനാമങ്ങൾ</Text>
            <View style={styles.card}>
              {targetDictionary === "english-english" ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Malayalam / മലയാളം</Text>
                    <TextInput
                      style={styles.input}
                      value={eqMalayalam}
                      onChangeText={setEqMalayalam}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>English / ഇംഗ്ലീഷ്</Text>
                    <TextInput
                      style={styles.input}
                      value={eqEnglish}
                      onChangeText={setEqEnglish}
                    />
                  </View>
                </>
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

              {targetDictionary !== "english-english" && (
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
                  <Text style={styles.inputLabel}>Meaning</Text>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleInline}>Proverbs / ചൊല്ലുകൾ</Text>
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
                  <Text style={styles.inputLabel}>Context / സന്ദർഭം</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Context or explanation"
                    value={p.context_usage}
                    onChangeText={(val) => handleProverbChange(index, "context_usage", val)}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        {/* Synonyms and Related Words */}
        <Text style={styles.sectionTitle}>
          {targetDictionary === "malayalam-synonym"
            ? "Synonyms / പര്യായങ്ങൾ"
            : "Synonyms & Relations (Comma-separated)"}
        </Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Synonyms / പര്യായങ്ങൾ</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ജനനി, അംബ, മാതാവ്"
              value={synonyms}
              onChangeText={setSynonyms}
            />
          </View>

          {targetDictionary !== "malayalam-synonym" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Antonyms / വിപരീതങ്ങൾ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ശത്രു, വിദ്വേഷി"
                  value={antonyms}
                  onChangeText={setAntonyms}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dialects / പ്രാദേശികരൂപങ്ങൾ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. തെക്കൻ രൂപം, വടക്കൻ രൂപം"
                  value={dialects}
                  onChangeText={setDialects}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Similar Words / സമാനപദങ്ങൾ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. അമ്മച്ചി, മമ്മി"
                  value={similarWord}
                  onChangeText={setSimilarWord}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Novel Words / നവപദങ്ങൾ</Text>
                <TextInput
                  style={styles.input}
                  value={novelWords}
                  onChangeText={setNovelWords}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cross Reference / പരസ്പര സൂചനകൾ</Text>
                <TextInput
                  style={styles.input}
                  value={crossReference}
                  onChangeText={setCrossReference}
                />
              </View>
            </>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Import to Dictionary</Text>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 15 : 35,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2C51",
    marginTop: 18,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitleInline: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2C51",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addButton: {
    backgroundColor: "#2B2C51",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 3,
  },
  dictGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  dictCard: {
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    minWidth: "48%",
    flexGrow: 1,
  },
  dictCardSelected: {
    borderColor: "#2B2C51",
    backgroundColor: "#F5F3FF",
  },
  dictLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  dictLabelSelected: {
    color: "#2B2C51",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 6,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    marginTop: 4,
  },
  genderBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
  },
  genderBtnSelected: {
    borderColor: "#2B2C51",
    backgroundColor: "#F5F3FF",
  },
  genderBtnText: {
    fontSize: 13,
    color: "#4B5563",
  },
  genderBtnTextSelected: {
    color: "#2B2C51",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#2B2C51",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 18,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
