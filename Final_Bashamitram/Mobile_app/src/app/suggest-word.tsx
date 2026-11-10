/**
 * @file suggest-word.tsx
 * @description Application route screen component for suggesting words to the Bhashamithram dictionary.
 * Faithfully redesigned to match the official design:
 * - Common branded header with back button, logo emblem, title, leaf divider, and tagline
 * - Welcome / Language Selection screen with stylized book illustration and language cards
 * - English and Malayalam suggestion forms with styled Section 1 (Basic Details) and Section 3 (Contributor Details & Submission)
 * - Collapsible "+ Add More Details" section for linguistic metadata (root, synonyms, etymology, etc.)
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingLettersBackground from "../components/FloatingLettersBackground";
import { useResponsive } from "../utils/responsive";
import {
  cleanEnglishAlphabets,
  cleanMalayalamAlphabets,
  cleanMalayalamOrEnglishAlphabets,
  isStrictEnglishAlphabets,
  isStrictMalayalamAlphabets,
  validateHighEndEmail,
} from "../utils/security";
import { saveLocalSuggestedWord } from "../database/dictionaryService";

const API_BASE_URLS = [
  process.env.EXPO_PUBLIC_API_URL,
  "https://bhashamithram-mobile-app-2.onrender.com",
].filter((value): value is string => Boolean(value));

interface EquivalentLanguage {
  language: string;
  translation: string;
}

export default function SuggestWordScreen() {
  const router = useRouter();
  const { isSmallPhone, isTablet } = useResponsive();

  // Language Selection state: null = Selection screen, "malayalam" | "english" = Form screen
  const [selectedLanguage, setSelectedLanguage] = useState<"malayalam" | "english" | null>(null);
  const isEnglish = selectedLanguage === "english";

  // Section 1: Basic Details
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [showMoreFields, setShowMoreFields] = useState(false);

  // Optional Extra Linguistic Fields
  const [root, setRoot] = useState("");
  const [etymology, setEtymology] = useState("");
  const [culturalNote, setCulturalNote] = useState("");
  const [phoneticTranscription, setPhoneticTranscription] = useState("");
  const [gender, setGender] = useState("");

  // Optional Arrays (Tags)
  const [synonymsList, setSynonymsList] = useState<string[]>([]);
  const [synonymInput, setSynonymInput] = useState("");

  const [antonymsList, setAntonymsList] = useState<string[]>([]);
  const [antonymInput, setAntonymInput] = useState("");

  const [dialectsList, setDialectsList] = useState<string[]>([]);
  const [dialectInput, setDialectInput] = useState("");

  const [proverbsList, setProverbsList] = useState<string[]>([]);
  const [proverbInput, setProverbInput] = useState("");

  // Custom equivalent languages
  const [customLanguages, setCustomLanguages] = useState<EquivalentLanguage[]>([]);
  const [customLanguageName, setCustomLanguageName] = useState("");
  const [customLanguageValue, setCustomLanguageValue] = useState("");
  const [showCustomLangForm, setShowCustomLangForm] = useState(false);

  // Section 3: Contributor Details & Declarations
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [declaration1, setDeclaration1] = useState(false);
  const [declaration2, setDeclaration2] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAcknowledgement, setShowAcknowledgement] = useState(false);

  // Sanitizers
  const cleanInputByLang = (text: string): string => {
    return isEnglish ? cleanEnglishAlphabets(text) : cleanMalayalamAlphabets(text);
  };

  const cleanContributorName = (text: string): string => {
    return isEnglish ? cleanEnglishAlphabets(text) : cleanMalayalamOrEnglishAlphabets(text);
  };

  const cleanEmailInput = (text: string): string => {
    return text.replace(/\s+/g, "").replace(/['’‘`]|\\'/g, "").replace(/<[^>]*>/g, "").toLowerCase();
  };

  // Tag Helpers
  const addTag = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const cleaned = cleanInputByLang(input.trim());
    if (cleaned !== "") {
      if (!list.includes(cleaned)) {
        setList([...list, cleaned]);
      }
      setInput("");
    }
  };

  const removeTag = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setList(list.filter((t) => t !== item));
  };

  const handleAddCustomLanguage = () => {
    const cleanName = cleanEnglishAlphabets(customLanguageName.trim());
    const cleanVal = cleanInputByLang(customLanguageValue.trim());
    if (!cleanName || !cleanVal) {
      Alert.alert(
        isEnglish ? "Error" : "പിശക്",
        isEnglish
          ? "Please enter language name and translation (alphabets only)."
          : "ഭാഷയുടെ പേരും അർത്ഥവും നൽകുക (അക്ഷരങ്ങൾ മാത്രം)."
      );
      return;
    }
    const alreadyExists = customLanguages.some(
      (lang) => lang.language.toLowerCase() === cleanName.toLowerCase()
    );
    if (alreadyExists) {
      Alert.alert(
        isEnglish ? "Error" : "പിശക്",
        isEnglish ? "This language has already been added." : "ഈ ഭാഷ ഇതിനകം ചേർത്തിട്ടുണ്ട്."
      );
      return;
    }
    setCustomLanguages([
      ...customLanguages,
      { language: cleanName, translation: cleanVal },
    ]);
    setCustomLanguageName("");
    setCustomLanguageValue("");
    setShowCustomLangForm(false);
  };

  // Form submission handler
  const handleSubmit = async () => {
    // 1. Mandatory Fields Validation
    if (!word.trim()) {
      Alert.alert(
        isEnglish ? "Error" : "പിശക്",
        isEnglish ? "Word is required." : "വാക്ക് (Word) നിർബന്ധമായും നൽകേണ്ടതുണ്ട്."
      );
      return;
    }
    if (!meaning.trim()) {
      Alert.alert(
        isEnglish ? "Error" : "പിശക്",
        isEnglish ? "Meaning is required." : "വാക്കിന്റെ അർത്ഥം (Meaning) നിർബന്ധമായും നൽകേണ്ടതുണ്ട്."
      );
      return;
    }
    if (!contributorName.trim()) {
      Alert.alert(
        isEnglish ? "Error" : "പിശക്",
        isEnglish ? "Contributor name is required." : "നിങ്ങളുടെ പേര് നൽകുക."
      );
      return;
    }
    if (!contributorEmail.trim()) {
      Alert.alert(
        isEnglish ? "Error" : "പിശക്",
        isEnglish ? "Contributor email is required." : "ഇമെയിൽ വിലാസം നൽകുക."
      );
      return;
    }
    if (!declaration1 || !declaration2 || !receiveEmails) {
      Alert.alert(
        isEnglish ? "Error" : "പിശക്",
        isEnglish
          ? "Please accept all declarations and terms to proceed."
          : "തുടരുന്നതിന് എല്ലാ സത്യപ്രസ്താവനകളും വിവരങ്ങളും അംഗീകരിക്കുക."
      );
      return;
    }

    // 2. Alphabet & Format Validation
    if (isEnglish) {
      if (!isStrictEnglishAlphabets(word)) {
        Alert.alert(
          "Invalid Word",
          "English word suggestion allows only English alphabets and spaces."
        );
        return;
      }
      if (!isStrictEnglishAlphabets(meaning)) {
        Alert.alert(
          "Invalid Meaning",
          "Meaning must contain only English alphabets and spaces."
        );
        return;
      }
      if (!isStrictEnglishAlphabets(contributorName)) {
        Alert.alert(
          "Invalid Name",
          "Name must contain only English alphabets and spaces."
        );
        return;
      }
    } else {
      if (!isStrictMalayalamAlphabets(word)) {
        Alert.alert(
          "അസാധുവായ പദം",
          "മലയാളം പദ നിർദ്ദേശത്തിൽ മലയാളം അക്ഷരങ്ങളും സ്പേസും മാത്രമേ അനുവദിക്കൂ."
        );
        return;
      }
      if (!isStrictMalayalamAlphabets(meaning)) {
        Alert.alert(
          "അസാധുവായ അർത്ഥം",
          "അർത്ഥത്തിൽ മലയാളം അക്ഷരങ്ങളും സ്പേസും മാത്രമേ അനുവദിക്കൂ."
        );
        return;
      }
    }

    // 3. Email Validation
    const emailValidation = validateHighEndEmail(contributorEmail);
    if (!emailValidation.isValid) {
      Alert.alert(
        isEnglish ? "Invalid Email" : "അസാധുവായ ഇമെയിൽ",
        isEnglish ? emailValidation.errorEn : emailValidation.errorMl
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        word: word.trim(),
        meaning: meaning.trim(),
        root: root.trim(),
        etymology: etymology.trim(),
        cultural_note: culturalNote.trim(),
        phonetic_transcription: phoneticTranscription.trim(),
        gender: gender.trim(),
        synonyms: synonymsList,
        antonyms: antonymsList,
        dialects: dialectsList,
        proverbs: proverbsList,
        equivalent_languages: customLanguages,
        contributor_name: contributorName.trim(),
        contributor_email: contributorEmail.trim(),
        declaration_verified: declaration1,
        declaration_terms: declaration2,
        receive_emails: receiveEmails,
        language_type: selectedLanguage || "malayalam",
      };

      // Save locally first
      try {
        await saveLocalSuggestedWord({
          word: word.trim(),
          meaning: meaning.trim(),
          language_type: selectedLanguage || "malayalam",
          root: root.trim(),
          etymology: etymology.trim(),
          cultural_note: culturalNote.trim(),
          gender: gender.trim(),
          phonetic_transcription: phoneticTranscription.trim(),
          synonyms: synonymsList.join(", "),
          antonyms: antonymsList.join(", "),
          dialects: dialectsList.join(", "),
          proverbs: proverbsList.join(", "),
          equivalents: JSON.stringify(customLanguages),
          contributor_name: contributorName.trim(),
          contributor_email: contributorEmail.trim(),
          status: "pending",
        });
      } catch (localErr) {
        console.warn("Could not save word locally:", localErr);
      }

      // Sync with remote APIs
      let submitSuccess = false;
      for (const baseUrl of API_BASE_URLS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          const response = await fetch(`${baseUrl}/api/suggest-word`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            submitSuccess = true;
            break;
          }
        } catch {
          // Continue to next endpoint fallback
        }
      }

      // Show Acknowledgement
      setShowAcknowledgement(true);
    } catch (error) {
      Alert.alert(
        isEnglish ? "Submission Failed" : "സമർപ്പണം പരാജയപ്പെട്ടു",
        isEnglish
          ? "Could not submit your suggestion. Please check your connection and try again."
          : "നിർദ്ദേശം സമർപ്പിക്കാൻ കഴിഞ്ഞില്ല. ദയവായി കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setWord("");
    setMeaning("");
    setRoot("");
    setEtymology("");
    setCulturalNote("");
    setPhoneticTranscription("");
    setGender("");
    setSynonymsList([]);
    setAntonymsList([]);
    setDialectsList([]);
    setProverbsList([]);
    setCustomLanguages([]);
    setContributorName("");
    setContributorEmail("");
    setDeclaration1(false);
    setDeclaration2(false);
    setReceiveEmails(false);
    setShowMoreFields(false);
    setSelectedLanguage(null);
  };

  // ==============================================================
  // TOP BRANDED NAVIGATION HEADER (Identical across all 3 panels)
  // ==============================================================
  const renderHeader = (onBack: () => void) => (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.circleBackButton}
        activeOpacity={0.7}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={20} color="#0F172A" />
      </TouchableOpacity>

      {/* Centered App Branding Lockup */}
      <View style={styles.headerBranding}>
        <View style={styles.headerEmblemWrapper}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.headerEmblem}
            contentFit="contain"
          />
        </View>
        <View style={styles.headerBrandCol}>
          <Text style={styles.headerBrandTitle}>ഭാഷാമിത്രം-II</Text>
          <View style={styles.headerLeafDivider}>
            <View style={styles.headerDividerLine} />
            <MaterialCommunityIcons
              name="leaf"
              size={11}
              color="#16A34A"
              style={styles.headerDividerLeaf}
            />
          </View>
          <Text style={styles.headerBrandSubtitle}>
            MALAYALAM ENGLISH BILINGUAL DICTIONARY
          </Text>
          <Text style={styles.headerBrandTagline}>Words Build Bridges</Text>
        </View>
      </View>

      {/* Right spacer for symmetrical centering */}
      <View style={{ width: 40 }} />
    </View>
  );

  // ==============================================================
  // 1. LANGUAGE SELECTION SCREEN (Panel 3 in Reference Image)
  // ==============================================================
  if (!selectedLanguage) {
    return (
      <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
        <StatusBar style="dark" />
        <FloatingLettersBackground />

        {/* Top Header */}
        {renderHeader(() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        })}

        {/* Center Content */}
        <View style={styles.selectionBody}>
          {/* Stylized Book Graphic */}
          <View style={styles.bookIllustrationGlow}>
            <Image
              source={require("../../assets/images/suggest_book.png")}
              style={styles.bookIllustration}
              contentFit="contain"
            />
          </View>

          {/* Pill Badge */}
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>ഭാഷാമിത്രം II</Text>
          </View>

          {/* Welcome Title & Subtitle */}
          <Text style={[styles.selectionTitle, isTablet && { fontSize: 24 }]}>
            പദ നിർദ്ദേശത്തിലേക്ക് സ്വാഗതം
          </Text>
          <Text style={[styles.selectionSubtitle, isTablet && { fontSize: 15, maxWidth: 380 }]}>
            {"നിഘണ്ടു ചേർക്കാൻ ആഗ്രഹിക്കുന്ന വാക്കിന്റെ\nഭാഷ തിരഞ്ഞെടുക്കുക."}
          </Text>

          {/* Card 1: Malayalam Word */}
          <TouchableOpacity
            style={styles.selectionCard}
            onPress={() => setSelectedLanguage("malayalam")}
            activeOpacity={0.8}
          >
            <View style={[styles.langBadge, { backgroundColor: "#FEE2E2" }]}>
              <Text style={[styles.langBadgeText, { color: "#EF4444" }]}>അ</Text>
            </View>
            <View style={styles.selectionCardTextCol}>
              <Text style={styles.selectionCardTitle}>
                മലയാളം പദം (Malayalam Word)
              </Text>
              <Text style={styles.selectionCardSub}>
                മലയാളം വാക്കിന്റെ നിർദ്ദേശ ഫോമിൽ നൽകുക.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2563EB" />
          </TouchableOpacity>

          {/* Card 2: English Word */}
          <TouchableOpacity
            style={styles.selectionCard}
            onPress={() => setSelectedLanguage("english")}
            activeOpacity={0.8}
          >
            <View style={[styles.langBadge, { backgroundColor: "#DBEAFE" }]}>
              <Text style={[styles.langBadgeText, { color: "#2563EB" }]}>A</Text>
            </View>
            <View style={styles.selectionCardTextCol}>
              <Text style={styles.selectionCardTitle}>
                ഇംഗ്ലീഷ് പദം (English Word)
              </Text>
              <Text style={styles.selectionCardSub}>
                English language suggestion form
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==============================================================
  // 2. SUGGESTION FORMS (Panels 1 & 2 in Reference Image)
  // ==============================================================
  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <FloatingLettersBackground />

      {/* Top Header */}
      {renderHeader(() => setSelectedLanguage(null))}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ===================== CARD 1: SECTION 1: BASIC DETAILS ===================== */}
          <View style={styles.formCard}>
            {/* Card Header */}
            <View style={styles.cardHeaderRow}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#0F766E"
                style={styles.cardHeaderIcon}
              />
              <Text style={styles.cardHeaderTitle}>
                {isEnglish
                  ? "Section 1: Basic Details"
                  : "വിഭാഗം 1: അടിസ്ഥാന വിഭാഗങ്ങൾ (Basic Details)"}
              </Text>
            </View>

            {/* Amber Instructions Box */}
            <View style={styles.instructionsBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#D97706"
                style={styles.instructionsIcon}
              />
              <View style={styles.instructionsTextCol}>
                <Text style={styles.instructionsTitle}>
                  {isEnglish ? "Instructions:" : "നിർദ്ദേശങ്ങൾ (Instructions):"}
                </Text>
                <Text style={styles.instructionsBody}>
                  {isEnglish
                    ? "* Marked fields are mandatory. Others are optional."
                    : "* അടയാളപ്പെടുത്തിയ fieldകൾ നിർബന്ധമാണ്. മറ്റുള്ളവ ഐച്ഛികമായാണ്."}
                </Text>
              </View>
            </View>

            {/* Field: Word */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isEnglish ? "Word " : "വാക്ക് (Word) "}
                <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  isEnglish
                    ? "Enter English word (alphabets only)"
                    : "മലയാളം വാക്ക് നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                }
                placeholderTextColor="#94A3B8"
                value={word}
                onChangeText={(t) => setWord(cleanInputByLang(t))}
              />
            </View>

            {/* Field: Meaning */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isEnglish ? "Meaning " : "അർത്ഥം (Meaning) "}
                <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                placeholder={
                  isEnglish
                    ? "Enter meaning (alphabets only)"
                    : "വാക്കിന്റെ അർത്ഥം നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                }
                placeholderTextColor="#94A3B8"
                value={meaning}
                onChangeText={(t) => setMeaning(cleanInputByLang(t))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Collapsible "+ Add More Details" Button */}
            <TouchableOpacity
              style={styles.toggleMoreDetailsBtn}
              onPress={() => setShowMoreFields(!showMoreFields)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={showMoreFields ? "remove-circle" : "add-circle"}
                size={20}
                color="#0284C7"
              />
              <Text style={styles.toggleMoreDetailsText}>
                {showMoreFields
                  ? (isEnglish
                      ? "- Hide Extra Details"
                      : "- വിവരങ്ങൾ ചുരുക്കുക (Hide More Details)")
                  : (isEnglish
                      ? "+ Add More Details (Root, Synonyms, etc.)"
                      : "+ കൂടുതൽ വിവരങ്ങൾ ചേർക്കുക (Add More Details)")}
              </Text>
            </TouchableOpacity>

            {/* ===================== EXPANDABLE ADVANCED FIELDS ===================== */}
            {showMoreFields && (
              <View style={styles.advancedFieldsContainer}>
                {/* Root Word */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Root Word" : "ധാതു (Root Word)"}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      isEnglish
                        ? "Enter root word (alphabets only)"
                        : "ധാതു നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                    }
                    placeholderTextColor="#94A3B8"
                    value={root}
                    onChangeText={(t) => setRoot(cleanInputByLang(t))}
                  />
                </View>

                {/* Etymology */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Etymology" : "വാക്കിന്റെ ഉത്ഭവം (Etymology)"}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      isEnglish
                        ? "Enter etymology (alphabets only)"
                        : "ഉത്ഭവം നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                    }
                    placeholderTextColor="#94A3B8"
                    value={etymology}
                    onChangeText={(t) => setEtymology(cleanInputByLang(t))}
                  />
                </View>

                {/* Cultural Note */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Cultural Note" : "സാംസ്കാരിക കുറിപ്പ് (Cultural Note)"}
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    placeholder={
                      isEnglish
                        ? "Enter cultural significance (alphabets only)"
                        : "സാംസ്കാരിക പ്രാധാന്യം നൽകുക"
                    }
                    placeholderTextColor="#94A3B8"
                    value={culturalNote}
                    onChangeText={(t) => setCulturalNote(cleanInputByLang(t))}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                {/* Phonetic Transcription */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Phonetic Transcription" : "ഉച്ചാരണ രീതി (Phonetic Transcription)"}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      isEnglish
                        ? "Phonetic transcription (alphabets only)"
                        : "ഉച്ചാരണ രീതി (അക്ഷരങ്ങൾ മാത്രം)"
                    }
                    placeholderTextColor="#94A3B8"
                    value={phoneticTranscription}
                    onChangeText={(t) => setPhoneticTranscription(cleanInputByLang(t))}
                  />
                </View>

                {/* Gender */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Gender" : "ലിംഗം (Gender)"}
                  </Text>
                  <View style={styles.genderRow}>
                    {(isEnglish
                      ? [
                          { label: "Masculine", value: "പുല്ലിംഗം" },
                          { label: "Feminine", value: "സ്ത്രീലിംഗം" },
                          { label: "Neuter", value: "നപുംസകലിംഗം" },
                        ]
                      : [
                          { label: "പുല്ലിംഗം", value: "പുല്ലിംഗം" },
                          { label: "സ്ത്രീലിംഗം", value: "സ്ത്രീലിംഗം" },
                          { label: "നപുംസകലിംഗം", value: "നപുംസകലിംഗം" },
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

                {/* Synonyms */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Synonyms" : "പര്യായപദങ്ങൾ (Synonyms)"}
                  </Text>
                  <View style={styles.tagInputRow}>
                    <TextInput
                      style={styles.tagTextInput}
                      placeholder={
                        isEnglish
                          ? "Enter synonym (alphabets only)"
                          : "പര്യായപദം നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                      }
                      placeholderTextColor="#94A3B8"
                      value={synonymInput}
                      onChangeText={(t) => setSynonymInput(cleanInputByLang(t))}
                    />
                    <TouchableOpacity
                      style={styles.addTagBtn}
                      onPress={() =>
                        addTag(synonymsList, setSynonymsList, synonymInput, setSynonymInput)
                      }
                    >
                      <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                    </TouchableOpacity>
                  </View>
                  {synonymsList.length > 0 && (
                    <View style={styles.tagWrap}>
                      {synonymsList.map((item, idx) => (
                        <View key={idx} style={styles.tagPill}>
                          <Text style={styles.tagPillText}>{item}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              removeTag(synonymsList, setSynonymsList, item)
                            }
                          >
                            <Ionicons name="close" size={14} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Antonyms */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Antonyms" : "വിപരീതപദങ്ങൾ (Antonyms)"}
                  </Text>
                  <View style={styles.tagInputRow}>
                    <TextInput
                      style={styles.tagTextInput}
                      placeholder={
                        isEnglish
                          ? "Enter antonym (alphabets only)"
                          : "വിപരീതപദം നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                      }
                      placeholderTextColor="#94A3B8"
                      value={antonymInput}
                      onChangeText={(t) => setAntonymInput(cleanInputByLang(t))}
                    />
                    <TouchableOpacity
                      style={styles.addTagBtn}
                      onPress={() =>
                        addTag(antonymsList, setAntonymsList, antonymInput, setAntonymInput)
                      }
                    >
                      <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                    </TouchableOpacity>
                  </View>
                  {antonymsList.length > 0 && (
                    <View style={styles.tagWrap}>
                      {antonymsList.map((item, idx) => (
                        <View key={idx} style={styles.tagPill}>
                          <Text style={styles.tagPillText}>{item}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              removeTag(antonymsList, setAntonymsList, item)
                            }
                          >
                            <Ionicons name="close" size={14} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Dialects */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Dialects" : "പ്രാദേശിക പ്രയോഗങ്ങൾ (Dialects)"}
                  </Text>
                  <View style={styles.tagInputRow}>
                    <TextInput
                      style={styles.tagTextInput}
                      placeholder={
                        isEnglish
                          ? "Enter regional usage (alphabets only)"
                          : "പ്രാദേശിക രൂപങ്ങൾ നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                      }
                      placeholderTextColor="#94A3B8"
                      value={dialectInput}
                      onChangeText={(t) => setDialectInput(cleanInputByLang(t))}
                    />
                    <TouchableOpacity
                      style={styles.addTagBtn}
                      onPress={() =>
                        addTag(dialectsList, setDialectsList, dialectInput, setDialectInput)
                      }
                    >
                      <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                    </TouchableOpacity>
                  </View>
                  {dialectsList.length > 0 && (
                    <View style={styles.tagWrap}>
                      {dialectsList.map((item, idx) => (
                        <View key={idx} style={styles.tagPill}>
                          <Text style={styles.tagPillText}>{item}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              removeTag(dialectsList, setDialectsList, item)
                            }
                          >
                            <Ionicons name="close" size={14} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Proverbs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {isEnglish ? "Proverbs" : "പഴഞ്ചൊല്ലുകൾ (Proverbs)"}
                  </Text>
                  <View style={styles.tagInputRow}>
                    <TextInput
                      style={styles.tagTextInput}
                      placeholder={
                        isEnglish
                          ? "Enter proverb (alphabets only)"
                          : "പഴഞ്ചൊല്ലുകൾ നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                      }
                      placeholderTextColor="#94A3B8"
                      value={proverbInput}
                      onChangeText={(t) => setProverbInput(cleanInputByLang(t))}
                    />
                    <TouchableOpacity
                      style={styles.addTagBtn}
                      onPress={() =>
                        addTag(proverbsList, setProverbsList, proverbInput, setProverbInput)
                      }
                    >
                      <Text style={styles.addTagBtnText}>{isEnglish ? "Add" : "ചേർക്കുക"}</Text>
                    </TouchableOpacity>
                  </View>
                  {proverbsList.length > 0 && (
                    <View style={styles.tagWrap}>
                      {proverbsList.map((item, idx) => (
                        <View key={idx} style={styles.tagPill}>
                          <Text style={styles.tagPillText}>{item}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              removeTag(proverbsList, setProverbsList, item)
                            }
                          >
                            <Ionicons name="close" size={14} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* ===================== CARD 2: SECTION 3: CONTRIBUTOR DETAILS ===================== */}
          <View style={styles.formCard}>
            {/* Card Header */}
            <View style={styles.cardHeaderRow}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#0F766E"
                style={styles.cardHeaderIcon}
              />
              <Text style={styles.cardHeaderTitle}>
                {isEnglish
                  ? "Section 3: Contributor Details & Submission"
                  : "വിഭാഗം 3: കോൺട്രിബ്യൂട്ടർ വിവരങ്ങളും സമർപ്പണവും"}
              </Text>
            </View>

            {/* Field: Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isEnglish ? "Name " : "പേര് (Name) "}
                <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  isEnglish
                    ? "Enter your name (alphabets only)"
                    : "നിങ്ങളുടെ പേര് നൽകുക (അക്ഷരങ്ങൾ മാത്രം)"
                }
                placeholderTextColor="#94A3B8"
                value={contributorName}
                onChangeText={(t) => setContributorName(cleanContributorName(t))}
              />
            </View>

            {/* Field: Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {isEnglish ? "Email " : "ഇമെയിൽ (Email) "}
                <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  isEnglish
                    ? "Enter authentic email (e.g., name@gmail.com)"
                    : "യഥാർത്ഥ ഇമെയിൽ വിലാസം നൽകുക"
                }
                placeholderTextColor="#94A3B8"
                value={contributorEmail}
                onChangeText={(t) => setContributorEmail(cleanEmailInput(t))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Checkbox 1 */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDeclaration1(!declaration1)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  declaration1 && styles.checkboxSquareChecked,
                ]}
              >
                {declaration1 && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {isEnglish
                  ? "I certify that the information submitted by me is completely accurate and factual."
                  : "ഞാൻ നൽകിയ ഈ വിവരങ്ങൾ പൂർണ്ണമായും ശരിയാണെന്ന് സാക്ഷ്യപ്പെടുത്തുന്നു."}
              </Text>
            </TouchableOpacity>

            {/* Checkbox 2 */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDeclaration2(!declaration2)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  declaration2 && styles.checkboxSquareChecked,
                ]}
              >
                {declaration2 && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {isEnglish
                  ? "I accept C-DIT terms and conditions for suggesting words to the dictionary."
                  : "നിഘണ്ടുവിലേക്ക് പദങ്ങൾ ചേർക്കുന്നതിനുള്ള C-DIT നിയമങ്ങളും വ്യവസ്ഥകളും അംഗീകരിക്കുന്നു."}
              </Text>
            </TouchableOpacity>

            {/* Checkbox 3 */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setReceiveEmails(!receiveEmails)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  receiveEmails && styles.checkboxSquareChecked,
                ]}
              >
                {receiveEmails && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                {isEnglish
                  ? "I agree to receive emails/updates from R&D C-DIT."
                  : "R&D C-DIT-യിൽ നിന്നുള്ള ഇമെയിലുകളും അപ്ഡേറ്റുകളും സ്വീകരിക്കാൻ ഞാൻ സമ്മതിക്കുന്നു."}
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={19}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.submitBtnText}>
                    {isEnglish ? "Submit" : "സമർപ്പിക്കുക"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ===================== ACKNOWLEDGEMENT MODAL ===================== */}
      <Modal
        visible={showAcknowledgement}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowAcknowledgement(false);
          handleResetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalSuccessIconBg}>
              <Ionicons name="checkmark-circle" size={54} color="#10B981" />
            </View>

            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>ഭാഷാമിത്രം II</Text>
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

              {meaning ? (
                <>
                  <Text style={[styles.modalDetailsLabel, { marginTop: 8 }]}>
                    {isEnglish ? "Meaning:" : "അർത്ഥം:"}
                  </Text>
                  <Text style={styles.modalDetailsValue}>{meaning}</Text>
                </>
              ) : null}

              <Text style={[styles.modalDetailsLabel, { marginTop: 8 }]}>
                {isEnglish ? "Contributor Name:" : "സംഭാവന ചെയ്തയാൾ:"}
              </Text>
              <Text style={styles.modalDetailsValue}>{contributorName}</Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowAcknowledgement(false);
                handleResetForm();
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
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  /* ===================== TOP NAVIGATION HEADER ===================== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 4 : 8,
    paddingBottom: 8,
    zIndex: 10,
  },
  circleBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerBranding: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerEmblemWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    padding: 1.5,
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#0284C7",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerEmblem: {
    width: "100%",
    height: "100%",
  },
  headerBrandCol: {
    justifyContent: "center",
  },
  headerBrandTitle: {
    fontFamily: "NotoSansMalayalam",
    fontSize: 16,
    fontWeight: "800",
    color: "#0B3B60",
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  headerLeafDivider: {
    width: 95,
    height: 10,
    justifyContent: "center",
    marginVertical: 1,
    position: "relative",
  },
  headerDividerLine: {
    width: "100%",
    height: 1.2,
    backgroundColor: "#2DD4BF",
    borderRadius: 1,
  },
  headerDividerLeaf: {
    position: "absolute",
    right: 6,
    top: -3,
    transform: [{ rotate: "-20deg" }],
  },
  headerBrandSubtitle: {
    fontSize: 7.5,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.4,
  },
  headerBrandTagline: {
    fontSize: 8.5,
    fontStyle: "italic",
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 0.5,
  },

  /* ===================== LANGUAGE SELECTION SCREEN ===================== */
  selectionBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    zIndex: 10,
  },
  bookIllustrationGlow: {
    width: 175,
    height: 115,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  bookIllustration: {
    width: "100%",
    height: "100%",
  },
  pillBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
  },
  pillBadgeText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0369A1",
    fontFamily: "NotoSansMalayalam",
  },
  selectionTitle: {
    fontFamily: "NotoSansMalayalam",
    fontSize: 19.5,
    fontWeight: "800",
    color: "#0B3B60",
    textAlign: "center",
    marginBottom: 6,
  },
  selectionSubtitle: {
    fontFamily: "NotoSansMalayalam",
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
    maxWidth: 290,
  },
  selectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 7,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  langBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  langBadgeText: {
    fontSize: 19,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },
  selectionCardTextCol: {
    flex: 1,
    marginRight: 8,
  },
  selectionCardTitle: {
    fontFamily: "NotoSansMalayalam",
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  selectionCardSub: {
    fontFamily: "NotoSansMalayalam",
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    lineHeight: 16,
  },

  /* ===================== FORM CARDS & INPUTS ===================== */
  formScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    zIndex: 10,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    flex: 1,
  },
  instructionsBox: {
    backgroundColor: "#FEF9C3",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEF08A",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  instructionsIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  instructionsTextCol: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 2,
  },
  instructionsBody: {
    fontSize: 11,
    fontWeight: "500",
    color: "#B45309",
    fontFamily: "NotoSansMalayalam",
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: "#EF4444",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13.5,
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
  },
  textAreaInput: {
    minHeight: 76,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: "top",
  },
  toggleMoreDetailsBtn: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  toggleMoreDetailsText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0284C7",
    fontFamily: "NotoSansMalayalam",
    marginLeft: 6,
  },
  advancedFieldsContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  genderButtonSelected: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  genderButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    fontFamily: "NotoSansMalayalam",
  },
  genderButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  tagInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  tagTextInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13,
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
  },
  addTagBtn: {
    backgroundColor: "#0D9488",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addTagBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "NotoSansMalayalam",
  },

  /* Checkboxes */
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 6,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#64748B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
    backgroundColor: "#FFFFFF",
  },
  checkboxSquareChecked: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: "#334155",
    lineHeight: 18,
    fontFamily: "NotoSansMalayalam",
  },

  /* Submit Button */
  submitBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0D9488",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
  },

  /* ===================== SUCCESS MODAL ===================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
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
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalSuccessIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B3B60",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "NotoSansMalayalam",
  },
  modalDescription: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    fontFamily: "NotoSansMalayalam",
  },
  modalDetailsContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalDetailsLabel: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "600",
    fontFamily: "NotoSansMalayalam",
  },
  modalDetailsValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    marginTop: 2,
  },
  modalButton: {
    width: "100%",
    height: 46,
    backgroundColor: "#0D9488",
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "NotoSansMalayalam",
  },
});
