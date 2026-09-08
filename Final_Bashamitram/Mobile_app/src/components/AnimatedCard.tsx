/**
 * @file AnimatedCard.tsx
 * @description A customizable React Native component that wraps children with entrance animations
 * (fade and slide up) staggered based on their list index, and horizontal drag-to-resize/flexibility physics.
 */

import React, { useEffect } from "react";
import { Animated, PanResponder } from "react-native";

interface AnimatedCardProps {
  children: React.ReactNode;
  index: number;
  scrollY?: Animated.Value;
}

/**
 * AnimatedCard component wraps list items to provide smooth stagger animations on mount
 * and interactive spring scaling/dragging effects.
 * 
 * @param {AnimatedCardProps} props - The component properties.
 * @returns {React.JSX.Element} The animated wrapper view.
 */
export default function AnimatedCard({ children, index, scrollY }: AnimatedCardProps) {
  const [fadeAnim] = React.useState(() => new Animated.Value(0));
  const [slideAnim] = React.useState(() => new Animated.Value(30));

  // Animated values for the drag-to-resize/flexibility effect
  const [dragScaleX] = React.useState(() => new Animated.Value(1));
  const [dragScaleY] = React.useState(() => new Animated.Value(1));

  useEffect(() => {
    // Stagger the first few cards to create a beautiful sequential reveal effect.
    const delay = index < 8 ? index * 80 : 0;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const [panResponder] = React.useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start responding if there is a horizontal drag/movement (threshold of 10 pixels)
        // and the horizontal movement is greater than the vertical movement.
        // This prevents capturing gestures when the user is scrolling up/down.
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Slow resizing setup: scale the card slightly based on drag distance
        // dx and dy drag distance creates a slow stretch/resize effect
        const targetScaleX = 1 + gestureState.dx * 0.0008;
        const targetScaleY = 1 + gestureState.dy * 0.0008;

        // Use Animated.spring for an organic feel
        Animated.spring(dragScaleX, {
          toValue: Math.max(0.8, Math.min(1.2, targetScaleX)),
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }).start();

        Animated.spring(dragScaleY, {
          toValue: Math.max(0.8, Math.min(1.2, targetScaleY)),
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }).start();
      },
      onPanResponderRelease: () => {
        // Reset scale back to 1 slowly and smoothly when released
        Animated.parallel([
          Animated.spring(dragScaleX, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
            tension: 30,
          }),
          Animated.spring(dragScaleY, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
            tension: 30,
          }),
        ]).start();
      },
      onPanResponderTerminate: () => {
        // Reset scale back to 1 if the gesture is cancelled/terminated
        Animated.parallel([
          Animated.spring(dragScaleX, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
            tension: 30,
          }),
          Animated.spring(dragScaleY, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
            tension: 30,
          }),
        ]).start();
      },
    })
  );

  // If scrollY is provided, calculate a dynamic offset based on scroll position.
  let combinedTranslateY: Animated.AnimatedAddition<number> | Animated.Value = slideAnim;
  if (scrollY) {
    const cardHeight = 145; // average estimated height of a card including margin
    const inputRange = [
      (index - 2) * cardHeight,
      index * cardHeight,
      (index + 2) * cardHeight,
    ];

    const scrollTranslateY = scrollY.interpolate({
      inputRange,
      outputRange: [15, 0, -15],
      extrapolate: "clamp",
    });

    combinedTranslateY = Animated.add(slideAnim, scrollTranslateY);
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: combinedTranslateY },
          { scaleX: dragScaleX },
          { scaleY: dragScaleY },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

