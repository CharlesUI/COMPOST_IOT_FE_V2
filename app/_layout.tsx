import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AddedDeviceProvider from "@/context/useAddedDeviceContext";

import "../global.css";

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <AddedDeviceProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(modal)/userLog"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="scanner/index" options={{ headerShown: false }} />
        </Stack>
      </AddedDeviceProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
