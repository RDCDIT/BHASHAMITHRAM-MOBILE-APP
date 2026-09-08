/**
 * @file SpeakButton.tsx
 * @description Native text-to-speech speak button utilizing expo-speech library for local speech synthesis.
 */

import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

interface SpeakButtonProps {
  word: string;
  lang: 'ml' | 'en';
}

/**
 * SpeakButton handles the local device audio speech output of target terms in English or Malayalam.
 * 
 * @param {SpeakButtonProps} props - The component parameters.
 * @returns {React.JSX.Element}
 */
export default function SpeakButton({ word, lang }: SpeakButtonProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [scaleAnim] = React.useState(() => new Animated.Value(1));
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
      Speech.stop();
    };
  }, []);

  // Handle animation triggers when state changes
  useEffect(() => {
    if (isPlaying) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.12,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 500,
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
  }, [isPlaying]);

  /**
 * Initiates speech playbacks or interrupts them if already speaking.
 */
  const handlePlayback = async () => {
    if (!word || typeof word !== 'string' || word.trim() === '') {
      return;
    }

    if (isPlaying) {
      try {
        await Speech.stop();
      } catch (error) {
        console.warn("Error stopping speech:", error);
      }
      setIsPlaying(false);
      return;
    }

    try {
      if (!Speech || typeof Speech.speak !== 'function') {
        console.warn("Speech module is not available on this device.");
        return;
      }

      const speechLang = lang === 'ml' ? 'ml-IN' : 'en-US';
      setIsPlaying(true);
      
      try {
        await Speech.stop();
      } catch (e) {}

      Speech.speak(word, {
        language: speechLang,
        onStart: () => setIsPlaying(true),
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: (err) => {
          console.warn("Local Speech synthesis failed:", err);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      setIsPlaying(false);
      console.error("Audio speaking error:", error);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.playCircle, 
          isPlaying && styles.playCircleActive
        ]} 
        onPress={handlePlayback} 
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isPlaying ? "volume-high" : "play"} 
          size={16} 
          color="#FFFFFF" 
          style={!isPlaying ? { marginLeft: 2 } : {}}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2B2C51",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  playCircleActive: {
    backgroundColor: "#10B981", // Beautiful Emerald Green when playing
  },
});