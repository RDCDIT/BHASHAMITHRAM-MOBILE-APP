import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Animated, Platform, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';

interface PronunciationButtonProps {
  word: string;
}

export default function PronunciationButton({ word }: PronunciationButtonProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ipa, setIpa] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 
    (Platform.OS === "android" ? "http://192.168.1.2:5000" : "http://localhost:5000");

  // Load audio player hook from expo-audio
  const player = useAudioPlayer(audioUrl || '');

  // Track playback status updates from expo-audio player
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      setIsPlaying(status.playing);
    });
    return () => {
      subscription.remove();
    };
  }, [player]);

  useEffect(() => {
    return () => {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
    };
  }, []);

  // Pulse animation while audio is loading or playing
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

  const handlePress = async () => {
    try {
      setIsLoading(true);
      
      // Request pronunciation URL from the backend
      const response = await fetch(`${BACKEND_URL}/api/pronunciation/${encodeURIComponent(word)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch pronunciation");
      }

      if (result.ipa) {
        setIpa(result.ipa);
      }

      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
        // Play the audio stream via player
        player.replace({ uri: result.audioUrl });
        player.play();
      } else if (result.ipa) {
        Alert.alert("IPA Transcription", `Pronunciation: ${result.ipa}`);
      } else {
        Alert.alert("Unavailable", "Pronunciation audio is currently unavailable.");
      }
    } catch (error: any) {
      console.error("Pronunciation streaming error:", error);
      Alert.alert("Error", error.message || "Failed to connect to pronunciation service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          style={[
            styles.playCircle, 
            isPlaying && styles.playCircleActive,
            isLoading && styles.playCircleLoading
          ]} 
          onPress={handlePress} 
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons 
              name={isPlaying ? "volume-high" : "volume-medium"} 
              size={18} 
              color="#FFFFFF" 
            />
          )}
        </TouchableOpacity>
      </Animated.View>
      {ipa && !isPlaying && (
        <Text style={styles.ipaText}>{ipa}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    backgroundColor: "#10B981", // Emerald green active state
  },
  playCircleLoading: {
    backgroundColor: "#9CA3AF", // Gray loading state
  },
  ipaText: {
    fontSize: 14,
    color: "#7C736B",
    fontStyle: 'italic',
  },
});
