/**
 * @file side-menu.tsx
 * @description Slide-out Navigation Drawer matching the official Bhashamithram-II design.
 * Features a curved mint brand header with the circular emblem, C-DIT logo,
 * categorized dictionary and support cards, and an institutional footer.
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Slide-out Navigation Drawer Component
 */
export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 600;
  const drawerWidth = Math.min(335, Math.round(screenWidth * (isTablet ? 0.6 : 0.84)));
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -drawerWidth,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible, drawerWidth, slideAnim]);

  const handleBackdropPress = () => {
    onClose();
  };

  const handleOpenURL = async (url: string) => {
    onClose();
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn("Failed to open URL:", url, error);
    }
  };

  const handleShareApp = async () => {
    onClose();
    try {
      await Share.share({
        title: "ഭാഷാമിത്രം-II (Bhashamithram II)",
        message:
          "ഭാഷാമിത്രം-II - Malayalam English Bilingual Dictionary App by C-DIT, Government of Kerala.\nDownload now: https://play.google.com/store/apps/details?id=org.cdit.bhashamithram2",
      });
    } catch (error) {
      console.warn("Failed to share app:", error);
    }
  };

  const handleRateUs = async () => {
    onClose();
    try {
      await Linking.openURL(
        "https://play.google.com/store/apps/details?id=org.cdit.bhashamithram2"
      );
    } catch (error) {
      console.warn("Failed to open store link:", error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        {/* Animated Slide Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ===================== CURVED BRAND HEADER ===================== */}
            <View style={styles.headerCard}>
              {/* Subtle translucent floating Malayalam letters in background */}
              <Text style={styles.headerLetter1}>അ</Text>
              <Text style={styles.headerLetter2}>ഉ</Text>
              <Text style={styles.headerLetter3}>ര</Text>
              <Text style={styles.headerLetter4}>ഷ</Text>
              <Text style={styles.headerLetter5}>ക</Text>
              <Text style={styles.headerLetter6}>മ</Text>
              <Text style={styles.headerLetter7}>ഇ</Text>

              {/* Botanical leaves in bottom right corner of header */}
              <MaterialCommunityIcons
                name="leaf"
                size={48}
                color="rgba(16, 185, 129, 0.38)"
                style={styles.headerLeaf1}
              />
              <MaterialCommunityIcons
                name="leaf"
                size={30}
                color="rgba(52, 211, 153, 0.48)"
                style={styles.headerLeaf2}
              />

              {/* Main Branding Row */}
              <View style={styles.headerRow}>
                {/* Circular Emblem */}
                <View style={styles.emblemContainer}>
                  <Image
                    source={require("../../assets/images/logo.png")}
                    style={styles.emblemImage}
                    contentFit="contain"
                  />
                </View>

                {/* Right Branding Text Column */}
                <View style={styles.headerTextCol}>
                  {/* C-DIT Logo */}
                  <Image
                    source={require("../../assets/images/cdit_logo.png")}
                    style={styles.cditLogo}
                    contentFit="contain"
                  />

                  {/* Malayalam Title */}
                  <Text style={styles.appTitle}>ഭാഷാമിത്രം-II</Text>

                  {/* Botanical Leaf Divider Line */}
                  <View style={styles.leafDividerContainer}>
                    <View style={styles.leafDividerLine} />
                    <MaterialCommunityIcons
                      name="leaf"
                      size={13}
                      color="#16A34A"
                      style={styles.leafDividerIcon}
                    />
                  </View>

                  {/* English Subtitle */}
                  <Text style={styles.appSubtitle}>
                    {"MALAYALAM ENGLISH\nBILINGUAL DICTIONARY"}
                  </Text>

                  {/* Tagline */}
                  <Text style={styles.tagline}>Words Build Bridges</Text>
                </View>
              </View>
            </View>

            {/* ===================== SECTION 1: DICTIONARIES ===================== */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                നിഘണ്ടുകൾ (DICTIONARIES)
              </Text>

              <DrawerCard
                title="ഇംഗ്ലീഷ് - മലയാളം പദസേതു"
                badgeBg="#D1FAE5"
                iconName="search"
                iconColor="#059669"
                onPress={() => {
                  onClose();
                  router.push("/english_malayalam");
                }}
              />

              <DrawerCard
                title="മലയാളം - ഇംഗ്ലീഷ് ഭാഷാസേതു"
                badgeBg="#DBEAFE"
                letterBadge="A"
                iconColor="#2563EB"
                onPress={() => {
                  onClose();
                  router.push("/malayalam_english");
                }}
              />

              <DrawerCard
                title="മലയാള നാനാർത്ഥ വാക്കറിവ്"
                badgeBg="#CCFBF1"
                iconName="book-outline"
                iconColor="#0D9488"
                onPress={() => {
                  onClose();
                  router.push("/malayalam_synonym");
                }}
              />

              <DrawerCard
                title="മലയാളം - മലയാളം പദമിത്രം"
                badgeBg="#E0F2FE"
                iconName="create-outline"
                iconColor="#0284C7"
                onPress={() => {
                  onClose();
                  router.push("/malayalam-malayalam");
                }}
              />
            </View>

            {/* Separator Line */}
            <View style={styles.sectionDivider} />

            {/* ===================== SECTION 2: GENERAL & SUPPORT ===================== */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                സഹായസേവകൾ (GENERAL & SUPPORT)
              </Text>

              <DrawerCard
                title="Suggest a Word"
                badgeBg="#EDE9FE"
                iconName="paper-plane-outline"
                iconColor="#7C3AED"
                onPress={() => {
                  onClose();
                  router.push("/suggest-word" as any);
                }}
              />

              <DrawerCard
                title="C-DIT Website"
                badgeBg="#DBEAFE"
                iconName="globe-outline"
                iconColor="#2563EB"
                onPress={() => handleOpenURL("https://www.cdit.org")}
              />

              <DrawerCard
                title="Info / Support"
                badgeBg="#CCFBF1"
                iconName="information-circle-outline"
                iconColor="#0D9488"
                onPress={() => {
                  onClose();
                  router.push("/info_support");
                }}
              />

              <DrawerCard
                title="Share App"
                badgeBg="#FCE7F3"
                iconName="share-social-outline"
                iconColor="#DB2777"
                onPress={handleShareApp}
              />

              <DrawerCard
                title="Rate Us"
                badgeBg="#FEF3C7"
                iconName="star-outline"
                iconColor="#D97706"
                onPress={handleRateUs}
              />
            </View>

            {/* ===================== INSTITUTIONAL FOOTER ===================== */}
            <View style={styles.footerContainer}>
              <View style={styles.footerDivider} />
              <View style={styles.footerRow}>
                <Image
                  source={require("../../assets/images/cdit_logo.png")}
                  style={styles.footerLogo}
                  contentFit="contain"
                />
                <View style={styles.footerTextCol}>
                  <Text style={styles.footerHeading}>
                    CENTRE FOR DEVELOPMENT OF IMAGING TECHNOLOGY
                  </Text>
                  <Text style={styles.footerSub}>Government of Kerala</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Semi-transparent Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleBackdropPress} />
      </View>
    </Modal>
  );
}

/**
 * Individual Rounded Floating Drawer Card
 */
function DrawerCard({
  title,
  badgeBg,
  iconName,
  iconColor,
  letterBadge,
  onPress,
}: {
  title: string;
  badgeBg: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  letterBadge?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        {letterBadge ? (
          <Text style={[styles.badgeLetter, { color: iconColor || "#2563EB" }]}>
            {letterBadge}
          </Text>
        ) : iconName ? (
          <Ionicons name={iconName} size={18} color={iconColor || "#0F172A"} />
        ) : null}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    height: "100%",
    backgroundColor: "#F8FAFC",
    zIndex: 100,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },

  /* HEADER CARD */
  headerCard: {
    backgroundColor: "#E6F7F5",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingTop: Platform.OS === "ios" ? 48 : 34,
    paddingBottom: 18,
    paddingHorizontal: 14,
    position: "relative",
    overflow: "hidden",
  },
  headerLetter1: {
    position: "absolute",
    bottom: 8,
    left: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "rgba(14, 165, 233, 0.22)",
    fontFamily: "NotoSansMalayalam",
  },
  headerLetter2: {
    position: "absolute",
    bottom: 2,
    left: 44,
    fontSize: 17,
    fontWeight: "800",
    color: "rgba(20, 184, 166, 0.22)",
    fontFamily: "NotoSansMalayalam",
  },
  headerLetter3: {
    position: "absolute",
    bottom: 0,
    left: 82,
    fontSize: 15,
    fontWeight: "800",
    color: "rgba(59, 130, 246, 0.20)",
    fontFamily: "NotoSansMalayalam",
  },
  headerLetter4: {
    position: "absolute",
    bottom: 2,
    right: 56,
    fontSize: 18,
    fontWeight: "800",
    color: "rgba(16, 185, 129, 0.22)",
    fontFamily: "NotoSansMalayalam",
  },
  headerLetter5: {
    position: "absolute",
    top: 8,
    left: 120,
    fontSize: 16,
    fontWeight: "800",
    color: "rgba(13, 148, 136, 0.20)",
    fontFamily: "NotoSansMalayalam",
  },
  headerLetter6: {
    position: "absolute",
    top: 14,
    right: 30,
    fontSize: 18,
    fontWeight: "800",
    color: "rgba(59, 130, 246, 0.18)",
    fontFamily: "NotoSansMalayalam",
  },
  headerLetter7: {
    position: "absolute",
    bottom: 6,
    left: 125,
    fontSize: 15,
    fontWeight: "800",
    color: "rgba(14, 165, 233, 0.20)",
    fontFamily: "NotoSansMalayalam",
  },
  headerLeaf1: {
    position: "absolute",
    bottom: -4,
    right: -2,
    transform: [{ rotate: "-35deg" }],
  },
  headerLeaf2: {
    position: "absolute",
    bottom: 12,
    right: 18,
    transform: [{ rotate: "-15deg" }, { scaleX: -1 }],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  emblemContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#0284C7",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emblemImage: {
    width: "100%",
    height: "100%",
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cditLogo: {
    width: 74,
    height: 22,
    marginBottom: 2,
  },
  appTitle: {
    fontFamily: "NotoSansMalayalam",
    fontSize: 18.5,
    fontWeight: "800",
    color: "#0B3B60",
    letterSpacing: 0.2,
  },
  leafDividerContainer: {
    width: 110,
    height: 14,
    justifyContent: "center",
    marginVertical: 2,
    position: "relative",
  },
  leafDividerLine: {
    width: "100%",
    height: 1.5,
    backgroundColor: "#2DD4BF",
    borderRadius: 1,
  },
  leafDividerIcon: {
    position: "absolute",
    right: 10,
    top: -4,
    transform: [{ rotate: "-20deg" }],
  },
  appSubtitle: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.5,
    lineHeight: 13,
  },
  tagline: {
    fontSize: 11.5,
    fontStyle: "italic",
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 2,
  },

  /* SECTION & CARDS */
  section: {
    paddingTop: 8,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginLeft: 18,
    marginTop: 8,
    marginBottom: 8,
    fontFamily: "NotoSansMalayalam",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
    marginVertical: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 14,
    marginVertical: 4.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeLetter: {
    fontSize: 17,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-black",
  },
  cardTitle: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "NotoSansMalayalam",
    letterSpacing: -0.1,
  },

  /* FOOTER */
  footerContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  footerLogo: {
    width: 38,
    height: 19,
    marginRight: 10,
  },
  footerTextCol: {
    flex: 1,
    justifyContent: "center",
  },
  footerHeading: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.3,
  },
  footerSub: {
    fontSize: 8,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 1,
  },
});
