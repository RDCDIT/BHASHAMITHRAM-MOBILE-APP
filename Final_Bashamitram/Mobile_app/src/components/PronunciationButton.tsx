/**
 * @file PronunciationButton.tsx
 * @description Button component that fetches pronunciation audio URLs or fallback 
 * on-device Speech synthesis for the Malayalam and English vocabulary database.
 */

import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Animated, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

interface PronunciationButtonProps {
  word: string;
}

/**
 * Public wrapper for the PronunciationButton component.
 * Validates audio capabilities and displays mute fallback alert if needed.
 * 
 * @param {PronunciationButtonProps} props - The component parameters.
 * @returns {React.JSX.Element}
 */
export default function PronunciationButton(props: PronunciationButtonProps) {
  const isSupported = typeof useAudioPlayer === 'function';

  if (!isSupported) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.playCircle} 
          onPress={() => Alert.alert(
            "Native Audio Module Missing", 
            "Audio features require a fresh development build. Please run 'npm run android' or 'npx expo run:android' to rebuild the native client with expo-audio compiled."
          )}
          activeOpacity={0.8}
        >
          <Ionicons name="volume-mute" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return <PronunciationButtonInner {...props} />;
}

/**
 * Inner component rendering the actual interactive audio playback button,
 * handling the request to the pronunciation backend service or Fallback speech synthesis.
 * 
 * @param {PronunciationButtonProps} props - Inner component properties.
 * @returns {React.JSX.Element}
 */
function PronunciationButtonInner({ word }: PronunciationButtonProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ipa, setIpa] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSpeakingLocally, setIsSpeakingLocally] = useState<boolean>(false);

  const [scaleAnim] = React.useState(() => new Animated.Value(1));
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || "";

  // Load audio player hook from expo-audio safely inside inner component
  const player = useAudioPlayer(audioUrl || '');

  // Track playback status updates from expo-audio player
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (audioUrl) {
        setIsPlaying(status.playing);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [player, audioUrl]);

  const isCurrentlyPlaying = isPlaying || isSpeakingLocally;

  useEffect(() => {
    return () => {
      if (pulseLoop.current) {
        pulseLoop.current.stop();
      }
      Speech.stop();
    };
  }, []);

  // Pulse animation while audio is loading or playing
  useEffect(() => {
    if (isCurrentlyPlaying || isLoading) {
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
  }, [isCurrentlyPlaying, isLoading]);

  const handlePress = async () => {
    // Stop local speech if running
    if (isSpeakingLocally) {
      Speech.stop();
      setIsSpeakingLocally(false);
      return;
    }
    // Stop audio player if running
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
      return;
    }

    const targetUrl = `${BACKEND_URL}/api/pronunciation/${encodeURIComponent(word)}`;
    console.log(`📱 [Pronunciation Fetch] Initiating request to URL: "${targetUrl}"`);

    try {
      setIsLoading(true);
      
      // Request pronunciation URL from the backend
      const response = await fetch(targetUrl);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch pronunciation");
      }

      if (result.ipa) {
        setIpa(result.ipa);
      }

      if (result.audioUrl && result.source === 'manual') {
        setAudioUrl(result.audioUrl);
        // Play the manual audio file via player
        player.replace({ uri: result.audioUrl });
        player.play();
      } else {
        // Fallback to local on-device speech synthesis (expo-speech)
        const isMalayalam = (text: string) => /[\u0d00-\u0d7f]/.test(text);
        const lang = isMalayalam(word) ? 'ml-IN' : 'en-US';

        try {
          if (!Speech || typeof Speech.speak !== 'function') {
            console.warn("Speech module is not available on this device.");
            setIsSpeakingLocally(false);
            setIsLoading(false);
            return;
          }

          setIsSpeakingLocally(true);
          try {
            await Speech.stop();
          } catch (e) {}

          Speech.speak(word, {
            language: lang,
            onStart: () => {
              setIsSpeakingLocally(true);
              setIsLoading(false);
            },
            onDone: () => setIsSpeakingLocally(false),
            onStopped: () => setIsSpeakingLocally(false),
            onError: (err) => {
              console.warn("Local Speech synthesis failed:", err);
              setIsSpeakingLocally(false);
            }
          });
        } catch (speechError) {
          console.error("Speech playback error:", speechError);
          setIsSpeakingLocally(false);
          setIsLoading(false);
        }
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
            isCurrentlyPlaying && styles.playCircleActive,
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
              name={isCurrentlyPlaying ? "volume-high" : "volume-medium"} 
              size={18} 
              color="#FFFFFF" 
            />
          )}
        </TouchableOpacity>
      </Animated.View>
      {ipa && !isCurrentlyPlaying && (
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
