import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "@/context/UserContext";
import { AdminProvider } from "@/context/AdminContext";
import { Toast, ToastProvider } from "react-native-toast-notifications";

import "../global.css";

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <AdminProvider>
        <ToastProvider>
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
                name="(modal)/AdminDevicesTab"
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
        </ToastProvider>
      </AdminProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
