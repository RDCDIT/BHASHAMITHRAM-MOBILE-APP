/**
 * @file suggest-word.tsx
 * @description Application route screen component for suggest-word.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  "https://bhashamithram-mobile-app-2.onrender.com",
].filter((value): value is string => Boolean(value));




interface EquivalentLanguage {
  language: string;
  translation: string;
}

/**
 * Renders and manages the SuggestWordScreen component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function SuggestWordScreen() {
  const router = useRouter();

  // App Setup Selection state
  const [selectedLanguage, setSelectedLanguage] = useState<"malayalam" | "english" | null>(null);
  const isEnglish = selectedLanguage === "english";

  // Form Section 1 State
  const [word, setWord] = useState("");
  const [root, setRoot] = useState("");
  const [etymology, setEtymology] = useState("");
  const [culturalNote, setCulturalNote] = useState("");
  const [phoneticTranscription, setPhoneticTranscription] = useState("");
  const [gender, setGender] = useState("");

  // Form Section 2 State (Arrays of entries, represented as tags in UI)
  const [synonymsList, setSynonymsList] = useState<string[]>([]);
  const [synonymInput, setSynonymInput] = useState("");

  const [antonymsList, setAntonymsList] = useState<string[]>([]);
  const [antonymInput, setAntonymInput] = useState("");

  const [dialectsList, setDialectsList] = useState<string[]>([]);
  const [dialectInput, setDialectInput] = useState("");

  const [proverbsList, setProverbsList] = useState<string[]>([]);
  const [proverbInput, setProverbInput] = useState("");

  const [novelWordsList, setNovelWordsList] = useState<string[]>([]);
  const [novelWordInput, setNovelWordInput] = useState("");

  const [crossRefsList, setCrossRefsList] = useState<string[]>([]);
  const [crossRefInput, setCrossRefInput] = useState("");

  const [inflectionsList, setInflectionsList] = useState<string[]>([]);
  const [inflectionInput, setInflectionInput] = useState("");

  // Equivalent Languages
  const [equivalents, setEquivalents] = useState({
    kannada: "",
    tamil: "",
    malayalam: "",
    english: "",
  });
  const [customLanguages, setCustomLanguages] = useState<EquivalentLanguage[]>([]);
  const [customLanguageName, setCustomLanguageName] = useState("");
  const [customLanguageValue, setCustomLanguageValue] = useState("");
  const [showCustomLangForm, setShowCustomLangForm] = useState(false);

  // Form Section 4 State (Contributor & Declarations)
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [declaration1, setDeclaration1] = useState(false);
  const [declaration2, setDeclaration2] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);

  // Form Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAcknowledgement, setShowAcknowledgement] = useState(false);

  // Helpers for tag inputs
  const addTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, input: string, setInput: React.Dispatch<React.SetStateAction<string>>) => {
    if (input.trim() !== "") {
      if (!list.includes(input.trim())) {
        setList([...list, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(list.filter((t) => t !== item));
  };

  // Add custom equivalent language
  const handleAddCustomLanguage = () => {
    if (!customLanguageName.trim() || !customLanguageValue.trim()) {
      Alert.alert("പിശക്", "ഭാഷയുടെ പേരും അർത്ഥവും നൽകുക.");
      return;
    }
    const alreadyExists = customLanguages.some(
      (lang) => lang.language.toLowerCase() === customLanguageName.trim().toLowerCase()
    );
    if (alreadyExists) {
      Alert.alert("പിശക്", "ഈ ഭാഷ ഇതിനകം ചേർത്തിട്ടുണ്ട്.");
      return;
    }
    setCustomLanguages([
      ...customLanguages,
      { language: customLanguageName.trim(), translation: customLanguageValue.trim() },
    ]);
    setCustomLanguageName("");
    setCustomLanguageValue("");
    setShowCustomLangForm(false);
  };



  // Form submission handler
  /**
 * Asynchronous controller/helper function: handleSubmit.
 */
  const handleSubmit = async () => {
    if (!word.trim()) {
      Alert.alert(
        selectedLanguage === "english" ? "Error" : "പിശക്",
        selectedLanguage === "english" ? "Word is required." : "പദം (Word) നിർബന്ധമായും നൽകേണ്ടതുണ്ട്."
      );
      return;
    }
    if (!contributorName.trim() || !contributorEmail.trim()) {
      Alert.alert(
        selectedLanguage === "english" ? "Error" : "പിശക്",
        selectedLanguage === "english" ? "Please enter your name and email." : "നിങ്ങളുടെ പേരും ഇമെയിലും നൽകുക."
      );
      return;
    }
    if (!declaration1 || !declaration2 || !receiveEmails) {
      Alert.alert(
        selectedLanguage === "english" ? "Error" : "പിശക്",
        selectedLanguage === "english" ? "Please accept all declarations and terms to proceed." : "തുടരുന്നതിന് എല്ലാ സത്യപ്രസ്താവനകളും വിവരങ്ങളും അംഗീകരിക്കുക."
      );
      return;
    }

    setIsSubmitting(true);

    const base64Audio = "";
    const base64Images: string[] = [];

    // Prepare payload
    const payload = {
      word: word.trim(),
      root: root.trim(),
      etymology: etymology.trim(),
      cultural_note: culturalNote.trim(),
      phonetic_transcription: phoneticTranscription.trim(),
      gender: gender,
      synonyms: synonymsList.join(", "),
      antonyms: antonymsList.join(", "),
      dialects: dialectsList.join(", "),
      proverb: proverbsList.join(", "),
      novel_words: novelWordsList.join(", "),
      cross_reference: crossRefsList.join(", "),
      inflections: inflectionsList.join(", "),
      equivalents: {
        kannada: equivalents.kannada.trim(),
        tamil: equivalents.tamil.trim(),
        telugu: "", // Default empty as no subentry required
        tulu: "",
        english: equivalents.english.trim(),
      },
      equivalent_languages: customLanguages,
      contributor: {
        name: contributorName.trim(),
        email: contributorEmail.trim(),
        receive_emails: receiveEmails,
      },
      images: base64Images,
      pronunciation: base64Audio,
      language_type: selectedLanguage || "malayalam",
      meanings: [], // Default empty or structured if meaning is added later
      proverbs: [],
    };

    try {
      let submissionSuccess = false;
      let lastError = null;

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          console.log(`[Suggest] Submitting word to ${apiBaseUrl}/api/words/suggest`);
          const response = await fetch(`${apiBaseUrl}/api/words/suggest`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            submissionSuccess = true;

            // Send another request to the Dataview_collection endpoint
            try {
              console.log(`[Suggest] Submitting dataview to ${apiBaseUrl}/api/words/dataview`);
              await fetch(`${apiBaseUrl}/api/words/dataview`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: contributorName.trim(),
                  email: contributorEmail.trim(),
                  word: word.trim(),
                }),
              });
            } catch (dvErr) {
              console.error("Failed to save to Dataview_collection:", dvErr);
            }

            break;
          } else {
            const errText = await response.text();
            throw new Error(errText || `Server responded with ${response.status}`);
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (submissionSuccess) {
        setShowAcknowledgement(true);
      } else {
        throw lastError || new Error(selectedLanguage === "english" ? "Failed to connect to network." : "നെറ്റ്‌വർക്ക് കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല.");
      }
    } catch (error: any) {
      Alert.alert(
        selectedLanguage === "english" ? "Submission Failed" : "സമർപ്പണം പരാജയപ്പെട്ടു",
        error.message || (selectedLanguage === "english" ? "Failed to connect to the server." : "സെർവറുമായി ബന്ധപ്പെടാൻ സാധിച്ചില്ല.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Render Selection Screen (Language Select)
  // ------------------------------------------------------------
  if (!selectedLanguage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#2B2C51" }]} edges={["top", "left", "right"]}>
        <StatusBar backgroundColor="#2B2C51" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>വാക്ക് നിർദ്ദേശിക്കുക</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.body, styles.selectionContainer, { backgroundColor: "#F9F6F1" }]}>
          <Text style={styles.selectionPrompt}>പദ നിർദ്ദേശത്തിലേക്ക് സ്വാഗതം</Text>
          <Text style={styles.selectionSubPrompt}>നിങ്ങൾ ചേർക്കാൻ ആഗ്രഹിക്കുന്ന വാക്കിന്റെ ഭാഷ തിരഞ്ഞെടുക്കുക:</Text>

          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setSelectedLanguage("malayalam")}
            activeOpacity={0.8}
          >
            <View style={styles.langBtnIconBg}>
              <Text style={styles.langEmoji}>അ</Text>
            </View>
            <View style={styles.langBtnTextContainer}>
              <Text style={styles.langBtnTitle}>മലയാളം പദം (Malayalam Word)</Text>
              <Text style={styles.langBtnSub}>മലയാളം വാക്കിന്റെ നിർദ്ദേശങ്ങൾ സമർപ്പിക്കുക</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langButton, { marginTop: 16 }]}
            onPress={() => setSelectedLanguage("english")}
            activeOpacity={0.8}
          >
            <View style={[styles.langBtnIconBg, { backgroundColor: "#EFF6FF" }]}>
              <Text style={[styles.langEmoji, { color: "#2563EB" }]}>A</Text>
            </View>
            <View style={styles.langBtnTextContainer}>
              <Text style={styles.langBtnTitle}>ഇംഗ്ലീഷ് പദം (English Word)</Text>
              <Text style={styles.langBtnSub}>English language suggestion form</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }



  // Helper component to render array tags
  const renderTagList = (list: string[], onRemove: (item: string) => void) => {
    if (list.length === 0) return null;
    return (
      <View style={styles.tagContainer}>
        {list.map((item, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity onPress={() => onRemove(item)} style={styles.removeTagBtn}>
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // ------------------------------------------------------------
  // Render Malayalam Screen (4-Section Form)
  // ------------------------------------------------------------
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#2B2C51" }]} edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#2B2C51" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedLanguage(null)} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEnglish ? "English Word Suggestion" : "മലയാളം പദ നിർദ്ദേശം"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#F9F6F1" }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* SECTION 1: Disclaimer & Basic Details */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderContainer}>
              <Ionicons name="document-text-outline" size={22} color="#2B2C51" />
              <Text style={styles.sectionHeading}>{isEnglish ? "Section 1: Basic Details" : "വിഭാഗം 1: അടിസ്ഥാന വിവരങ്ങൾ (Basic Details)"}</Text>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimerContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#92400E" style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.disclaimerTitle}>{isEnglish ? "Instructions:" : "നിർദ്ദേശങ്ങൾ (Instructions):"}</Text>
                <Text style={styles.disclaimerText}>
                  {isEnglish
                    ? "* Marked fields are mandatory. Others are optional."
                    : "* അടയാളപ്പെടുത്തിയവ പൂരിപ്പിക്കൽ നിർബന്ധമാണ് (Mandatory fields). മറ്റുള്ളവ നിങ്ങൾക്ക് ആവശ്യമെങ്കിൽ നൽകാവുന്നതാണ് (Optional fields)."}
                </Text>
              </View>
            </View>

            {/* Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Word *" : "വാക്ക് (Word) *"}</Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "Enter word (e.g., stone)" : "വാക്ക് നൽകുക (उदा. കല്ല്)"}
                value={word}
                onChangeText={setWord}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Root Word" : "ധാതു (Root)"}</Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "Enter root word" : "ധാതു നൽകുക"}
                value={root}
                onChangeText={setRoot}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Etymology" : "വാക്കിന്റെ ഉത്ഭവം (Etymology)"}</Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "Enter etymology" : "ഉത്ഭവം നൽകുക"}
                value={etymology}
                onChangeText={setEtymology}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Cultural Note" : "സാംസ്കാരിക കുറിപ്പ് (Cultural Note)"}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={isEnglish ? "Enter cultural significance" : "സാംസ്കാരിക പ്രാധാന്യം നൽകുക"}
                value={culturalNote}
                onChangeText={setCulturalNote}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Phonetic Transcription" : "ഉച്ചാരണ രീതി (Phonetic Transcription)"}</Text>
              <TextInput
                style={styles.input}
                placeholder="phonetic-transcription"
                value={phoneticTranscription}
                onChangeText={setPhoneticTranscription}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Gender" : "ലിംഗം (Gender)"}</Text>
              <View style={styles.genderRow}>
                {(isEnglish
                  ? [
                    { label: "Masculine", value: "പുല്ലിംഗം" },
                    { label: "Feminine", value: "സ്ത്രീലിംഗം" },
                    { label: "Neuter", value: "നപുംസകലിംഗം" }
                  ]
                  : [
                    { label: "പുല്ലിംഗം", value: "പുല്ലിംഗം" },
                    { label: "സ്ത്രീലിംഗം", value: "സ്ത്രീലിംഗം" },
                    { label: "നപുംസകലിംഗം", value: "നപുംസകലിംഗം" }
                  ]
                ).map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[
                      styles.genderButton,
                      gender === g.value && styles.genderButtonSelected,
                    ]}
                    onPress={() => setGender(gender === g.value ? "" : g.value)}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        gender === g.value && styles.genderButtonTextSelected,
                      ]}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* SECTION 2: Lexical Relations & Languages */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderContainer}>
              <Ionicons name="git-branch-outline" size={22} color="#2B2C51" />
              <Text style={styles.sectionHeading}>{isEnglish ? "Section 2: Lexical Relations & Translations" : "വിഭാഗം 2: പദബന്ധങ്ങളും വിവർത്തനങ്ങളും"}</Text>
            </View>
            <Text style={styles.sectionSubtext}>{isEnglish ? "All entries optional" : "എല്ലാ വിവരങ്ങളും നിർബന്ധമില്ലാത്തവയാണ് (All entries optional)"}</Text>

            {/* Synonyms */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Synonyms" : "പര്യായപദങ്ങൾ (Synonyms)"}</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.flexInput}
                  placeholder={isEnglish ? "Enter synonym" : "പര്യായപദം നൽകുക"}
                  value={synonymInput}
                  onChangeText={setSynonymInput}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => addTag(synonymsList, setSynonymsList, synonymInput, setSynonymInput)}
                >
                  <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                </TouchableOpacity>
              </View>
              {renderTagList(synonymsList, (item) => removeTag(synonymsList, setSynonymsList, item))}
            </View>

            {/* Antonyms */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Antonyms" : "വിപരീതപദങ്ങൾ (Antonyms)"}</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.flexInput}
                  placeholder={isEnglish ? "Enter antonym" : "വിപരീതപദം നൽകുക"}
                  value={antonymInput}
                  onChangeText={setAntonymInput}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => addTag(antonymsList, setAntonymsList, antonymInput, setAntonymInput)}
                >
                  <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                </TouchableOpacity>
              </View>
              {renderTagList(antonymsList, (item) => removeTag(antonymsList, setAntonymsList, item))}
            </View>

            {/* Dialects */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Dialects / Regional Usages" : "പ്രാദേശിക പ്രയോഗങ്ങൾ (Dialects)"}</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.flexInput}
                  placeholder={isEnglish ? "Enter regional usage" : "പ്രാദേശിക രൂപങ്ങൾ നൽകുക"}
                  value={dialectInput}
                  onChangeText={setDialectInput}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => addTag(dialectsList, setDialectsList, dialectInput, setDialectInput)}
                >
                  <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                </TouchableOpacity>
              </View>
              {renderTagList(dialectsList, (item) => removeTag(dialectsList, setDialectsList, item))}
            </View>

            {/* Proverbs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Proverbs" : "പഴഞ്ചൊല്ലുകൾ (Proverbs)"}</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.flexInput}
                  placeholder={isEnglish ? "Enter proverb" : "പഴഞ്ചൊല്ലുകൾ നൽകുക"}
                  value={proverbInput}
                  onChangeText={setProverbInput}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => addTag(proverbsList, setProverbsList, proverbInput, setProverbInput)}
                >
                  <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                </TouchableOpacity>
              </View>
              {renderTagList(proverbsList, (item) => removeTag(proverbsList, setProverbsList, item))}
            </View>

            {/* Novel Words */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Novel Words" : "നവീന പ്രയോഗങ്ങൾ (Novel Words)"}</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.flexInput}
                  placeholder={isEnglish ? "Enter novel word" : "നവീന പദം നൽകുക"}
                  value={novelWordInput}
                  onChangeText={setNovelWordInput}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => addTag(novelWordsList, setNovelWordsList, novelWordInput, setNovelWordInput)}
                >
                  <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                </TouchableOpacity>
              </View>
              {renderTagList(novelWordsList, (item) => removeTag(novelWordsList, setNovelWordsList, item))}
            </View>

            {/* Cross Reference */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Cross References" : "പരാമർശങ്ങൾ (Cross Reference)"}</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.flexInput}
                  placeholder={isEnglish ? "Enter cross reference" : "പരാമർശം നൽകുക"}
                  value={crossRefInput}
                  onChangeText={setCrossRefInput}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => addTag(crossRefsList, setCrossRefsList, crossRefInput, setCrossRefInput)}
                >
                  <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                </TouchableOpacity>
              </View>
              {renderTagList(crossRefsList, (item) => removeTag(crossRefsList, setCrossRefsList, item))}
            </View>

            {/* Inflections */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Grammatical Forms / Inflections" : "വ്യാകരണ രൂപങ്ങൾ (Inflections)"}</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.flexInput}
                  placeholder={isEnglish ? "Enter grammatical inflection" : "വ്യാകരണ രൂപങ്ങൾ നൽകുക"}
                  value={inflectionInput}
                  onChangeText={setInflectionInput}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => addTag(inflectionsList, setInflectionsList, inflectionInput, setInflectionInput)}
                >
                  <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                </TouchableOpacity>
              </View>
              {renderTagList(inflectionsList, (item) => removeTag(inflectionsList, setInflectionsList, item))}
            </View>

            {/* Equivalents */}
            <Text style={styles.subSectionTitle}>{isEnglish ? "Equivalent Languages" : "ഭാഷാ തുല്യതകൾ (Equivalent Languages)"}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Kannada" : "കന്നഡ (Kannada)"}</Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "Kannada translation" : "ಕನ್ನಡ വിവർത്തനം"}
                value={equivalents.kannada}
                onChangeText={(text) => setEquivalents({ ...equivalents, kannada: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Tamil" : "തമിഴ് (Tamil)"}</Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "Tamil translation" : "தமிழ் വിവർത്തനം"}
                value={equivalents.tamil}
                onChangeText={(text) => setEquivalents({ ...equivalents, tamil: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Malayalam (Malayalam Translation)" : "മലയാളം (Malayalam Translation)"}</Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "Malayalam translation" : "മലയാള വിവർത്തനം"}
                value={equivalents.malayalam}
                onChangeText={(text) => setEquivalents({ ...equivalents, malayalam: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "English (English)" : "ഇംഗ്ലീഷ് (English)"}</Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "English translation" : "English Translation"}
                value={equivalents.english}
                onChangeText={(text) => setEquivalents({ ...equivalents, english: text })}
              />
            </View>

            {/* Custom Languages */}
            {customLanguages.map((item, idx) => (
              <View key={idx} style={styles.customLangWrapper}>
                <Text style={styles.label}>{item.language}</Text>
                <View style={styles.rowAlign}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={item.translation}
                    editable={false}
                  />
                  <TouchableOpacity
                    style={styles.deleteCustomBtn}
                    onPress={() => setCustomLanguages(customLanguages.filter((_, i) => i !== idx))}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add custom lang form toggle */}
            {!showCustomLangForm ? (
              <TouchableOpacity
                style={styles.addCustomLangBtn}
                onPress={() => setShowCustomLangForm(true)}
              >
                <Ionicons name="add-circle-outline" size={18} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={styles.addCustomLangText}>{isEnglish ? "Add custom language" : "മറ്റ് ഭാഷകൾ ചേർക്കുക (Add custom language)"}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.customLangForm}>
                <Text style={styles.customFormHeading}>{isEnglish ? "Add Custom Language" : "മറ്റ് ഭാഷ നിർദ്ദേശം"}</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 10 }]}
                  placeholder={isEnglish ? "Language name (e.g., French)" : "ഭാഷയുടെ പേര് (ഉദാ. French)"}
                  value={customLanguageName}
                  onChangeText={setCustomLanguageName}
                />
                <TextInput
                  style={[styles.input, { marginBottom: 10 }]}
                  placeholder={isEnglish ? "Translation (e.g., Bonjour)" : "ഭാഷയിലെ അർത്ഥം (ഉദാ. Bonjour)"}
                  value={customLanguageValue}
                  onChangeText={setCustomLanguageValue}
                />
                <View style={styles.customFormActions}>
                  <TouchableOpacity
                    style={[styles.customFormBtn, styles.cancelBtn]}
                    onPress={() => setShowCustomLangForm(false)}
                  >
                    <Text style={styles.cancelText}>{isEnglish ? "Cancel" : "അല്ല"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.customFormBtn, styles.confirmBtn]}
                    onPress={handleAddCustomLanguage}
                  >
                    <Text style={styles.confirmText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>



          {/* SECTION 3: Contributor Details & Finish */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderContainer}>
              <Ionicons name="person-outline" size={22} color="#2B2C51" />
              <Text style={styles.sectionHeading}>{isEnglish ? "Section 3: Contributor Details & Submission" : "വിഭാഗം 3: കോൺട്രിബ്യൂട്ടർ വിവരങ്ങളും സമർപ്പണവും"}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Name" : "പേര് (Name)"} <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "Enter your name" : "നിങ്ങളുടെ പേര് നൽകുക"}
                value={contributorName}
                onChangeText={setContributorName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{isEnglish ? "Email" : "ഇമെയിൽ (Email)"} <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder={isEnglish ? "Enter your email address" : "നിങ്ങളുടെ ഇമെയിൽ വിലാസം"}
                value={contributorEmail}
                onChangeText={setContributorEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Checkboxes declarations */}
            <View style={styles.checkboxWrapper}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setDeclaration1(!declaration1)}
              >
                <Ionicons
                  name={declaration1 ? "checkbox" : "square-outline"}
                  size={24}
                  color={declaration1 ? "#2B2C51" : "#6B7280"}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                {isEnglish
                  ? "I certify that the information submitted by me is completely accurate and factual."
                  : "ഞാൻ സമർപ്പിച്ച ഈ വിവരങ്ങൾ പൂർണ്ണമായും കൃത്യവും വസ്തുതാപരവുമാണെന്ന് സാക്ഷ്യപ്പെടുത്തുന്നു."}
              </Text>
            </View>

            <View style={styles.checkboxWrapper}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setDeclaration2(!declaration2)}
              >
                <Ionicons
                  name={declaration2 ? "checkbox" : "square-outline"}
                  size={24}
                  color={declaration2 ? "#2B2C51" : "#6B7280"}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                {isEnglish
                  ? "I accept C-DIT terms and conditions for suggesting words to the dictionary."
                  : "നിഘണ്ടുവിലേക്ക് പദങ്ങൾ ചേർക്കുന്നതിനുള്ള C-DIT നിബന്ധനകൾ ഞാൻ അംഗീകരിക്കുന്നു."}
              </Text>
            </View>

            <View style={styles.checkboxWrapper}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setReceiveEmails(!receiveEmails)}
              >
                <Ionicons
                  name={receiveEmails ? "checkbox" : "square-outline"}
                  size={24}
                  color={receiveEmails ? "#2B2C51" : "#6B7280"}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                {isEnglish
                  ? "I agree to receive emails/updates from R&D C-DIT."
                  : "R&D C-DIT-ൽ നിന്നുള്ള ഇമെയിലുകൾ ലഭിക്കുന്നതിനും ആശയവിനിമയം നടത്തുന്നതിനും ഞാൻ സമ്മതിക്കുന്നു (Receive updates/mails from R&D C-DIT)."}
              </Text>
            </View>

            {/* Finish/Submit button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>{isEnglish ? "Submit" : "സമർപ്പിക്കുക (Submit)"}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Acknowledgement Modal */}
      <Modal
        visible={showAcknowledgement}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowAcknowledgement(false);
          router.replace("/");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalSuccessIconBg}>
              <Ionicons name="checkmark-circle" size={54} color="#10B981" />
            </View>

            <Text style={styles.modalTitle}>
              {isEnglish ? "Thank You!" : "നന്ദി!"}
            </Text>

            <Text style={styles.modalDescription}>
              {isEnglish
                ? "Your word suggestion has been successfully submitted. It will be added to the dictionary after verification by our administration panel."
                : "നിങ്ങൾ നിർദ്ദേശിച്ച വാക്ക് വിജയകരമായി സമർപ്പിച്ചു. ഞങ്ങളുടെ അഡ്മിൻ പാനൽ ഇത് പരിശോധിച്ചതിനു ശേഷം നിഘണ്ടുവിൽ ചേർക്കുന്നതായിരിക്കും."}
            </Text>

            <View style={styles.modalDetailsContainer}>
              <Text style={styles.modalDetailsLabel}>
                {isEnglish ? "Submitted Word:" : "സമർപ്പിച്ച വാക്ക്:"}
              </Text>
              <Text style={styles.modalDetailsValue}>{word}</Text>

              <Text style={[styles.modalDetailsLabel, { marginTop: 10 }]}>
                {isEnglish ? "Contributor Name:" : "സംഭാവന ചെയ്തയാൾ:"}
              </Text>
              <Text style={styles.modalDetailsValue}>{contributorName}</Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowAcknowledgement(false);
                router.replace("/");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>
                {isEnglish ? "OK" : "ശരി"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 18, 38, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
  },
  modalSuccessIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E1B4B",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "NotoSansMalayalam",
  },
  modalDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: "NotoSansMalayalam",
  },
  modalDetailsContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 16,
    width: "100%",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalDetailsLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    fontFamily: "NotoSansMalayalam",
  },
  modalDetailsValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 2,
    fontFamily: "NotoSansMalayalam",
  },
  modalButton: {
    backgroundColor: "#2B2C51",
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  header: {
    height: Platform.OS === "android" ? 65 : 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3B3D6B",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  body: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  selectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F9F6F1",
  },
  selectionPrompt: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2B2C51",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "NotoSansMalayalam",
  },
  selectionSubPrompt: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "NotoSansMalayalam",
  },
  langButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  langBtnIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF1F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  langEmoji: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F43F5E",
  },
  langBtnTextContainer: {
    flex: 1,
  },
  langBtnTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 2,
  },
  langBtnSub: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "NotoSansMalayalam",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2B2C51",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 26,
    fontFamily: "NotoSansMalayalam",
  },
  placeholderSubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
    fontFamily: "NotoSansMalayalam",
  },
  backBtn: {
    backgroundColor: "#2B2C51",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0ECE6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  uploadCard: {
    minHeight: 480,
    padding: 26,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
    marginLeft: 8,
  },
  sectionSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 16,
    fontStyle: "italic",
    fontFamily: "NotoSansMalayalam",
  },
  disclaimerContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#92400E",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 6,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
    fontFamily: "NotoSansMalayalam",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  flexInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
    marginRight: 8,
    fontFamily: "NotoSansMalayalam",
  },
  addTagBtn: {
    backgroundColor: "#2B2C51",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addTagBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B3D6B",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "NotoSansMalayalam",
    marginRight: 6,
  },
  removeTagBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    fontFamily: "NotoSansMalayalam",
    marginTop: 14,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  customLangWrapper: {
    backgroundColor: "#F9FAF9",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteCustomBtn: {
    marginLeft: 12,
    padding: 6,
  },
  addCustomLangBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#3B82F6",
    marginTop: 8,
  },
  addCustomLangText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
    fontFamily: "NotoSansMalayalam",
  },
  customLangForm: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  customFormHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E40AF",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 8,
  },
  customFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  customFormBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  confirmBtn: {
    backgroundColor: "#2563EB",
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  mediaButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    fontFamily: "NotoSansMalayalam",
    flexShrink: 1,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  imageThumbWrapper: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  imageThumbText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    marginRight: 6,
    fontFamily: "NotoSansMalayalam",
  },
  deleteImageBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  audioControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  recordStartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
  },
  recordStartBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 8,
    fontFamily: "NotoSansMalayalam",
  },
  recordStopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
  },
  recordStopBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 8,
    fontFamily: "NotoSansMalayalam",
  },
  mediaSuccessBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  mediaSuccessText: {
    flex: 1,
    color: "#065F46",
    fontSize: 13,
    marginLeft: 8,
    fontFamily: "NotoSansMalayalam",
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingRight: 10,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    fontFamily: "NotoSansMalayalam",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2B2C51",
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  voiceBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    marginBottom: 12,
  },
  voiceBar: {
    width: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  audioPlayWrapper: {
    marginTop: 8,
  },
  playbackRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  playbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playbackBtnActive: {
    backgroundColor: "#1D4ED8",
  },
  playbackBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
    fontFamily: "NotoSansMalayalam",
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    backgroundColor: "#F9FAFB",
  },
  genderButtonSelected: {
    borderColor: "#2B2C51",
    backgroundColor: "#EFF6FF",
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    fontFamily: "NotoSansMalayalam",
  },
  genderButtonTextSelected: {
    color: "#2B2C51",
    fontWeight: "700",
  },
});
