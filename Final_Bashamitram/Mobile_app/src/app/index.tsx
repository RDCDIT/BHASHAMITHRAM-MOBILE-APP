/**
 * @file index.tsx
 * @description Application route screen component for index.
 */

import SideMenu from "../components/side-menu";
import AnimatedCard from "../components/AnimatedCard";
import FloatingLettersBackground from "../components/FloatingLettersBackground";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ImageSourcePropType } from "react-native";

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  badgeImage?: ImageSourcePropType;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  onPress: () => void;
}

/**
 * HomeScreen aggregates primary navigation paths, quick-access dictionary cards,
 * recent lookup histories, and drawer elements.
 * 
 * @returns {React.JSX.Element} Main dashboard screen layout.
 */
export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const router = useRouter();
  const [scrollY] = useState(() => new Animated.Value(0));

  const menuItems: MenuItem[] = [
    {
      id: "3",
      title: "ഇംഗ്ലീഷ് - മലയാളം നിഘണ്ടു",
      subtitle: "നിഘണ്ടു",
      badgeImage: require("../../assets/Icons/ME.gif"),
      color: "#2B2C51",
      bgColor: "#F5F3FF",
      onPress: () => router.push("./english_malayalam"),
    },

    {
      id: "2",
      title: "മലയാളം - ഇംഗ്ലീഷ് നിഘണ്ടു",
      subtitle: "നിഘണ്ടു",
      badgeImage: require("../../assets/Icons/ME.gif"),
      color: "#2B2C51",
      bgColor: "#F5F3FF",
      onPress: () => router.push("./malayalam_english"),
    },

    {
      id: "4",
      title: "മലയാളം നാനാർത്ഥ നിഘണ്ടു",
      subtitle: "നിഘണ്ടു",
      badgeImage: require("../../assets/Icons/MT.gif"),
      color: "#2B2C51",
      bgColor: "#FDF2F8",
      onPress: () => router.push("./malayalam_synonym"),
    },

    {
      id: "1",
      title: "മലയാളം - മലയാളം നിഘണ്ടു",
      subtitle: "നിഘണ്ടു",
      badgeImage: require("../../assets/Icons/MM.gif"),
      color: "#2B2C51",
      bgColor: "#F5F3FF",
      onPress: () => router.push("./malayalam-malayalam"),
    },

    {
      id: "5",
      title: "സമീപകാല തിരയലുകൾ",
      subtitle: "തിരച്ചിലുകൾ",
      badgeImage: require("../../assets/Icons/savishesha_thirayal.gif"),
      color: "#2B2C51",
      bgColor: "#F3F4F6",
      onPress: () => router.push("./savishesha_thirayal"),
    },
  ];

  const colors = {
    headerBg: "#2B2C51",
    containerBg: "#F9F6F1",
    cardText: "#1F2937",
    subtitleText: "#6B7280",
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.headerBg }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar backgroundColor={colors.headerBg} barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../assets/images/cdit_logo.png")} // <-- replace with your logo
            style={styles.headerLogo}
            contentFit="contain"
          />

          <Text style={styles.headerTitle}>ഭാഷാമിത്രം II</Text>

          <Text style={styles.headerSubtitle}>
            Centre for Development of Imaging Technology {"\n"}(C-DIT)
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("./settings")}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Scrollable content area with floating background */}
      <View style={{ flex: 1, backgroundColor: colors.containerBg }}>
        {/* Floating Malayalam letters background layer */}
        <FloatingLettersBackground />

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          {/* Menu Items */}
          {menuItems.map((item, index) => (
            <AnimatedCard key={item.id} index={index} scrollY={scrollY}>
              <View style={styles.card}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={item.onPress}
                  style={styles.cardTouchTarget}
                >
                  {/* Badge Indicator */}
                  <View
                    style={[
                      styles.badgeContainer,
                      { borderColor: item.color + "30", backgroundColor: item.bgColor },
                    ]}
                  >
                    {item.badgeImage ? (
                      <Image
                        source={item.badgeImage}
                        style={styles.badgeImage}
                        contentFit="contain"
                        transition={150}
                      />
                    ) : (
                      <Ionicons
                        name={item.badgeIcon as any}
                        size={26}
                        color={item.color}
                      />
                    )}
                  </View>

                  {/* Label and Info */}
                  <View style={styles.textContainer}>
                    <Text style={[styles.cardTitle, { color: colors.cardText }]}>
                      {item.title}
                    </Text>
                  </View>

                  {/* Right Action Chevron */}
                  <View
                    style={[
                      styles.chevronContainer,
                      { backgroundColor: item.bgColor },
                    ]}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={item.color}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          ))}
        </Animated.ScrollView>
      </View>



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
  /*header: {
    height: Platform.OS === "android" ? 65 : 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },*/
  header: {
    height: Platform.OS === "android" ? 155 : 170,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    textAlign: "center",
    color: "#13bca9ff",
    fontSize: 30,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    height: 125,
    marginTop: 8,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      android: {
        // elevation bleeds through transparent backgrounds on Android — use border instead
        backgroundColor: "rgba(255, 255, 255, 0.30)",
        borderColor: "rgba(43, 44, 81, 0.18)",
        elevation: 0,
      },
      ios: {
        backgroundColor: "rgba(255, 255, 255, 0.30)",
        borderColor: "rgba(255, 255, 255, 0.5)",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
      },
      web: {
        backgroundColor: "rgba(255, 255, 255, 0.30)",
        borderColor: "rgba(255, 255, 255, 0.5)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
      },
      default: {
        backgroundColor: "rgba(255, 255, 255, 0.30)",
        borderColor: "rgba(255, 255, 255, 0.5)",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
      },
    }),
  },
  cardTouchTarget: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: "100%",
    width: "100%",
  },
  badgeContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  badgeImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "NotoSansMalayalam",
    marginBottom: 2,
  },
  /*cardSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "NotoSansMalayalam",
  },*/
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  /*headerLogo: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },*/

  headerLogo: {
    width: 52,
    height: 52,
    marginBottom: 6,
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
    fontWeight: "500",
  },
});

