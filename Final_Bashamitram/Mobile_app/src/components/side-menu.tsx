/**
 * @file side-menu.tsx
 * @description React Native UI Component: side-menu.
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Linking,
  Modal,
  Pressable,
  ScrollView,
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
 * Renders and manages the SideMenu component/view.
 *
 * @returns {React.JSX.Element} The rendered React component.
 */
export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = Math.min(320, Math.round(screenWidth * 0.78));
  const [slideAnim] = useState(() => new Animated.Value(-drawerWidth));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -drawerWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, drawerWidth, slideAnim]);

  const handleBackdropPress = () => {
    onClose();
    router.replace("/");
  };

  /**
 * Asynchronous controller/helper function: handleOpenURL.
 */
const handleOpenURL = async (url: string) => {
    onClose();
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn("Failed to open URL:", url, error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
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
            {/* Curved Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/cdit_logo.png")}
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.appTitle}>ഭാഷാമിത്രം II</Text>
            </View>

            {/* Main Content Area */}
            <View style={styles.mainContent}>
              {/* Dictionaries Section */}
              <View style={styles.section}>
              <Text style={styles.sectionHeader}>നിഘണ്ടുക്കൾ (Dictionaries)</Text>
              <MenuRow
                icon="swap-horizontal"
                title="ഇംഗ്ലീഷ് - മലയാളം നിഘണ്ടു"
                showChevron
                onPress={() => {
                  onClose();
                  router.push("/english_malayalam");
                }}
              />
               <MenuRow
                icon="swap-horizontal"
                title="മലയാളം - ഇംഗ്ലീഷ് നിഘണ്ടു"
                showChevron
                onPress={() => {
                  onClose();
                  router.push("/malayalam_english");
                }}
              />
               <MenuRow
                icon="text"
                title="നാനാർത്ഥ നിഘണ്ടു"
                showChevron
                onPress={() => {
                  onClose();
                  router.push("/malayalam_synonym");
                }}
              />
              <MenuRow
                icon="swap-horizontal"
                title="മലയാളം - മലയാളം നിഘണ്ടു"
                showChevron
                onPress={() => {
                  onClose();
                  router.push("/malayalam-malayalam");
                }}
              />
             
              
             
            </View>

            {/* General Info / Services Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>സേവനങ്ങൾ (General & Support)</Text>
              <MenuRow
                icon="paper-plane-outline"
                title="Suggest a Word"
                showChevron
                onPress={() => {
                  onClose();
                  router.push("/suggest-word" as any);
                }}
              />
              <MenuRow
                icon="globe-outline"
                title="C-DIT Website"
                onPress={() => handleOpenURL("https://www.cdit.org")}
              />
              <MenuRow
                icon="information-circle-outline"
                title="Info / Support"
                onPress={() => {
                  onClose();
                  router.push("/info_support");
                }}
              />
              <MenuRow
                icon="share-social-outline"
                title="Share App"
                onPress={() => handleOpenURL("https://your-app-link.com")}
              />
              <MenuRow
                icon="star-outline"
                title="Rate Us"
                onPress={() =>
                  handleOpenURL(
                    "https://play.google.com/store/apps/details?id=com.yourapp"
                  )
                }
              />
            </View>
          </View>

            {/* Bottom Footer Credits */}
            <View style={styles.footer}>
              <Text style={styles.footerSubtext}>Developed by R&D C-DIT</Text>
            </View>
          </ScrollView>
        </Animated.View>

        <Pressable style={styles.backdrop} onPress={handleBackdropPress} />
      </View>
    </Modal>
  );
}

function MenuRow({
  icon,
  title,
  onPress,
  showChevron = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.65}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={19} color="#2B2C51" />
      </View>
      <Text style={styles.rowText}>{title}</Text>
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color="#B3A9A0" style={{ marginLeft: "auto" }} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    height: "100%",
    backgroundColor: "#F9F6F1",
    zIndex: 100,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2B2C51",
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
  },
  logoContainer: {
    backgroundColor: "transparent",
    alignSelf: "stretch",
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "40%",
    height: 125,
  },
  appTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    fontFamily: "NotoSansMalayalam",
    letterSpacing: 0.5,
  },
  section: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EBE6DF",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8E867E",
    textTransform: "uppercase",
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
    letterSpacing: 1.2,
    fontFamily: "NotoSansMalayalam",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#EBE6DF",
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: {
    marginLeft: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2C51",
    fontFamily: "NotoSansMalayalam",
    flex: 1,
  },
  footer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 11,
    color: "#8E867E",
    fontFamily: "NotoSansMalayalam",
    fontWeight: "600",
  },
  footerSubtext: {
    fontSize: 10,
    color: "#B3A9A0",
    marginTop: 2,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
