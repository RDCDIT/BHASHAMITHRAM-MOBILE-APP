import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InfoSupport() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/"); // or router.replace("/home")
              }
            }}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Info / Support</Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Card */}
        <View style={styles.logoCard}>
          <Image
            source={require("../../assets/images/cdit_logo.png")}
            style={styles.logo}
            contentFit="contain"
          />

          <Text style={styles.title}>ഭാഷാമിത്രം II</Text>

          <Text style={styles.subtitle}>
            Malayalam Dictionary Application
          </Text>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>

          <Text style={styles.cardText}>
            ഭാഷാമിത്രം II കേരള സർക്കാർ സ്ഥാപനമായ സെന്റർ ഫോർ ഡെവലപ്മെന്റ് ഓഫ് ഇമേജിംഗ് ടെക്നോളജി (C-DIT)-യുടെ ഗവേഷണ-വികസന (R&D) വിഭാഗം വികസിപ്പിച്ച സമഗ്രമായ ദ്വിഭാഷാ നിഘണ്ടു ആപ്ലിക്കേഷനാണ്. മലയാളം–മലയാളം നിഘണ്ടു, മലയാളം–ഇംഗ്ലീഷ് നിഘണ്ടു, ഇംഗ്ലീഷ്–മലയാളം നിഘണ്ടു, മലയാളം നാനാർത്ഥ നിഘണ്ടു (Thesaurus) എന്നിവയെ ഒരൊറ്റ വേദിയിൽ ലഭ്യമാക്കുന്ന ഈ ആപ്ലിക്കേഷൻ, വിദ്യാർത്ഥികൾക്കും അധ്യാപകർക്കും ഗവേഷകർക്കും മലയാളഭാഷയെ സ്നേഹിക്കുന്ന ഏവർക്കും വിശ്വസനീയമായ ഒരു ഭാഷാ സഹായിയാണ്.
          </Text>
        </View>

        {/* Version */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Version</Text>
          <Text style={styles.cardValue}>2.0.0</Text>
        </View>

        {/* Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL("mailto:research@cdit.org")}
          >
            <Ionicons name="mail-outline" size={22} color="#2B2C51" />
            <Text style={styles.rowText}>research@cdit.org</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.row}
            onPress={() => Linking.openURL("https://cdit.kerala.gov.in/")}
          >
            <Ionicons name="globe-outline" size={22} color="#2B2C51" />
            <Text style={styles.rowText}>https://cdit.kerala.gov.in/</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 R&D, Centre for Development of Imaging Technology (C-DIT)
          </Text>
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
    height: 90,
    backgroundColor: "#2B2C51",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  logoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },

  logo: {
    width: 90,
    height: 90,
    marginBottom: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECE7DF",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2B2C51",
    marginBottom: 12,
  },

  cardText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },

  cardValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  rowText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#374151",
  },

  footer: {
    marginTop: 12,
    alignItems: "center",
    paddingBottom: 20,
  },

  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});