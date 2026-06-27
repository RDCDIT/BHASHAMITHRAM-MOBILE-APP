import { DefaultTheme, Stack, ThemeProvider, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import FloatingLettersBackground from "../components/FloatingLettersBackground";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSansMalayalam: require("../../assets/fonts/NotoSansMalayalam-VariableFont_wdth,wght.ttf"),
  });

  const pathname = usePathname();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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
