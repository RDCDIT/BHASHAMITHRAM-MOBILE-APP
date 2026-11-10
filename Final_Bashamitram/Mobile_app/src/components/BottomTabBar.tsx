/**
 * @file BottomTabBar.tsx
 * @description Modern bottom navigation tab bar matching the design system.
 * Contains: Dictionary (Home), Favorites (Starred words for learning), and Settings.
 */

import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export type BottomTabKey = "dictionary" | "favorites" | "settings";

interface BottomTabBarProps {
  activeTab: BottomTabKey;
}

export default function BottomTabBar({ activeTab }: BottomTabBarProps) {
  const router = useRouter();

  const tabs: { key: BottomTabKey; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
    {
      key: "dictionary",
      label: "Dictionary",
      icon: "search-outline",
      activeIcon: "search",
    },
    {
      key: "favorites",
      label: "Favorites",
      icon: "heart-outline",
      activeIcon: "heart",
    },
    {
      key: "settings",
      label: "Settings",
      icon: "settings-outline",
      activeIcon: "settings",
    },
  ];

  const handleTabPress = (key: BottomTabKey) => {
    if (key === activeTab) return;
    if (key === "dictionary") {
      router.replace("/");
    } else if (key === "favorites") {
      router.replace("/favorites");
    } else if (key === "settings") {
      router.replace("/settings");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerBar}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          const color = isActive ? "#2563EB" : "#64748B";

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
              <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>

              {/* Active Indicator Bar (Matching Image 1) */}
              {isActive ? <View style={styles.activeBar} /> : <View style={styles.inactivePlaceholder} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(226, 232, 240, 0.9)",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
      default: {
        boxShadow: "0 -2px 10px rgba(15, 23, 42, 0.05)",
      },
    }),
  },
  innerBar: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  activeBar: {
    width: 26,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#2563EB",
    marginTop: 4,
  },
  inactivePlaceholder: {
    width: 26,
    height: 3.5,
    marginTop: 4,
  },
});

