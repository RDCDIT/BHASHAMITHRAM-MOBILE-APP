/**
 * @file index.tsx
 * @description Modern, fully responsive Home Dashboard for Bhashamithram II.
 * Adaptive to all screen sizes: Small phones, Standard/Large phones, Tablets, Laptops, and Desktops.
 * Features:
 *  - Fresh light pastel theme with organic wave accents & floating Malayalam characters
 *  - Sleek top navigation bar with Menu button, C-DIT official logo, and Settings button
 *  - Prominent Bhashamithram II circular emblem & bilingual typography lockup
 *  - 5 standalone modern floating card navigation items with custom pastel badges and chevrons
 *  - Official C-DIT institutional attribution footer
 *  - Fluid responsive container based on device viewport
 */

import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import SideMenu from "../components/side-menu";
import FloatingLettersBackground from "../components/FloatingLettersBackground";
import BottomTabBar from "../components/BottomTabBar";
import { useResponsive } from "../utils/responsive";

interface MenuItem {
  id: string;
  title: string;
  iconType: "search" | "text_A" | "book" | "pricetag" | "time";
  iconColor: string;
  badgeBg: string;
  onPress: () => void;
}

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const router = useRouter();

  const {
    isSmallPhone,
    isTallPhone,
    isTablet,
    isDesktop,
    containerMaxWidth,
    containerPadding,
    homeEmblemSize,
    homeTitleFontSize,
    homeSubtitleFontSize,
    homeTaglineFontSize,
    homeCardHeight,
    homeCardMargin,
    homeCardPaddingH,
    homeItemTitleFontSize,
    homeBadgeSize,
    homeIconSize,
    homeChevronSize,
  } = useResponsive();

  const menuItems: MenuItem[] = [
    {
      id: "1",
      title: "ഇംഗ്ലീഷ് - മലയാളം പദസേതു",
      iconType: "search",
      iconColor: "#059669",
      badgeBg: "#D1FAE5",
      onPress: () => router.push("./english_malayalam"),
    },
    {
      id: "2",
      title: "മലയാളം - ഇംഗ്ലീഷ് ഭാഷാസേതു",
      iconType: "text_A",
      iconColor: "#2563EB",
      badgeBg: "#DBEAFE",
      onPress: () => router.push("./malayalam_english"),
    },
    {
      id: "3",
      title: "മലയാളം നാനാർത്ഥ വാക്കറിവ്",
      iconType: "book",
      iconColor: "#0D9488",
      badgeBg: "#CCFBF1",
      onPress: () => router.push("./malayalam_synonym"),
    },
    {
      id: "4",
      title: "മലയാളം - മലയാളം പദമിത്രം",
      iconType: "pricetag",
      iconColor: "#0284C7",
      badgeBg: "#E0F2FE",
      onPress: () => router.push("./malayalam-malayalam"),
    },
    {
      id: "5",
      title: "സമീപകാല തിരയലുകൾ",
      iconType: "time",
      iconColor: "#7C3AED",
      badgeBg: "#EDE9FE",
      onPress: () => router.push("./savishesha_thirayal"),
    },
  ];

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Floating Animated Malayalam letters & soft organic waves */}
      <FloatingLettersBackground />

      <View style={styles.mainWrapper}>
        {/* ===================== TOP NAVIGATION BAR ===================== */}
        <View style={[styles.navBar, { maxWidth: containerMaxWidth as any }]}>
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            style={styles.navIconButton}
            activeOpacity={0.7}
            accessibilityLabel="Open side menu"
          >
            <Ionicons name="menu" size={24} color="#0F172A" />
          </TouchableOpacity>

          {/* Official C-DIT Logo in Navigation Bar */}
          <View style={styles.navCenterContainer}>
            <Image
              source={require("../../assets/images/cdit_logo.png")}
              style={[
                styles.navCditLogo,
                { width: isSmallPhone ? 76 : isTablet ? 105 : 90 },
              ]}
              contentFit="contain"
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push("./settings")}
            style={styles.navIconButton}
            activeOpacity={0.7}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={isSmallPhone}
          contentContainerStyle={[
            styles.scrollContent,
            {
              flexGrow: 1,
              justifyContent: "space-between",
              maxWidth: containerMaxWidth as any,
              paddingHorizontal: containerPadding,
            },
          ]}
        >
          {/* ===================== BRAND HERO HEADER ===================== */}
          <View style={styles.brandHeroCard}>
            {/* Left Circular Emblem */}
            <View
              style={[
                styles.emblemContainer,
                {
                  width: homeEmblemSize,
                  height: homeEmblemSize,
                  borderRadius: homeEmblemSize / 2,
                },
              ]}
            >
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.emblemImage}
                contentFit="contain"
                transition={200}
              />
            </View>

            {/* Right Brand Typography */}
            <View style={styles.brandInfoCol}>
              <Text
                style={[
                  styles.brandTitle,
                  { fontSize: homeTitleFontSize },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                ഭാഷാമിത്രം-II
              </Text>

              {/* Decorative Leaf Line Divider */}
              <View style={styles.leafDividerRow}>
                <View style={styles.leafLine} />
                <Text style={styles.leafEmoji}>🍃</Text>
                <View style={styles.leafLine} />
              </View>

              <Text
                style={[
                  styles.brandSubtitle,
                  { fontSize: homeSubtitleFontSize },
                ]}
                numberOfLines={2}
              >
                MALAYALAM ENGLISH{"\n"}BILINGUAL DICTIONARY
              </Text>

              <View style={styles.taglineWrap}>
                <Text
                  style={[
                    styles.brandTagline,
                    { fontSize: homeTaglineFontSize },
                  ]}
                >
                  Words Build Bridges
                </Text>
                <View style={styles.taglineUnderline} />
              </View>
            </View>
          </View>

          {/* ===================== 5 STANDALONE MENU CARDS ===================== */}
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItemCard,
                  {
                    height: homeCardHeight,
                    marginBottom: index === menuItems.length - 1 ? 0 : homeCardMargin,
                    paddingHorizontal: homeCardPaddingH,
                  },
                ]}
                activeOpacity={0.8}
                onPress={item.onPress}
              >
                {/* Left Colored Circular Badge */}
                <View
                  style={[
                    styles.menuBadge,
                    {
                      width: homeBadgeSize,
                      height: homeBadgeSize,
                      borderRadius: homeBadgeSize / 2,
                      backgroundColor: item.badgeBg,
                    },
                  ]}
                >
                  {item.iconType === "text_A" ? (
                    <Text
                      style={[
                        styles.badgeLetterA,
                        {
                          color: item.iconColor,
                          fontSize: Math.round(homeIconSize * 1.15),
                        },
                      ]}
                    >
                      A
                    </Text>
                  ) : (
                    <Ionicons
                      name={
                        item.iconType === "search"
                          ? "search"
                          : item.iconType === "book"
                          ? "book-outline"
                          : item.iconType === "pricetag"
                          ? "pricetag-outline"
                          : "time-outline"
                      }
                      size={homeIconSize}
                      color={item.iconColor}
                    />
                  )}
                </View>

                {/* Malayalam Dictionary Title */}
                <Text
                  style={[
                    styles.menuItemTitle,
                    { fontSize: homeItemTitleFontSize },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                >
                  {item.title}
                </Text>

                {/* Right Action Chevron Pill */}
                <View
                  style={[
                    styles.chevronPill,
                    {
                      width: homeChevronSize,
                      height: homeChevronSize,
                      borderRadius: homeChevronSize / 2,
                    },
                  ]}
                >
                  <Ionicons name="chevron-forward" size={isTablet ? 18 : 16} color="#64748B" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Slide-out Navigation Drawer */}
      <SideMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* ===================== BOTTOM NAVIGATION TAB BAR ===================== */}
      <BottomTabBar activeTab="dictionary" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mainWrapper: {
    flex: 1,
    position: "relative",
  },
  navBar: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 6 : 4,
    paddingBottom: 8,
    zIndex: 10,
  },
  navIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
      },
    }),
  },
  navCenterContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  navCditLogo: {
    height: 32,
    width: 86,
  },
  scrollContent: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 4,
    paddingBottom: 6,
  },
  brandHeroCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  emblemContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(167, 243, 208, 0.7)",
    ...Platform.select({
      ios: {
        shadowColor: "#059669",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: "0 4px 14px rgba(5, 150, 105, 0.12)",
      },
    }),
  },
  emblemImage: {
    width: "100%",
    height: "100%",
  },
  brandInfoCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  brandTitle: {
    fontFamily: "NotoSansMalayalam",
    fontWeight: "800",
    color: "#03506B",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  leafDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
    width: "90%",
  },
  leafLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(52, 211, 153, 0.55)",
    borderRadius: 1,
  },
  leafEmoji: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  brandSubtitle: {
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.5,
    lineHeight: 13,
    marginBottom: 3,
  },
  taglineWrap: {
    alignSelf: "flex-start",
    marginTop: 1,
  },
  brandTagline: {
    fontStyle: "italic",
    fontWeight: "600",
    color: "#1E40AF",
    letterSpacing: 0.2,
  },
  taglineUnderline: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(30, 64, 175, 0.35)",
    borderRadius: 1,
  },
  menuList: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    marginVertical: 4,
  },
  menuItemCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.95)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2.5,
      },
      default: {
        boxShadow: "0 3px 12px rgba(15, 23, 42, 0.06)",
      },
    }),
  },
  menuBadge: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  badgeLetterA: {
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-black",
  },
  menuItemTitle: {
    flex: 1,
    fontFamily: "NotoSansMalayalam",
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
    marginRight: 8,
  },
  chevronPill: {
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginLeft: 10,
  },
});
