/**
 * @file FloatingLettersBackground.tsx
 * @description Background visual effect component containing Malayalam alphabet characters
 * and educational icons that float and rotate continuously using React Native Reanimated.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface FloatingLetterProps {
  char: string;
  top: string;
  left: string;
  delayMs: number;
}

/**
 * Individual floating letter component which animate translation, scaling, opacity, 
 * and rotation in a continuous loop with a start delay.
 * 
 * @param {FloatingLetterProps} props - The component parameters.
 * @returns {React.JSX.Element} Animated text element containing the character.
 */
const FloatingLetter: React.FC<FloatingLetterProps> = ({ char, top, left, delayMs }) => {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    tx.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(25, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    ty.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-40, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(30, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-25, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    rot.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(10, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.9, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [delayMs, tx, ty, rot, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { rotate: `${rot.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.Text
      style={[
        styles.letter,
        {
          top: top as any,
          left: left as any,
        },
        animatedStyle,
      ]}
    >
      {char}
    </Animated.Text>
  );
};

/**
 * FloatingLettersBackground renders a container filled with various floating letters
 * in different absolute positions and delayed starts, functioning as a non-interactive backdrop.
 * 
 * @returns {React.JSX.Element} The background view container.
 */
export default function FloatingLettersBackground() {
  const letters = [
    { char: "അ", top: "5%", left: "10%", delayMs: 0 },
    { char: "ക", top: "15%", left: "20%", delayMs: 1000 },
    { char: "പ", top: "25%", left: "35%", delayMs: 2000 },
    { char: "✏️", top: "20%", left: "50%", delayMs: 3000 },
    { char: "ത", top: "55%", left: "60%", delayMs: 4000 },
    { char: "🖊️", top: "65%", left: "75%", delayMs: 5000 },
    { char: "ശ", top: "10%", left: "80%", delayMs: 6000 },
    { char: "ള", top: "75%", left: "20%", delayMs: 7000 },
    { char: "യ", top: "28%", left: "1%", delayMs: 8000 },
    { char: "ഈ", top: "80%", left: "50%", delayMs: 9000 },
    { char: "ദ", top: "85%", left: "70%", delayMs: 10000 },
    { char: "ണ", top: "90%", left: "90%", delayMs: 11000 },
    { char: "📚", top: "30%", left: "90%", delayMs: 12000 },
    { char: "📚", top: "50%", left: "10%", delayMs: 13000 },
    { char: "ഹ", top: "60%", left: "30%", delayMs: 14000 },
    { char: "ട", top: "20%", left: "70%", delayMs: 15000 },
    { char: "✒️", top: "78%", left: "-2%", delayMs: 16000 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {letters.map((item, index) => (
        <FloatingLetter
          key={index}
          char={item.char}
          top={item.top}
          left={item.left}
          delayMs={item.delayMs}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  letter: {
    position: "absolute",
    fontSize: 28,
    fontWeight: "bold",
    color: "rgba(94, 97, 99, 0.18)",
    fontFamily: "Chilanka",
  },
});

