import SideMenu from "@/components/side-menu";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      id: "1",
      label: "ഇംഗ്ലീഷ് - മലയാളം നിഘണ്ടു",
      icon: "A->അ",
      onPress: () => router.push("./english-malayalm"),
    },
    {
      id: "2",
      label: "മലയാളം - ഇംഗ്ലീഷ് നിഘണ്ടു",
      icon: "അ->A",
      onPress: () => router.push("./malayalam-english"),
    },
    {
      id: "3",
      label: "മലയാളം നാനാത്ഥ നിഘണ്ടു",
      icon: "അ->അ",
      onPress: () => router.push("./nanaarth"),
    },
    {
      id: "4",
      label: "സമീപകാല തിരച്ചിലുകൾ",
      icon: "⟲",
      onPress: () => router.push("./savishesha_thirayal"),
    },
  ];

const colors = {
    headerBg: "#2B2C51",
    containerBg:  "#F9F6F1",
    cardBg: "#2B5BA8",
    cardText: "#FFFFFF",
    fabBg: "#16A697",
    textPrimary: isDark ? "#ffffff" : "#252425",
  };

  const handleMenuPress = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleSharePress = () => {
    console.log("Share pressed");
  };

  const menuOptions = [
    {
      id: "1",
      label: "Info",
      icon: "ℹ️",
      onPress: () => {
        console.log("Info pressed");
        setDrawerVisible(false);
      },
    },
    {
      id: "2",
      label: "Share",
      icon: "↗",
      onPress: () => {
        console.log("Share pressed");
        setDrawerVisible(false);
      },
    },
    {
      id: "3",
      label: "Suggest a word",
      icon: "▶",
      onPress: () => {
        console.log("Suggest pressed");
        setDrawerVisible(false);
      },
    },
    {
      id: "4",
      label: "Rate",
      icon: "⭐",
      onPress: () => {
        console.log("Rate pressed");
        setDrawerVisible(false);
      },
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.containerBg }]}
    >
      {Platform.OS === "android" && (
        <StatusBar backgroundColor={colors.headerBg} barStyle="light-content" />
      )}

      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={styles.headerButton}
        >
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>ഭാഷാമിത്രം</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.shareIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={item.onPress}
            style={[styles.card, { backgroundColor: colors.cardBg }]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <Text style={[styles.cardText, { color: colors.cardText }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
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
    height: Platform.OS === "android" ? 70 : 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  shareIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 18,
  },
  card: {
    marginTop: 7,
    height: 140,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 3px rgba(0, 0, 0, 0.18)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.18,
        shadowRadius: 3,
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  iconText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
    fontFamily: "NotoSansMalayalam",
  },
});
