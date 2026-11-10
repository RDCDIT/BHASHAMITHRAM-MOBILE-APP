/**
 * @file SpeakButton.tsx
 * @description Highly responsive audio pronunciation button powered by speechService.
 * Supports authentic audio pronunciation for both Malayalam and English across Android, iOS, and Web.
 */

import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { speechService, SupportedLang } from '../services/speechService';

interface SpeakButtonProps {
  word: string;
  lang?: SupportedLang;
  size?: number;
}

/**
 * SpeakButton handles the local device audio speech output of target terms in English or Malayalam.
 * 
 * @param {SpeakButtonProps} props - The component parameters.
 * @returns {React.JSX.Element}
 */
export default function SpeakButton({ word, lang, size = 32 }: SpeakButtonProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const cleanTarget = speechService.cleanWord(word);

  // Sync with global speechService state
  useEffect(() => {
    // Initial check
    setIsPlaying(speechService.isWordPlaying(word));

    const unsubscribe = speechService.subscribe((activeWord, isSpeaking) => {
      if (activeWord === cleanTarget && isSpeaking) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [cleanTarget, word]);

  // Handle pulse animation during playback
  useEffect(() => {
    if (isPlaying) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
    };
  }, [isPlaying]);

  const handlePlayback = async () => {
    if (!word || typeof word !== 'string' || word.trim() === '') {
      return;
    }

    try {
      await speechService.speak(word, lang, {
        onStart: () => setIsPlaying(true),
        onDone: () => setIsPlaying(false),
        onError: (err) => {
          console.warn(`[SpeakButton] Speech playback notice for "${word}":`, err?.message || err);
          setIsPlaying(false);
        },
      });
    } catch (error) {
      setIsPlaying(false);
      console.warn("[SpeakButton] Failed to trigger speech:", error);
    }
  };

  const buttonSize = size;
  const iconSize = Math.max(15, Math.round(buttonSize * 0.52));

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.playCircle,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
          isPlaying && styles.playCircleActive,
        ]}
        onPress={handlePlayback}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={isPlaying ? "volume-high" : "volume-medium"}
          size={iconSize}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  playCircle: {
    backgroundColor: "#2563EB", // Vibrant Royal Blue matching brand UI
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  playCircleActive: {
    backgroundColor: "#10B981", // Emerald Green pulse when speaking
    shadowColor: "#10B981",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
});