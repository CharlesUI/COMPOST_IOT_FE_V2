import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for consistency
import { router } from "expo-router";

import HeaderSection from "@/components/HeaderSection";
import AdminLogInBox from "@/components/AdminLogInBox";
import useAdminLogin from "@/hooks/useAdminLogin";
import { useAdmin } from "@/context/AdminContext";

export interface AdminLogInDetails {
  username: string;
  password: string;
}

const AdminLog = () => {
  const { login, loading: loginLoading, error: loginError } = useAdminLogin();
  const { admin } = useAdmin();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [localLoginError, setLocalLoginError] = useState<string | null>(null);

  const [logInDetails, setLogInDetails] = useState<AdminLogInDetails>({
    username: "",
    password: "",
  });

  const handleLogInUser = async () => {
    setLocalLoginError(null);

    if (
      logInDetails.username.trim() === "" ||
      logInDetails.password.trim() === ""
    ) {
      setLocalLoginError("Please fill in all fields");
      return;
    }

    const success = await login(
      logInDetails.username.trim(),
      logInDetails.password.trim()
    );

    if (success) {
      setLogInDetails({ username: "", password: "" });
      router.push("/(tabs)/AdminDashboard");
    } else {
      setLocalLoginError(loginError || "Login failed. Please try again.");
    }
  };

  useEffect(() => {
    if (loginError) {
      Alert.alert("Login Error", loginError, [{ text: "OK" }]);
    }
  }, [loginError]);

  return (
    <SafeAreaView className="flex-1 relative bg-[#242424]">
      <View className="w-full flex-row p-5 justify-between items-center border-gray-200 border-b-[1px] mb-5">
      <Text className="text-white text-xl font-bold text-center">Admin Login</Text>
        <Pressable onPress={() => router.push("/")} className="">
          <Feather name="x" size={24} color="white" />
        </Pressable>
      </View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <AdminLogInBox
          username={logInDetails.username}
          password={logInDetails.password}
          setLogInDetails={setLogInDetails}
          handleLogInUser={handleLogInUser}
          loading={loginLoading}
          error={localLoginError}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default AdminLog;
