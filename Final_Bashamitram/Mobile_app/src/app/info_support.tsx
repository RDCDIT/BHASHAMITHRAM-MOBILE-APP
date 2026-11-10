import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingLettersBackground from "../components/FloatingLettersBackground";

export default function InfoSupport() {
  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Floating Animated Malayalam letters & waves */}
      <FloatingLettersBackground />

      {/* ===================== TOP NAVIGATION HEADER ===================== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          style={styles.circleBackButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#0D5C75" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Info / Support</Text>

        <View style={styles.headerRightIcon}>
          <MaterialCommunityIcons
            name="leaf"
            size={24}
            color="#16A34A"
            style={{ transform: [{ rotate: "-15deg" }] }}
          />
        </View>
      </View>

      {/* ===================== MAIN CONTENT ===================== */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ===================== BRANDED HEADER CARD ===================== */}
        <View style={styles.brandCard}>
          {/* Subtle translucent floating Malayalam letters inside header card */}
          <Text style={styles.cardFaintLetter1}>അ</Text>
          <Text style={styles.cardFaintLetter2}>ഉ</Text>
          <Text style={styles.cardFaintLetter3}>മ</Text>
          <Text style={styles.cardFaintLetter4}>ങ</Text>
          <Text style={styles.cardFaintLetter5}>ഹ</Text>

          {/* Stylized leaf cluster decoration on bottom-right of brand card */}
          <View style={styles.cardLeafCluster} pointerEvents="none">
            <MaterialCommunityIcons
              name="leaf"
              size={48}
              color="#2DD4BF"
              style={{ transform: [{ rotate: "-35deg" }], opacity: 0.8 }}
            />
            <MaterialCommunityIcons
              name="leaf"
              size={32}
              color="#14B8A6"
              style={{
                position: "absolute",
                right: 6,
                bottom: 10,
                transform: [{ rotate: "15deg" }],
                opacity: 0.7,
              }}
            />
          </View>

          <View style={styles.brandRow}>
            {/* Left: Circular App Logo Emblem */}
            <View style={styles.logoBadge}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>

            {/* Right: Info Column */}
            <View style={styles.brandCol}>
              {/* C-DIT Logo */}
              <Image
                source={require("../../assets/images/cdit_logo.png")}
                style={styles.cditLogo}
                contentFit="contain"
              />

              {/* Title + Botanical Leaf */}
              <View style={styles.titleRow}>
                <Text style={styles.brandTitle}>ഭാഷാമിത്രം-II</Text>
                <MaterialCommunityIcons
                  name="leaf"
                  size={16}
                  color="#22C55E"
                  style={{ marginLeft: 6, transform: [{ rotate: "25deg" }] }}
                />
              </View>

              {/* Subtitle */}
              <Text style={styles.brandSubtitle}>
                MALAYALAM ENGLISH BILINGUAL DICTIONARY
              </Text>

              {/* Tagline */}
              <Text style={styles.brandTagline}>Words Build Bridges</Text>
            </View>
          </View>
        </View>

        {/* ===================== ABOUT CARD ===================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="information-circle-outline" size={24} color="#0D5C75" />
            <Text style={styles.cardTitle}>About</Text>
          </View>

          <Text style={styles.aboutText}>
            ഭാഷാമിത്രം II കേരള സർക്കാരിന്റെ സ്വയംഭരണ സ്ഥാപനമായ സെന്റർ ഫോർ ഡെവലപ്‌മെന്റ് ഓഫ് ഇമേജിംഗ് ടെക്നോളജി (C-DIT)-യുടെ ഗവേഷണ വികസന (R&D) വിഭാഗം വികസിപ്പിച്ച മലയാളം–ഇംഗ്ലീഷ് നിഘണ്ടു ആപ്ലിക്കേഷനാണ്. മലയാളം–മലയാളം പദമിത്രം, മലയാളം–ഇംഗ്ലീഷ് ഭാഷാസേതു, ഇംഗ്ലീഷ്–മലയാളം പദസേതു, മലയാളം നാനാർത്ഥ വാക്കറിവ് (Thesaurus) എന്നിവയെ ഒരൊറ്റ പ്ലാറ്റ്‌ഫോമിൽ ലഭ്യമാക്കുന്ന ഈ ആപ്ലിക്കേഷൻ, വിദ്യാർത്ഥികൾക്കും അധ്യാപകർക്കും ഗവേഷകർക്കും മലയാളഭാഷയെ സ്നേഹിക്കുന്ന എല്ലാവർക്കും വിശ്വാസനീയമായ ഒരു ഭാഷാ സഹായിയാണ്.
          </Text>
        </View>

        {/* ===================== VERSION CARD ===================== */}
        <View style={styles.card}>
          <View style={styles.versionRow}>
            <View>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="cube-outline" size={20} color="#0D5C75" />
                <Text style={styles.cardTitle}>Version</Text>
              </View>
              <Text style={styles.versionValue}>2.0.0</Text>
            </View>

            <View style={styles.versionGearContainer}>
              <Ionicons
                name="settings-outline"
                size={42}
                color="#2DD4BF"
                style={{ opacity: 0.55 }}
              />
            </View>
          </View>
        </View>

        {/* ===================== SUPPORT CARD ===================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="headset-outline" size={22} color="#0D5C75" />
            <Text style={styles.cardTitle}>Support</Text>
          </View>

          {/* Email row */}
          <TouchableOpacity
            style={styles.supportBox}
            activeOpacity={0.7}
            onPress={() => Linking.openURL("mailto:cditresearch@gmail.com")}
          >
            <View style={styles.supportIconBadge}>
              <Ionicons name="mail-outline" size={18} color="#0D9488" />
            </View>
            <Text style={styles.supportText}>cditresearch@gmail.com</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Website row */}
          <TouchableOpacity
            style={styles.supportBox}
            activeOpacity={0.7}
            onPress={() => Linking.openURL("https://cdit.kerala.gov.in/")}
          >
            <View style={styles.supportIconBadge}>
              <Ionicons name="globe-outline" size={18} color="#0D9488" />
            </View>
            <Text style={styles.supportText}>https://cdit.kerala.gov.in/</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* ===================== INSTITUTIONAL FOOTER ===================== */}
        <View style={styles.footerRow}>
          <Image
            source={require("../../assets/images/cdit_logo.png")}
            style={styles.footerCditLogo}
            contentFit="contain"
          />
          <View style={styles.footerCol}>
            <Text style={styles.footerDept}>
              CENTRE FOR DEVELOPMENT OF IMAGING TECHNOLOGY
            </Text>
            <Text style={styles.footerGovt}>Government of Kerala</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    zIndex: 10,
  },

  circleBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D5C75",
    letterSpacing: 0.2,
  },

  headerRightIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
    zIndex: 5,
  },

  brandCard: {
    backgroundColor: "#E6F7F5",
    borderRadius: 24,
    padding: 16,
    paddingVertical: 18,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    elevation: 2,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  cardFaintLetter1: {
    position: "absolute",
    top: 60,
    left: 12,
    fontSize: 22,
    color: "#99F6E4",
    opacity: 0.5,
    fontFamily: "NotoSansMalayalam",
  },
  cardFaintLetter2: {
    position: "absolute",
    bottom: 8,
    left: 45,
    fontSize: 20,
    color: "#99F6E4",
    opacity: 0.55,
    fontFamily: "NotoSansMalayalam",
  },
  cardFaintLetter3: {
    position: "absolute",
    bottom: 6,
    left: 105,
    fontSize: 20,
    color: "#99F6E4",
    opacity: 0.55,
    fontFamily: "NotoSansMalayalam",
  },
  cardFaintLetter4: {
    position: "absolute",
    bottom: 18,
    right: 68,
    fontSize: 18,
    color: "#99F6E4",
    opacity: 0.5,
    fontFamily: "NotoSansMalayalam",
  },
  cardFaintLetter5: {
    position: "absolute",
    bottom: 6,
    right: 48,
    fontSize: 18,
    color: "#99F6E4",
    opacity: 0.5,
    fontFamily: "NotoSansMalayalam",
  },
  cardLeafCluster: {
    position: "absolute",
    right: 4,
    bottom: -6,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoBadge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#A7F3D0",
    elevation: 4,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },

  brandCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },

  cditLogo: {
    width: 70,
    height: 22,
    marginBottom: 4,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#084E63",
    fontFamily: "NotoSansMalayalam",
  },

  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.4,
    marginTop: 2,
  },

  brandTagline: {
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
    marginLeft: 8,
  },

  aboutText: {
    fontSize: 13.5,
    lineHeight: 22,
    color: "#334155",
    fontFamily: "NotoSansMalayalam",
    marginTop: 4,
  },

  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  versionValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
    marginLeft: 28,
  },

  versionGearContainer: {
    marginRight: 6,
  },

  supportBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },

  supportIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },

  supportText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13.5,
    fontWeight: "600",
    color: "#0F172A",
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },

  footerCditLogo: {
    width: 44,
    height: 18,
    marginRight: 8,
  },

  footerCol: {
    justifyContent: "center",
  },

  footerDept: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.3,
  },

  footerGovt: {
    fontSize: 8.5,
    color: "#64748B",
    marginTop: 1,
  },
});