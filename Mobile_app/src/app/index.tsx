import SideMenu from "@/components/side-menu";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface MenuItem {
  id: string;
  label: string;
  subLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      id: "1",
      label: "ഇംഗ്ലീഷ് - മലയാളം",
      subLabel: "English ➔ Malayalam",
      icon: "language-outline",
      onPress: () => router.push("./english-malayalm"),
    },
    {
      id: "2",
      label: "മലയാളം - ഇംഗ്ലീഷ്",
      subLabel: "Malayalam ➔ English",
      icon: "swap-horizontal",
      onPress: () => router.push("./malayalam-english"),
    },
    {
      id: "3",
      label: "നാനാത്ഥ നിഘണ്ടു",
      subLabel: "Malayalam Synonyms",
      icon: "book-outline",
      onPress: () => router.push("./nanaarth"),
    },
    {
      id: "4",
      label: "സമീപകാല തിരച്ചിൽ",
      subLabel: "Recent Searches",
      icon: "time-outline",
      onPress: () => router.push("./savishesha_thirayal"),
    },
  ];

  const colors = {
    headerBg: "#0F1322",
    containerBg: "#090D16",
    cardBg: "#131926",
    cardBorder: "#222B3F",
    cardText: "#FFFFFF",
    accentBg: "#1B2335",
    accentText: "#00D2FF",
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.containerBg }]}
    >
      {Platform.OS === "android" && (
        <StatusBar backgroundColor={colors.headerBg} barStyle="light-content" />
      )}

      {/* Futuristic Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={24} color="#00D2FF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>ഭാഷാമിത്രം</Text>
          <View style={styles.systemStatusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SYSTEM SECURE • ONLINE</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => router.push("./savishesha_thirayal")}
        >
          <Ionicons name="search-outline" size={20} color="#00D2FF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Hero Area */}
        <View style={styles.heroSection}>
          <Text style={styles.heroGreeting}>നമസ്കാരം,</Text>
          <Text style={styles.heroSub}>Find meanings, definitions, and synonyms instantly</Text>
        </View>

        {/* Quick Search Shortcut Bar */}
        <TouchableOpacity 
          style={styles.searchBarShortcut}
          activeOpacity={0.85}
          onPress={() => router.push("./english-malayalm")}
        >
          <Ionicons name="search-outline" size={20} color="#8E9BB4" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>ഇവിടെ തിരയുക... Search words here...</Text>
          <View style={styles.searchBadge}>
            <Text style={styles.searchBadgeText}>EN/MAL</Text>
          </View>
        </TouchableOpacity>

        {/* Word of the Day Glassmorphic Card */}
        <View style={styles.wordOfTheDayCard}>
          <View style={styles.wotdHeader}>
            <Ionicons name="sparkles-outline" size={16} color="#00D2FF" />
            <Text style={styles.wotdLabel}>WORD OF THE DAY • ഇന്നത്തെ വാക്ക്</Text>
          </View>
          <Text style={styles.wotdWord}>പ്രതീക്ഷ (Pratheeksha)</Text>
          <Text style={styles.wotdMeaning}>
            noun • Hope, expectation, anticipation, optimism.
          </Text>
          <View style={styles.glowLine} />
        </View>

        {/* Grid Title */}
        <Text style={styles.sectionTitle}>DICTIONARY SERVICES</Text>

        {/* 2x2 Grid Menu */}
        <View style={styles.gridContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={item.onPress}
              style={[styles.gridCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.accentBg }]}>
                <Ionicons name={item.icon} size={22} color={colors.accentText} />
              </View>
              <Text style={[styles.cardText, { color: colors.cardText }]}>
                {item.label}
              </Text>
              <Text style={styles.cardSubText}>{item.subLabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DB Statistics Badge */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>DATABASE STATUS: SECURE CONNECTION</Text>
          <Text style={styles.statsCount}>150,000+ ENTRIES</Text>
        </View>
      </ScrollView>

      <SideMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: Platform.OS === "android" ? 70 : 80,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222B3F",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#1B2335",
    borderWidth: 1,
    borderColor: "rgba(0, 210, 255, 0.15)",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
    letterSpacing: 0.5,
  },
  systemStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00FF66",
    marginRight: 6,
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 9,
    color: "#8E9BB4",
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroGreeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "NotoSansMalayalam",
  },
  heroSub: {
    fontSize: 14,
    color: "#8E9BB4",
    marginTop: 6,
    lineHeight: 20,
  },
  searchBarShortcut: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131926",
    borderWidth: 1,
    borderColor: "#222B3F",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: "#8E9BB4",
    fontSize: 13,
  },
  searchBadge: {
    backgroundColor: "#1B2335",
    borderWidth: 1,
    borderColor: "rgba(0, 210, 255, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchBadgeText: {
    color: "#00D2FF",
    fontSize: 10,
    fontWeight: "800",
  },
  wordOfTheDayCard: {
    backgroundColor: "#0F1322",
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#222B3F",
    position: "relative",
    overflow: "hidden",
  },
  wotdHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  wotdLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00D2FF",
    marginLeft: 8,
    letterSpacing: 1,
  },
  wotdWord: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 6,
  },
  wotdMeaning: {
    fontSize: 13,
    color: "#8E9BB4",
    lineHeight: 18,
  },
  glowLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "#00D2FF",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8E9BB4",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    height: 130,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 210, 255, 0.15)",
    alignSelf: "flex-start",
  },
  cardText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginTop: 8,
  },
  cardSubText: {
    fontSize: 10,
    color: "#8E9BB4",
    marginTop: 2,
  },
  statsContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#222B3F",
  },
  statsText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8E9BB4",
    letterSpacing: 1,
  },
  statsCount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00D2FF",
    marginTop: 4,
    letterSpacing: 1.5,
  },
});
