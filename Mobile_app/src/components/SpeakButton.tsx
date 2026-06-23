import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SpeakButtonProps {
  word: string;
  lang: 'ml' | 'en';
}

export default function SpeakButton({ word, lang }: SpeakButtonProps) {
  const [soundInstance, setSoundInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 
    (Platform.OS === "android" ? "http://192.168.1.2:5000/api/pronounce" : "http://localhost:5000/api/pronounce");

  useEffect(() => {
    return () => {
      if (soundInstance) {
        soundInstance.unloadAsync();
      }
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
    };
  }, [soundInstance]);

  // Handle animation triggers when state changes
  useEffect(() => {
    if (isPlaying || isLoading) {
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
  }, [isPlaying, isLoading]);

  const handlePlayback = async () => {
    try {
      setIsLoading(true);

      if (soundInstance) {
        await soundInstance.unloadAsync();
      }

      const streamUrl = `${BACKEND_URL}?word=${encodeURIComponent(word)}&lang=${lang}`;

      const { Audio } = require('expo-av');
      const { sound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: true }
      );

      setSoundInstance(sound);
      setIsLoading(false);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (!status.isLoaded) return;

        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          setSoundInstance(null);
        }
      });

    } catch (error) {
      setIsLoading(false);
      setIsPlaying(false);
      console.error("Audio streaming error:", error);
      Alert.alert("കണക്ട് ചെയ്യാൻ സാധിച്ചില്ല", "ഉച്ചാരണം ലഭ്യമാക്കുന്നതിൽ തടസ്സം നേരിട്ടു.");
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.playCircle, 
          isPlaying && styles.playCircleActive,
          isLoading && styles.playCircleLoading
        ]} 
        onPress={handlePlayback} 
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons 
            name={isPlaying ? "volume-high" : "play"} 
            size={16} 
            color="#FFFFFF" 
            style={!isPlaying ? { marginLeft: 2 } : {}}
          />
        )}
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
  playCircleLoading: {
    backgroundColor: "#9CA3AF", // Gray while fetching
  },
});