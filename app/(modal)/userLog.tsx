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
import RegisterBox from "@/components/RegisterBox";
import useLogin from "@/hooks/useLogin";
import useRegister from "@/hooks/useRegister"; // Import the useRegister hook
import { useUser } from "@/context/UserContext";

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
  const { login, loading: loginLoading, error: loginError } = useLogin(); // Renamed loading and error for clarity
  const { register, loading: registerLoading, error: registerError } = useRegister(); // Use the new hook
  const { user } = useUser();

  const [userLog, setUserLog] = useState<Boolean>(true);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity: 1
  const [localLoginError, setLocalLoginError] = useState<string | null>(null); // State for local login errors
  const [localRegisterError, setLocalRegisterError] = useState<string | null>(null); // State for local register errors

  const [logInDetails, setLogInDetails] = useState<LogInDetails>({
    email: "",
    password: "",
  });

  const handleLogInUser = async () => {
    setLocalLoginError(null); // Clear any previous local errors

    if (logInDetails.email.trim() === "" || logInDetails.password.trim() === "") {
      setLocalLoginError("Please fill in all fields");
      return;
    }

    console.log("Logging in...");
    const success = await login(
      logInDetails.email.trim(),
      logInDetails.password.trim()
    );

    if (success) {
      console.log("Login initiated successfully (context will update)");
      setLogInDetails({ email: "", password: "" }); // Clear the form
      router.push("/(tabs)"); // Example navigation to a home screen
      // Navigation will happen in the useEffect hook
    } else {
      console.log("Login failed:", loginError); // The error from useLogin will be available here
      setLocalLoginError(loginError || "Login failed. Please try again.");
    }
  };

  useEffect(() => {
    if (user) {
      console.log("User logged in successfully:", user);
      // router.push('/(tabs)'); // Example navigation to a home screen
    }
  }, [user, router]);

  useEffect(() => {
    if (loginError) {
      console.log("Login hook error:", loginError);
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

    console.log("Registering...");
    const success = await register(
      registerDetails.username.trim(),
      registerDetails.email.trim(),
      registerDetails.password.trim()
    );

    if (success) {
      console.log("Registration successful! Showing alert...");
      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully!",
        [{ text: "OK", onPress: () => setUserLog(true) }] // Go back to login after success
      );
      setRegisterDetails({ email: "", username: "", password: "", confirmPass: "" });
      router.push("/(tabs)"); // Example navigation to a home screen
    } else {
      console.log("Registration failed:", registerError);
      setLocalRegisterError(registerError || "Registration failed. Please try again.");
    }
  };

  useEffect(() => {
    if (registerError) {
      console.log("Registration hook error:", registerError);
      Alert.alert("Registration Error", registerError, [{ text: "OK" }]);
    }
  }, [registerError]);

  const toggleUserLog = () => {
    // Reset Everything
    setLogInDetails({ email: "", password: "" });
    setRegisterDetails({
      email: "",
      username: "",
      password: "",
      confirmPass: "",
    });
    setLocalLoginError(null); // Clear any errors when toggling
    setLocalRegisterError(null);
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300, // Duration for fade-out
      useNativeDriver: true,
    }).start(() => {
      // After fade-out completes, toggle the state and fade in
      setUserLog(!userLog);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700, // Duration for fade-in
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <SafeAreaView className="flex-1 relative bg-[#2F2C2C]">
      {/* Header */}
      <View className="w-full flex-row p-5 justify-between items-center border-gray-200 border-b-[1px] mb-5">
        <Text className=" font-extrabold text-2xl color-white">ACCOUNT</Text>
        <Pressable onPress={() => router.back()} className="">
          <Feather name="x" size={24} color="white" />
        </Pressable>
      </View>

      {/* Animated View */}
      <Animated.View style={{ opacity: fadeAnim, flex: 1, alignItems: "center" }}>
        {userLog ? (
          <LogInBox
            email={logInDetails.email}
            password={logInDetails.password}
            setLogInDetails={setLogInDetails}
            handleLogInUser={handleLogInUser}
            loading={loginLoading} // Use specific loading state
            error={localLoginError} // Use local error for Login Box
          />
        ) : (
          <RegisterBox
            email={registerDetails.email}
            username={registerDetails.username}
            password={registerDetails.password}
            confirmPass={registerDetails.confirmPass}
            setRegisterDetails={setRegisterDetails}
            handleRegisterUser={handleRegisterUser}
            loading={registerLoading} // Pass loading state for registration
            error={localRegisterError} // Pass local error for Register Box
          />
        )}
        {/* Divider */}
        <View>
          <Text className="mb-3 mt-2 w-full text-center text-white font-light italic">
            or
          </Text>
        </View>

        {/* Toggle Button */}
        <View className="w-full items-center">
          <CustomButton
            containerStyles="w-[90%] bg-slate-200 p-4 m-2 rounded-md min-h-[50px]"
            textStyles="font-bold"
            title={
              userLog
                ? loginLoading
                  ? <ActivityIndicator color="white" />
                  : "Register"
                : registerLoading
                  ? <ActivityIndicator color="white" />
                  : "Log In"
            } // Show appropriate loading indicator
            onPress={toggleUserLog}
            disabled={loginLoading || registerLoading} // Disable button while loading
          ></CustomButton>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default UserLog;