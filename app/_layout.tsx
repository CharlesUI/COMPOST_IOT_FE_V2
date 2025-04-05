import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "@/context/UserContext";
import { AdminProvider } from "@/context/AdminContext";
import "react-native-gesture-handler"

import "../global.css";

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <AdminProvider>
          <UserProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(modal)/userLog"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/adminLog"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/AdminNotifications"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/AdminStatistics"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/AdminSolar"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/AdminCocoStats"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/AdminMixedStats"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/CocoStats"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/MixedStats"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/SolarStats"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen
                name="(modal)/Notification"
                options={{ headerShown: false, presentation: "modal" }}
              />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="scanner/index"
                options={{ headerShown: false }}
              />
            </Stack>
          </UserProvider>
      </AdminProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
