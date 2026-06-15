import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
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

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = Math.min(320, Math.round(screenWidth * 0.78));
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;

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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Image
                source={require("@/assets/images/cdit_logo.png")}
                style={styles.logoImage}
                contentFit="contain"
              />
              <Text style={styles.appTitle}>ഭാഷാമിത്രം</Text>
            </View>

            <View style={styles.section}>
              <MenuRow
                icon="swap-horizontal"
                title="ഇംഗ്ലീഷ് - മലയാളം നിഘണ്ടു"
                onPress={() => {
                  onClose();
                  router.push("/english-malayalm");
                }}
              />
              <MenuRow
                icon="swap-horizontal"
                title="മലയാളം - ഇംഗ്ലീഷ് നിഘണ്ടു"
                onPress={() => {
                  onClose();
                  router.push("/malayalam-english");
                }}
              />
              <MenuRow
                icon="text"
                title="നാനാർത്ഥ നിഘണ്ടു"
                onPress={() => {
                  onClose();
                  router.push("/nanaarth");
                }}
              />
            </View>

            <View style={styles.section}>
              <MenuRow
                icon="business"
                title="Govt. of Kerala"
                onPress={() => handleOpenURL("https://kerala.gov.in")}
              />
              <MenuRow
                icon="globe-outline"
                title="C-DIT"
                onPress={() => handleOpenURL("https://www.cdit.org")}
              />
              <MenuRow
                icon="information-circle-outline"
                title="Info"
                onPress={() => handleOpenURL("https://your-info-page.com")}
              />
              <MenuRow
                icon="share-social-outline"
                title="Share"
                onPress={() => handleOpenURL("https://your-app-link.com")}
              />
              <MenuRow
                icon="paper-plane-outline"
                title="Suggest a Word"
                onPress={() => {
                  onClose();
                  router.push("/suggest-word" as any);
                }}
              />
              <MenuRow
                icon="star-outline"
                title="Rate"
                onPress={() =>
                  handleOpenURL(
                    "https://play.google.com/store/apps/details?id=com.yourapp"
                  )
                }
              />
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color="#00D2FF" />
      </View>
      <Text style={styles.rowText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(3, 5, 10, 0.75)",
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    height: "100%",
    backgroundColor: "#0F1322",
    zIndex: 100,
    borderRightWidth: 1,
    borderRightColor: "#222B3F",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#090D16",
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222B3F",
  },
  appTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    fontFamily: "NotoSansMalayalam",
    letterSpacing: 0.5,
  },
  section: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222B3F",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B2335",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 210, 255, 0.2)",
  },
  rowText: {
    marginLeft: 16,
    fontSize: 15,
    color: "#E2E8F0",
    fontFamily: "NotoSansMalayalam",
    fontWeight: "500",
  },
  logoImage: {
    width: "80%",
    height: 80,
  },
});
