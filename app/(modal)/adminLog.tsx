import React, { useState, useRef, useEffect } from "react"; // Import useEffect
import {
  View,
  Text,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native"; // Import Alert
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import LogInBox from "@/components/LogInBox";
import AdminLogInBox from "@/components/AdminLogInBox";
import RegisterBox from "@/components/RegisterBox";
import useLogin from "@/hooks/useLogin";
import useRegister from "@/hooks/useRegister"; // Import the useRegister hook
import { useUser } from "@/context/UserContext";
import useAdminLogin from "@/hooks/useAdminLogin"
import { useAdmin } from "@/context/AdminContext";

export interface AdminLogInDetails {
  username: string;
  password: string;
}

const AdminLog = () => {
  const { login, loading: loginLoading, error: loginError } = useAdminLogin(); // Renamed loading and error for clarity
  const { admin } = useAdmin();

  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity: 1
  const [localLoginError, setLocalLoginError] = useState<string | null>(null); // State for local login errors

  const [logInDetails, setLogInDetails] = useState<AdminLogInDetails>({
    username: "",
    password: "",
  });

  const handleLogInUser = async () => {
    setLocalLoginError(null); // Clear any previous local errors

    if (logInDetails.username.trim() === "" || logInDetails.password.trim() === "") {
      setLocalLoginError("Please fill in all fields");
      return;
    }

    console.log("Logging in...");
    const success = await login(
      logInDetails.username.trim(),
      logInDetails.password.trim()
    );

    if (success) {
      console.log("Login initiated successfully (context will update)");
      setLogInDetails({ username: "", password: "" }); // Clear the form
      router.push("/(tabs)/AdminDashboard"); // Example navigation to a home screen
      // Navigation will happen in the useEffect hook
    } else {
      console.log("Login failed:", loginError); // The error from useLogin will be available here
      setLocalLoginError(loginError || "Login failed. Please try again.");
    }
  };

  useEffect(() => {
    if (admin) {
      console.log("Admin logged in successfully:", admin);
      // router.push('/(tabs)'); // Example navigation to a home screen
    }
  }, [admin, router]);

  useEffect(() => {
    if (loginError) {
      console.log("Login hook error:", loginError);
      Alert.alert("Login Error", loginError, [{ text: "OK" }]);
    }
  }, [loginError]);

  return (
    <SafeAreaView className="flex-1 relative bg-[#2F2C2C]">
      {/* Header */}
      <View className="w-full flex-row p-5 justify-between items-center border-gray-200 border-b-[1px] mb-5">
        <Text className=" font-extrabold text-2xl color-white">ADMIN</Text>
        <Pressable onPress={() => router.back()} className="">
          <Feather name="x" size={24} color="white" />
        </Pressable>
      </View>

      {/* Animated View */}
      <Animated.View style={{ opacity: fadeAnim, flex: 1, alignItems: "center" }}>

          <AdminLogInBox
            username={logInDetails.username}
            password={logInDetails.password}
            setLogInDetails={setLogInDetails}
            handleLogInUser={handleLogInUser}
            loading={loginLoading} // Use specific loading state
            error={localLoginError} // Use local error for Login Box
          />
        
      </Animated.View>
    </SafeAreaView>
  );
};

export default AdminLog;