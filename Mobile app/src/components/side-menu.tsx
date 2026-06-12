import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
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
          <ScrollView>
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
              <MenuRow icon="business" title="Govt. of Kerala" />
              <MenuRow icon="globe-outline" title="C-DIT" />
              <MenuRow icon="information-circle-outline" title="Info" />
              <MenuRow icon="share-social-outline" title="Share" />
              <MenuRow
                icon="paper-plane-outline"
                title="Suggest a Word"
                onPress={() => {
                  onClose();
                  router.push("/suggest-word" as any);
                }}
              />
              <MenuRow icon="star-outline" title="Rate" />
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
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#666" />
      <Text style={styles.rowText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    zIndex: 100,
    elevation: 10,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingBottom: 12,
  },
  appTitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 6,
    fontFamily: "NotoSansMalayalam",
  },
  section: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowText: {
    marginLeft: 20,
    fontSize: 16,
    color: "#000000",
    fontFamily: "NotoSansMalayalam",
  },
  logoImage: {
    width: "100%",
    height: 100,
  },
});
