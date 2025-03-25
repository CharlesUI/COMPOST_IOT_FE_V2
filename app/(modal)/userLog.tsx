import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for consistency
import { router } from "expo-router";

import HeaderSection from "@/components/HeaderSection";
import LogInBox from "@/components/LogInBox";
import RegisterBox from "@/components/RegisterBox";
import useLogin from "@/hooks/useLogin";
import useRegister from "@/hooks/useRegister";
import { useUser } from "@/context/UserContext";
import { Feather } from "@expo/vector-icons";

export interface LogInDetails {
  email: string;
  password: string;
}

export interface RegisterDetails {
  email: string;
  username: string;
  password: string;
  confirmPass: string;
}

const UserLog = () => {
  const { login, loading: loginLoading, error: loginError } = useLogin();
  const {
    register,
    loading: registerLoading,
    error: registerError,
  } = useRegister();
  const { user } = useUser();

  const [userLog, setUserLog] = useState<Boolean>(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [localLoginError, setLocalLoginError] = useState<string | null>(null);
  const [localRegisterError, setLocalRegisterError] = useState<string | null>(
    null
  );

  const [logInDetails, setLogInDetails] = useState<LogInDetails>({
    email: "",
    password: "",
  });

  const handleLogInUser = async () => {
    setLocalLoginError(null);

    if (
      logInDetails.email.trim() === "" ||
      logInDetails.password.trim() === ""
    ) {
      setLocalLoginError("Please fill in all fields");
      return;
    }

    const success = await login(
      logInDetails.email.trim(),
      logInDetails.password.trim()
    );

    if (success) {
      setLogInDetails({ email: "", password: "" });
      router.push("/(tabs)");
    } else {
      setLocalLoginError(loginError || "Login failed. Please try again.");
    }
  };

  useEffect(() => {
    if (loginError) {
      Alert.alert("Login Error", loginError, [{ text: "OK" }]);
    }
  }, [loginError]);

  const [registerDetails, setRegisterDetails] = useState<RegisterDetails>({
    email: "",
    username: "",
    password: "",
    confirmPass: "",
  });

  const handleRegisterUser = async () => {
    setLocalRegisterError(null);

    if (
      registerDetails.email.trim() === "" ||
      registerDetails.username.trim() === "" ||
      registerDetails.password.trim() === "" ||
      registerDetails.confirmPass.trim() === ""
    ) {
      setLocalRegisterError("Please fill in all fields");
      return;
    }

    if (registerDetails.password !== registerDetails.confirmPass) {
      setLocalRegisterError("Passwords do not match");
      return;
    }

    const success = await register(
      registerDetails.username.trim(),
      registerDetails.email.trim(),
      registerDetails.password.trim()
    );

    if (success) {
      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully!",
        [{ text: "OK", onPress: () => setUserLog(true) }]
      );
      setRegisterDetails({
        email: "",
        username: "",
        password: "",
        confirmPass: "",
      });
      router.push("/(tabs)");
    } else {
      setLocalRegisterError(
        registerError || "Registration failed. Please try again."
      );
    }
  };

  useEffect(() => {
    if (registerError) {
      Alert.alert("Registration Error", registerError, [{ text: "OK" }]);
    }
  }, [registerError]);

  const toggleUserLog = () => {
    setLogInDetails({ email: "", password: "" });
    setRegisterDetails({
      email: "",
      username: "",
      password: "",
      confirmPass: "",
    });
    setLocalLoginError(null);
    setLocalRegisterError(null);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setUserLog(!userLog);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <SafeAreaView className="flex-1 relative bg-[#242424]">
      {/* Header */}

      <View className="w-full flex-row p-5 justify-between items-center border-gray-200 border-b-[1px] mb-5">
        <Text className=" font-extrabold text-2xl color-white">ACCOUNT</Text>

        <Pressable onPress={() => router.back()} className="">
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
        {userLog ? (
          <LogInBox
            email={logInDetails.email}
            password={logInDetails.password}
            setLogInDetails={setLogInDetails}
            handleLogInUser={handleLogInUser}
            loading={loginLoading}
            error={localLoginError}
          />
        ) : (
          <RegisterBox
            email={registerDetails.email}
            username={registerDetails.username}
            password={registerDetails.password}
            confirmPass={registerDetails.confirmPass}
            setRegisterDetails={setRegisterDetails}
            handleRegisterUser={handleRegisterUser}
            loading={registerLoading}
            error={localRegisterError}
          />
        )}
        {/* Divider */}
        <View className="mt-4">
          <Text className="mb-3 mt-2 w-full text-center text-gray-400 font-light italic">
            or
          </Text>
        </View>

        {/* Toggle Button */}
        <View className="w-full items-center">
          <TouchableOpacity
            onPress={toggleUserLog}
            className={`w-[90%] bg-[#3A3A3A] p-4 m-2 rounded-lg items-center justify-center min-h-[50px] ${
              loginLoading || registerLoading ? "opacity-70" : ""
            }`}
            disabled={loginLoading || registerLoading}
          >
            {loginLoading || registerLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-bold text-white">
                {userLog ? "Register" : "Log In"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default UserLog;
