/**
 * @file FavoriteButton.tsx
 * @description Favorite toggle button with animated feedback and persistence.
 */

import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isWordFavorite, toggleFavoriteWord } from "../utils/favorites";

interface FavoriteButtonProps {
  word: string;
  dictionaryType: string;
  meaning?: string;
  partOfSpeech?: string;
  phonetic?: string;
  size?: number;
  style?: ViewStyle;
  onToggle?: (isFav: boolean) => void;
}

export default function FavoriteButton({
  word,
  dictionaryType,
  meaning,
  partOfSpeech,
  phonetic,
  size = 32,
  style,
  onToggle,
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [scaleAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let mounted = true;
    void isWordFavorite(word, dictionaryType).then((fav) => {
      if (mounted) setIsFav(fav);
    });
    return () => {
      mounted = false;
    };
  }, [word, dictionaryType]);

  const handleToggle = async () => {
    // Immediate spring pop animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    const newFav = await toggleFavoriteWord({
      word,
      dictionaryType,
      meaning,
      partOfSpeech,
      phonetic,
    });
    setIsFav(newFav);
    onToggle?.(newFav);
  };

  const iconSize = Math.round(size * 0.52);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size / 2),
            backgroundColor: isFav ? "#FEF3C7" : "#F1F5F9",
            borderColor: isFav ? "#FDE68A" : "#E2E8F0",
          },
        ]}
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Ionicons
          name={isFav ? "star" : "star-outline"}
          size={iconSize}
          color={isFav ? "#D97706" : "#64748B"}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});

