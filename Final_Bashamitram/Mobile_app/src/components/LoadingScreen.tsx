/**
 * @file LoadingScreen.tsx
 * @description Dedicated loading / splash screen component matching the official Bhashamithram-II design.
 * Features the animated floating Malayalam characters and wave background,
 * circular app emblem, C-DIT brand mark, bilingual titles with leaf divider,
 * and an emerald/teal activity indicator.
 */

import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FloatingLettersBackground from "./FloatingLettersBackground";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isTablet = screenWidth >= 600;
  const isSmallPhone = screenWidth < 360;

  // Responsive emblem size
  const emblemSize = isSmallPhone ? 140 : isTablet ? 200 : 165;

  return (
    <View style={styles.container}>
      {/* 1. Animated Floating Background with Waves & Malayalam Letters */}
      <FloatingLettersBackground />

      {/* 2. Centered Branding Content */}
      <View style={styles.contentContainer}>
        {/* Circular Emblem Card */}
        <View
          style={[
            styles.emblemWrapper,
            {
              width: emblemSize,
              height: emblemSize,
              borderRadius: emblemSize / 2,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.emblemImage}
            contentFit="contain"
            priority="high"
          />
        </View>

        {/* C-DIT Official Logo */}
        <Image
          source={require("../../assets/images/cdit_logo.png")}
          style={[
            styles.cditLogo,
            {
              width: isTablet ? 115 : 95,
              height: isTablet ? 36 : 28,
            },
          ]}
          contentFit="contain"
          priority="high"
        />

        {/* Malayalam Main App Title */}
        <Text style={[styles.mainTitle, isTablet && { fontSize: 32 }]}>
          ഭാഷാമിത്രം-II
        </Text>

        {/* Botanical Leaf Divider Line */}
        <View style={styles.leafDividerContainer}>
          <View style={styles.leafDividerLine} />
          <MaterialCommunityIcons
            name="leaf"
            size={16}
            color="#16A34A"
            style={styles.leafDividerIcon}
          />
        </View>

        {/* Bilingual Dictionary Subtitle */}
        <Text style={[styles.subtitle, isTablet && { fontSize: 15, lineHeight: 22 }]}>
          {"MALAYALAM ENGLISH\nBILINGUAL DICTIONARY"}
        </Text>

        {/* Brand Tagline */}
        <Text style={[styles.tagline, isTablet && { fontSize: 16 }]}>
          Words Build Bridges
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  emblemWrapper: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#0284C7",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emblemImage: {
    width: "100%",
    height: "100%",
  },
  cditLogo: {
    marginTop: 22,
  },
  mainTitle: {
    fontFamily: "NotoSansMalayalam",
    fontSize: 27,
    fontWeight: "800",
    color: "#0B3B60",
    letterSpacing: 0.3,
    marginTop: 10,
    textAlign: "center",
  },
  leafDividerContainer: {
    width: 145,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
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
    right: 18,
    top: -4,
    transform: [{ rotate: "-20deg" }],
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.8,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
  },
  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 5,
    textAlign: "center",
  },
});

