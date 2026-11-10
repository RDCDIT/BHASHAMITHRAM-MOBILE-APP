/**
 * @file _layout.tsx
 * @description Root layout component that sets up the global theme providers, 
 * loads custom fonts, handles the splash screen visibility, and decides 
 * whether to render the floating background letters based on the active path.
 */


import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import FloatingLettersBackground from "../components/FloatingLettersBackground";
import LoadingScreen from "../components/LoadingScreen";
import { clearAppTempCache } from "../utils/cacheManager";

// Dismiss native splash screen immediately so our branded LoadingScreen displays from the first frame
SplashScreen.hideAsync().catch(() => {});

/**
 * RootLayout is the top-level layout component for the application.
 * It manages global settings like theme, custom Malayalam fonts, and the initial loading screen.
 * 
 * @returns {React.JSX.Element} The themed application layout or the custom LoadingScreen.
 */
export default function RootLayout() {
  // Load custom Noto Sans Malayalam fonts
  const [fontsLoaded] = useFonts({
    NotoSansMalayalam: require("../../assets/fonts/NotoSansMalayalam-VariableFont_wdth,wght.ttf"),
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Hide the native splash screen immediately so our custom LoadingScreen renders
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Prepare app and clear temporary caches
  useEffect(() => {
    if (fontsLoaded) {
      clearAppTempCache().catch(() => {});
      // Allow a brief display window for the branded loading animation
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  // Render the branded loading page while loading fonts and initializing
  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <LoadingScreen />
      </View>
    );
  }

  // Display the universal background across the application
  const shouldShowBackground = true;

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <StatusBar style="dark" />
        {shouldShowBackground && <FloatingLettersBackground />}
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </View>
    </ThemeProvider>
  );
}


