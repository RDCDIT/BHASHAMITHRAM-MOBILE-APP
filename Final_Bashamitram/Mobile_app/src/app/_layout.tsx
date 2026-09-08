/**
 * @file _layout.tsx
 * @description Root layout component that sets up the global theme providers, 
 * loads custom fonts, handles the splash screen visibility, and decides 
 * whether to render the floating background letters based on the active path.
 */


import { DefaultTheme, Stack, ThemeProvider, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import FloatingLettersBackground from "../components/FloatingLettersBackground";

// Prevent the splash screen from automatically hiding before assets/fonts are loaded.
SplashScreen.preventAutoHideAsync();

/**
 * RootLayout is the top-level layout component for the application.
 * It manages global settings like theme and custom Malayalam fonts.
 * 
 * @returns {React.JSX.Element | null} The themed application layout, or null if fonts are not loaded yet.
 */
export default function RootLayout() {
  // Load custom Noto Sans Malayalam fonts
  const [fontsLoaded] = useFonts({
    NotoSansMalayalam: require("../../assets/fonts/NotoSansMalayalam-VariableFont_wdth,wght.ttf"),
  });

  const pathname = usePathname();

  // Hide the splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Render nothing (splash screen remains visible) if fonts aren't loaded yet
  if (!fontsLoaded) {
    return null;
  }

  // Determine whether to display the animated floating letters background
  const shouldShowBackground = !(
    pathname.includes("/admin") ||
    pathname === "/settings" ||
    pathname === "/suggest-word"
  );

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: "#F9F6F1" }}>
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

