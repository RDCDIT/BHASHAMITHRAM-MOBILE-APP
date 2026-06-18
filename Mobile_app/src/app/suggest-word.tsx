import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  Platform.OS === "android" ? "http://192.168.1.3:5000" : "http://localhost:5000",
  "http://192.168.1.3:5000",
].filter((value): value is string => Boolean(value));

interface MeaningInput {
  meaning: string;
  context_usage: string;
}

interface ProverbInput {
  proverb: string;
  context_usage: string;
}

export default function SuggestWordScreen() {
  // Collapsible section visibility states
  const [activeSection, setActiveSection] = useState<string>("basic");

  // Form Field States
  const [word, setWord] = useState("");
  const [phoneticTranscription, setPhoneticTranscription] = useState("");
  const [root, setRoot] = useState("");
  const [etymology, setEtymology] = useState("");
  const [culturalNote, setCulturalNote] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [antonyms, setAntonyms] = useState("");
  const [dialects, setDialects] = useState("");
  const [proverb, setProverb] = useState("");
  const [similarWord, setSimilarWord] = useState("");
  const [novelWords, setNovelWords] = useState("");
  const [crossReference, setCrossReference] = useState("");
  const [inflections, setInflections] = useState("");
  const [gender, setGender] = useState("ഉഭയലിംഗം"); // default

  // Equivalents
  const [englishEq, setEnglishEq] = useState("");
  const [tamilEq, setTamilEq] = useState("");
  const [kannadaEq, setKannadaEq] = useState("");
  const [teluguEq, setTeluguEq] = useState("");
  const [tuluEq, setTuluEq] = useState("");

  // Contributor details
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");

  // Meanings Array
  const [meanings, setMeanings] = useState<MeaningInput[]>([
    { meaning: "", context_usage: "" },
  ]);

  // Proverbs Array
  const [proverbsList, setProverbsList] = useState<ProverbInput[]>([]);

  // Page States
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSection = (sectionName: string) => {
    setActiveSection(activeSection === sectionName ? "" : sectionName);
  };

  const handleAddMeaning = () => {
    setMeanings([...meanings, { meaning: "", context_usage: "" }]);
  };

  const handleRemoveMeaning = (index: number) => {
    if (meanings.length > 1) {
      setMeanings(meanings.filter((_, i) => i !== index));
    }
  };

  const handleMeaningChange = (index: number, field: keyof MeaningInput, value: string) => {
    const newMeanings = [...meanings];
    newMeanings[index][field] = value;
    setMeanings(newMeanings);
  };

  const handleAddProverb = () => {
    setProverbsList([...proverbsList, { proverb: "", context_usage: "" }]);
  };

  const handleRemoveProverb = (index: number) => {
    setProverbsList(proverbsList.filter((_, i) => i !== index));
  };

  const handleProverbChange = (index: number, field: keyof ProverbInput, value: string) => {
    const newList = [...proverbsList];
    newList[index][field] = value;
    setProverbsList(newList);
  };

  const handleSubmit = async () => {
    if (!word.trim()) {
      Alert.alert("അപൂർണ്ണം", "ദയവായി മലയാളം വാക്ക് രേഖപ്പെടുത്തുക.");
      setActiveSection("basic");
      return;
    }

    const filteredMeanings = meanings.filter((m) => m.meaning.trim() !== "");
    if (filteredMeanings.length === 0) {
      Alert.alert("അപൂർണ്ണം", "ദയവായി കുറഞ്ഞത് ഒരു അർത്ഥമെങ്കിലും രേഖപ്പെടുത്തുക.");
      setActiveSection("meanings");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      word: word.trim(),
      root: root.trim(),
      etymology: etymology.trim(),
      cultural_note: culturalNote.trim(),
      synonyms: synonyms.trim(),
      antonyms: antonyms.trim(),
      dialects: dialects.trim(),
      proverb: proverb.trim(),
      similar_word: similarWord.trim(),
      novel_words: novelWords.trim(),
      cross_reference: crossReference.trim(),
      inflections: inflections.trim(),
      gender: gender,
      phonetic_transcription: phoneticTranscription.trim(),
      equivalents: {
        english: englishEq.trim(),
        tamil: tamilEq.trim(),
        kannada: kannadaEq.trim(),
        telugu: teluguEq.trim(),
        tulu: tuluEq.trim(),
      },
      contributor: {
        name: contributorName.trim(),
        email: contributorEmail.trim(),
      },
      meanings: filteredMeanings,
      proverbs: proverbsList.filter((p) => p.proverb.trim() !== ""),
    };

    let lastError: unknown = null;
    for (const apiBaseUrl of API_BASE_URLS) {
      try {
        console.log(`[Suggest Word] Sending submission to ${apiBaseUrl}`);
        const response = await fetch(`${apiBaseUrl}/api/words/suggest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(responseText || `Request failed with status ${response.status}`);
        }

        setIsSubmitting(false);
        Alert.alert(
          "വിജയകരം",
          "നിങ്ങളുടെ വാക്ക് വിജയകരമായി സമർപ്പിച്ചു. നന്ദി!",
          [{ text: "ശരി", onPress: () => router.back() }]
        );
        return;
      } catch (error) {
        lastError = error;
      }
    }

    setIsSubmitting(false);
    console.error(lastError);
    Alert.alert(
      "പരാജയപ്പെട്ടു",
      lastError instanceof Error ? lastError.message : "വിവരങ്ങൾ സേവ് ചെയ്യാൻ സാധിച്ചില്ല."
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={27} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>വാക്ക് നിർദ്ദേശിക്കുക</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.helperText}>
          പുതിയ വാക്കുകളോ പ്രയോഗങ്ങളോ നിഘണ്ടുവിലേക്ക് കൂട്ടിച്ചേർക്കാൻ താഴെയുള്ള ഫോം പൂരിപ്പിക്കുക.
        </Text>

        {/* 1. Basic details section */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("basic")}
            activeOpacity={0.8}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="text-outline" size={22} color="#2B2C51" />
              <Text style={styles.sectionTitle}>അടിസ്ഥാന വിവരങ്ങൾ</Text>
            </View>
            <Ionicons
              name={activeSection === "basic" ? "chevron-up" : "chevron-down"}
              size={20}
              color="#2B2C51"
            />
          </TouchableOpacity>

          {activeSection === "basic" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>വാക്ക് (മലയാളം) *</Text>
              <TextInput
                style={styles.input}
                placeholder="ഉദാ: പര"
                placeholderTextColor="#A59B90"
                value={word}
                onChangeText={setWord}
              />

              <Text style={styles.label}>ഉച്ചാരണം (ഇംഗ്ലീഷിൽ)</Text>
              <TextInput
                style={styles.input}
                placeholder="ഉദാ: para"
                placeholderTextColor="#A59B90"
                value={phoneticTranscription}
                onChangeText={setPhoneticTranscription}
              />

              <Text style={styles.label}>വ്യാകരണ ലിംഗം</Text>
              <View style={styles.genderOptions}>
                {["സ്ത്രീലിംഗം", "പുല്ലിംഗം", "ഉഭയലിംഗം", "നപുംസകലിംഗം"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderButton,
                      gender === g && styles.activeGenderButton,
                    ]}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === g && styles.activeGenderText,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 2. Meanings and examples section */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("meanings")}
            activeOpacity={0.8}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="book-outline" size={22} color="#2B2C51" />
              <Text style={styles.sectionTitle}>അർത്ഥങ്ങളും പ്രയോഗങ്ങളും</Text>
            </View>
            <Ionicons
              name={activeSection === "meanings" ? "chevron-up" : "chevron-down"}
              size={20}
              color="#2B2C51"
            />
          </TouchableOpacity>

          {activeSection === "meanings" && (
            <View style={styles.sectionContent}>
              {meanings.map((m, idx) => (
                <View key={idx} style={styles.itemBlock}>
                  <View style={styles.blockHeader}>
                    <Text style={styles.blockTitle}>അർത്ഥം {idx + 1}</Text>
                    {meanings.length > 1 && (
                      <TouchableOpacity onPress={() => handleRemoveMeaning(idx)}>
                        <Ionicons name="close-circle-outline" size={22} color="#D32F2F" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.label}>അർത്ഥം *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ഉദാ: സംസാരിക്കുക"
                    placeholderTextColor="#A59B90"
                    value={m.meaning}
                    onChangeText={(val) => handleMeaningChange(idx, "meaning", val)}
                  />

                  <Text style={styles.label}>ഉദാഹരണ വാക്യം</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ഉദാ: അവൻ കാര്യം പറഞ്ഞു."
                    placeholderTextColor="#A59B90"
                    value={m.context_usage}
                    onChangeText={(val) => handleMeaningChange(idx, "context_usage", val)}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={handleAddMeaning}>
                <Ionicons name="add" size={20} color="#16A697" />
                <Text style={styles.addButtonText}>അർത്ഥം കൂട്ടിച്ചേർക്കുക</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. Linguistic Details section */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("linguistic")}
            activeOpacity={0.8}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="library-outline" size={22} color="#2B2C51" />
              <Text style={styles.sectionTitle}>ഭാഷാപരമായ വിവരങ്ങൾ</Text>
            </View>
            <Ionicons
              name={activeSection === "linguistic" ? "chevron-up" : "chevron-down"}
              size={20}
              color="#2B2C51"
            />
          </TouchableOpacity>

          {activeSection === "linguistic" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>ധാതു / അടിസ്ഥാന രൂപം (Root)</Text>
              <TextInput
                style={styles.input}
                placeholder="ഉദാ: പര"
                placeholderTextColor="#A59B90"
                value={root}
                onChangeText={setRoot}
              />

              <Text style={styles.label}>വ്യുല്പത്തി വിവരണം (Etymology)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="ഉദാ: സംസ്കൃതത്തിലെ 'പൃ' എന്ന ധാതുവിൽ നിന്ന്..."
                placeholderTextColor="#A59B90"
                multiline
                numberOfLines={3}
                value={etymology}
                onChangeText={setEtymology}
              />

              <Text style={styles.label}>പര്യായങ്ങൾ (Synonyms)</Text>
              <TextInput
                style={styles.input}
                placeholder="കമകളായി വേർതിരിക്കുക (ചൊല്ല്, വാക്ക്)"
                placeholderTextColor="#A59B90"
                value={synonyms}
                onChangeText={setSynonyms}
              />

              <Text style={styles.label}>വിപരീതപദങ്ങൾ (Antonyms)</Text>
              <TextInput
                style={styles.input}
                placeholder="കമകളായി വേർതിരിക്കുക (മൗനം, നിശബ്ദത)"
                placeholderTextColor="#A59B90"
                value={antonyms}
                onChangeText={setAntonyms}
              />

              <Text style={styles.label}>പ്രാദേശിക രൂപങ്ങൾ (Dialects)</Text>
              <TextInput
                style={styles.input}
                placeholder="ഉദാ: തെക്കൻ കേരളത്തിൽ..."
                placeholderTextColor="#A59B90"
                value={dialects}
                onChangeText={setDialects}
              />

              <Text style={styles.label}>രൂപഭേദങ്ങൾ (Inflections)</Text>
              <TextInput
                style={styles.input}
                placeholder="ഉദാ: പറയുന്നു, പറഞ്ഞു, പറയും"
                placeholderTextColor="#A59B90"
                value={inflections}
                onChangeText={setInflections}
              />

              <Text style={styles.label}>സമാന പദങ്ങൾ (Similar Words)</Text>
              <TextInput
                style={styles.input}
                placeholder="ഉദാ: സംസാരം, ഉച്ചാരണം"
                placeholderTextColor="#A59B90"
                value={similarWord}
                onChangeText={setSimilarWord}
              />

              <Text style={styles.label}>പുതിയ പ്രയോഗങ്ങൾ (Novel Words)</Text>
              <TextInput
                style={styles.input}
                placeholder="ഉദാ: പറച്ചിൽ, പറയൽ"
                placeholderTextColor="#A59B90"
                value={novelWords}
                onChangeText={setNovelWords}
              />

              <Text style={styles.label}>മറ്റ് സൂചനകൾ (Cross Reference)</Text>
              <TextInput
                style={styles.input}
                placeholder="ഉദാ: പറയുക (to speak), പറച്ചിൽ (speech)"
                placeholderTextColor="#A59B90"
                value={crossReference}
                onChangeText={setCrossReference}
              />

              <Text style={styles.label}>സംസ്കാരിക പ്രത്യേകത (Cultural Note)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="പ്രസംഗവും കലാപരവുമായ പ്രാധാന്യം..."
                placeholderTextColor="#A59B90"
                multiline
                numberOfLines={3}
                value={culturalNote}
                onChangeText={setCulturalNote}
              />

              {/* Proverbs entry nested under linguistic details */}
              <View style={styles.subBlockHeader}>
                <Text style={styles.blockTitle}>പഴഞ്ചൊല്ലുകൾ (Proverbs)</Text>
              </View>

              {proverbsList.map((p, idx) => (
                <View key={idx} style={styles.itemBlockSub}>
                  <View style={styles.blockHeader}>
                    <Text style={styles.blockTitleSub}>ചൊല്ല് {idx + 1}</Text>
                    <TouchableOpacity onPress={() => handleRemoveProverb(idx)}>
                      <Ionicons name="close-circle-outline" size={20} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>പഴഞ്ചൊല്ല്</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="പഴഞ്ചൊല്ല് രേഖപ്പെടുത്തുക"
                    placeholderTextColor="#A59B90"
                    value={p.proverb}
                    onChangeText={(val) => handleProverbChange(idx, "proverb", val)}
                  />

                  <Text style={styles.label}>അർത്ഥ പശ്ചാത്തലം</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ഉപയോഗ പശ്ചാത്തലം രേഖപ്പെടുത്തുക"
                    placeholderTextColor="#A59B90"
                    value={p.context_usage}
                    onChangeText={(val) => handleProverbChange(idx, "context_usage", val)}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={handleAddProverb}>
                <Ionicons name="add" size={20} color="#16A697" />
                <Text style={styles.addButtonText}>പഴഞ്ചൊല്ല് കൂട്ടിച്ചേർക്കുക</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 4. Equivalents in other languages */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("equivalents")}
            activeOpacity={0.8}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="globe-outline" size={22} color="#2B2C51" />
              <Text style={styles.sectionTitle}>ഇതര ഭാഷാ രൂപങ്ങൾ</Text>
            </View>
            <Ionicons
              name={activeSection === "equivalents" ? "chevron-up" : "chevron-down"}
              size={20}
              color="#2B2C51"
            />
          </TouchableOpacity>

          {activeSection === "equivalents" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>ഇംഗ്ലീഷ് (English Equivalent)</Text>
              <TextInput
                style={styles.input}
                placeholder="English translation"
                placeholderTextColor="#A59B90"
                value={englishEq}
                onChangeText={setEnglishEq}
              />

              <Text style={styles.label}>തമിഴ് (Tamil)</Text>
              <TextInput
                style={styles.input}
                placeholder="தமிழ் வடிവം"
                placeholderTextColor="#A59B90"
                value={tamilEq}
                onChangeText={setTamilEq}
              />

              <Text style={styles.label}>കന്നഡ (Kannada)</Text>
              <TextInput
                style={styles.input}
                placeholder="ಕನ್ನಡ ರೂಪ"
                placeholderTextColor="#A59B90"
                value={kannadaEq}
                onChangeText={setKannadaEq}
              />

              <Text style={styles.label}>തെലുങ്ക് (Telugu)</Text>
              <TextInput
                style={styles.input}
                placeholder="తెలుగు రూపం"
                placeholderTextColor="#A59B90"
                value={teluguEq}
                onChangeText={setTeluguEq}
              />

              <Text style={styles.label}>തുളു (Tulu)</Text>
              <TextInput
                style={styles.input}
                placeholder="തുളു രൂപം"
                placeholderTextColor="#A59B90"
                value={tuluEq}
                onChangeText={setTuluEq}
              />
            </View>
          )}
        </View>

        {/* 5. Contributor Info */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection("contributor")}
            activeOpacity={0.8}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons name="person-outline" size={22} color="#2B2C51" />
              <Text style={styles.sectionTitle}>പങ്കാളിത്ത വിവരങ്ങൾ</Text>
            </View>
            <Ionicons
              name={activeSection === "contributor" ? "chevron-up" : "chevron-down"}
              size={20}
              color="#2B2C51"
            />
          </TouchableOpacity>

          {activeSection === "contributor" && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>നിങ്ങളുടെ പേര് (Your Name)</Text>
              <TextInput
                style={styles.input}
                placeholder="നിങ്ങളുടെ പേര്"
                placeholderTextColor="#A59B90"
                value={contributorName}
                onChangeText={setContributorName}
              />

              <Text style={styles.label}>ഇമെയിൽ (Email Address)</Text>
              <TextInput
                style={styles.input}
                placeholder="നിങ്ങളുടെ ഇമെയിൽ വിലാസം"
                placeholderTextColor="#A59B90"
                keyboardType="email-address"
                autoCapitalize="none"
                value={contributorEmail}
                onChangeText={setContributorEmail}
              />
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#white" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>സമർപ്പിക്കുക</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  helperText: {
    color: "#6D625A",
    fontSize: 14,
    fontFamily: "NotoSansMalayalam",
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E7E0D7",
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#2B2C51",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginLeft: 12,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderColor: "#F2EBE1",
    padding: 16,
    backgroundColor: "#FCFAF7",
  },
  label: {
    color: "#4E473E",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2D7CB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333333",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 10,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  genderOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginTop: 4,
    marginBottom: 6,
  },
  genderButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2D7CB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  activeGenderButton: {
    backgroundColor: "#2B2C51",
    borderColor: "#2B2C51",
  },
  genderText: {
    color: "#4E473E",
    fontSize: 13,
    fontFamily: "NotoSansMalayalam",
    fontWeight: "600",
  },
  activeGenderText: {
    color: "#FFFFFF",
  },
  itemBlock: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2D7CB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  itemBlockSub: {
    backgroundColor: "#FAF6F0",
    borderWidth: 1,
    borderColor: "#E6DCCE",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginTop: 4,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  subBlockHeader: {
    marginTop: 18,
    marginBottom: 8,
    borderTopWidth: 1,
    borderColor: "#E2D7CB",
    paddingTop: 14,
  },
  blockTitle: {
    color: "#2B2C51",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  blockTitleSub: {
    color: "#5C5040",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#16A697",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  addButtonText: {
    color: "#16A697",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginLeft: 6,
  },
  submitButton: {
    backgroundColor: "#16A697",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: 20,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 6px rgba(22, 166, 151, 0.2)",
      },
      default: {
        shadowColor: "#16A697",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
      },
    }),
  },
  submittingButton: {
    backgroundColor: "#8BD3CB",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
});
