/**
 * @file FloatingLettersBackground.tsx
 * @description Universal background component matching the Bhashamithram design system.
 * Features top soft mint/cyan organic curves, bottom layered fluid waves,
 * a botanical leaf cluster on the bottom-right, and rich floating Malayalam letters
 * distributed across top, middle margins, and lower wave areas.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface FloatingCharProps {
  char: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size: number;
  color: string;
  delayMs: number;
}

const FloatingChar: React.FC<FloatingCharProps> = ({
  char,
  top,
  bottom,
  left,
  right,
  size,
  color,
  delayMs,
}) => {
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-14, { duration: 2700, easing: Easing.inOut(Easing.ease) }),
          withTiming(9, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    rot.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-7, { duration: 2900, easing: Easing.inOut(Easing.ease) }),
          withTiming(7, { duration: 2900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [delayMs, ty, rot]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.Text
      style={[
        styles.floatingChar,
        {
          top,
          bottom,
          left,
          right,
          fontSize: size,
          color,
        },
        animatedStyle,
      ]}
    >
      {char}
    </Animated.Text>
  );
};

export default function FloatingLettersBackground() {
  // Rich set of Malayalam characters distributed across all screen regions
  const floatingLetters: FloatingCharProps[] = [
    // --- TOP ORGANIC GLOW REGION ---
    { char: "എ", top: 38, left: 28, size: 25, color: "rgba(13, 148, 136, 0.23)", delayMs: 200 },
    { char: "ഒ", top: 72, left: 105, size: 21, color: "rgba(14, 165, 233, 0.21)", delayMs: 1400 },
    { char: "ണ", top: 35, right: 85, size: 23, color: "rgba(59, 130, 246, 0.21)", delayMs: 900 },
    { char: "Q", top: 82, right: 26, size: 24, color: "rgba(16, 185, 129, 0.23)", delayMs: 2300 },
    { char: "ഋ", top: 120, left: 22, size: 20, color: "rgba(20, 184, 166, 0.19)", delayMs: 1800 },
    { char: "ധ", top: 135, right: 60, size: 21, color: "rgba(14, 165, 233, 0.20)", delayMs: 600 },
    { char: "R", top: 160, left: 85, size: 20, color: "rgba(99, 102, 241, 0.19)", delayMs: 2500 },

    // --- MID-SCREEN & SIDE MARGINS ---
    { char: "ഇ", top: 285, left: 20, size: 22, color: "rgba(20, 184, 166, 0.21)", delayMs: 400 },
    { char: "സ", top: 225, right: 16, size: 23, color: "rgba(16, 185, 129, 0.22)", delayMs: 1200 },
    { char: "E", top: 305, right: 14, size: 24, color: "rgba(59, 130, 246, 0.21)", delayMs: 700 },
    { char: "ഏ", top: 370, left: 12, size: 21, color: "rgba(13, 148, 136, 0.20)", delayMs: 1700 },
    { char: "ഭ", top: 390, right: 20, size: 22, color: "rgba(99, 102, 241, 0.20)", delayMs: 2100 },
    

    // --- LOWER WAVES & CRESTS ---
    { char: "ന", bottom: 175, left: 45, size: 22, color: "rgba(14, 165, 233, 0.23)", delayMs: 1500 },
    { char: "g", bottom: 155, right: 35, size: 25, color: "rgba(13, 148, 136, 0.25)", delayMs: 2000 },
    { char: "മ", bottom: 125, left: 24, size: 30, color: "rgba(14, 165, 233, 0.32)", delayMs: 0 },
    { char: "ദ", bottom: 115, left: 235, size: 24, color: "rgba(99, 102, 241, 0.23)", delayMs: 2400 },
    { char: "ഉ", bottom: 98, left: 100, size: 27, color: "rgba(20, 184, 166, 0.29)", delayMs: 800 },
    { char: "A", bottom: 95, right: 90, size: 28, color: "rgba(16, 185, 129, 0.30)", delayMs: 1200 },
    { char: "b", bottom: 82, left: 170, size: 23, color: "rgba(59, 130, 246, 0.25)", delayMs: 1600 },
    { char: "ഴ", bottom: 62, left: 275, size: 22, color: "rgba(13, 148, 136, 0.23)", delayMs: 1950 },
    { char: "വ", bottom: 45, left: 120, size: 21, color: "rgba(14, 165, 233, 0.22)", delayMs: 2250 },
    { char: "W", bottom: 35, right: 130, size: 23, color: "rgba(16, 185, 129, 0.23)", delayMs: 1100 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {/* 1. TOP ORGANIC WATERCOLOR ACCENTS */}
      <View style={styles.topGlowMint} />
      <View style={styles.topGlowCyan} />
      <View style={styles.topCurveWash} />

      {/* 2. BOTTOM LAYERED FLUID WAVES */}
      {/* Layer 1: Sky blue fluid wave rising from right */}
      <View style={styles.bottomWaveLayer1} />
      {/* Layer 2: Emerald/mint fluid wave */}
      <View style={styles.bottomWaveLayer2} />
      {/* Layer 3: Cyan/teal foreground fluid wave */}
      <View style={styles.bottomWaveLayer3} />
      {/* Layer 4: Soft light teal crest */}
      <View style={styles.bottomWaveCrest} />

      {/* 3. BOTANICAL LEAF CLUSTER ON BOTTOM RIGHT */}
      <View style={styles.leafCluster}>
        <MaterialCommunityIcons
          name="leaf"
          size={52}
          color="rgba(16, 185, 129, 0.55)"
          style={styles.leafMain}
        />
        <MaterialCommunityIcons
          name="leaf"
          size={38}
          color="rgba(52, 211, 153, 0.65)"
          style={styles.leafSecondary}
        />
        <MaterialCommunityIcons
          name="leaf"
          size={26}
          color="rgba(110, 231, 183, 0.70)"
          style={styles.leafTertiary}
        />
      </View>

      {/* 4. FLOATING TRANSLUCENT MALAYALAM LETTERS */}
      {floatingLetters.map((item, index) => (
        <FloatingChar
          key={index}
          char={item.char}
          top={item.top}
          bottom={item.bottom}
          left={item.left}
          right={item.right}
          size={item.size}
          color={item.color}
          delayMs={item.delayMs}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },

  /* TOP ACCENTS */
  topGlowMint: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 320,
    height: 280,
    borderRadius: 160,
    backgroundColor: "rgba(209, 250, 229, 0.50)",
    transform: [{ scaleX: 1.4 }, { rotate: "15deg" }],
  },
  topGlowCyan: {
    position: "absolute",
    top: -140,
    right: -80,
    width: 360,
    height: 300,
    borderRadius: 180,
    backgroundColor: "rgba(224, 242, 254, 0.60)",
    transform: [{ scaleX: 1.3 }, { rotate: "-20deg" }],
  },
  topCurveWash: {
    position: "absolute",
    top: -40,
    left: "15%",
    width: 280,
    height: 160,
    borderRadius: 140,
    backgroundColor: "rgba(240, 253, 250, 0.70)",
  },

  /* BOTTOM FLUID WAVES */
  bottomWaveLayer1: {
    position: "absolute",
    bottom: -130,
    right: -100,
    width: 440,
    height: 280,
    borderRadius: 200,
    backgroundColor: "rgba(186, 230, 253, 0.45)",
    transform: [{ scaleX: 1.5 }, { rotate: "-18deg" }],
  },
  bottomWaveLayer2: {
    position: "absolute",
    bottom: -110,
    left: -100,
    width: 420,
    height: 260,
    borderRadius: 190,
    backgroundColor: "rgba(167, 243, 208, 0.40)",
    transform: [{ scaleX: 1.4 }, { rotate: "12deg" }],
  },
  bottomWaveLayer3: {
    position: "absolute",
    bottom: -70,
    left: -40,
    right: -40,
    height: 180,
    borderRadius: 160,
    backgroundColor: "rgba(204, 251, 241, 0.55)",
    transform: [{ scaleX: 1.2 }, { rotate: "-4deg" }],
  },
  bottomWaveCrest: {
    position: "absolute",
    bottom: -30,
    left: "10%",
    width: 300,
    height: 110,
    borderRadius: 120,
    backgroundColor: "rgba(224, 242, 254, 0.35)",
  },

  /* BOTANICAL LEAF CLUSTER */
  leafCluster: {
    position: "absolute",
    bottom: 80,
    right: 12,
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  leafMain: {
    position: "absolute",
    bottom: 4,
    right: 4,
    transform: [{ rotate: "-45deg" }],
  },
  leafSecondary: {
    position: "absolute",
    bottom: 22,
    right: 28,
    transform: [{ rotate: "-25deg" }, { scaleX: -1 }],
  },
  leafTertiary: {
    position: "absolute",
    bottom: 38,
    right: 14,
    transform: [{ rotate: "-65deg" }],
  },

  /* FLOATING CHARACTERS */
  floatingChar: {
    position: "absolute",
    fontWeight: "bold",
    fontFamily: "NotoSansMalayalam",
  },
});
