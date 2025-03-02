import { View, Text, Pressable, Animated } from "react-native";
import React, { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import LogInBox from "@/components/LogInBox";
import RegisterBox from "@/components/RegisterBox";

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
  const [userLog, setUserLog] = useState<Boolean>(true);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity: 1

  const [logInDetails, setLogInDetails] = useState<LogInDetails>({
    email: "",
    password: "",
  });
  const [registerDetails, setRegisterDetails] = useState<RegisterDetails>({
    email: "",
    username: "",
    password: "",
    confirmPass: "",
  });

  const toggleUserLog = () => {
    // Reset Everything
    setLogInDetails({ email: "", password: "" });
    setRegisterDetails({
      email: "",
      username: "",
      password: "",
      confirmPass: "",
    });
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
          <Feather name="x" size={24} color="black" />
        </Pressable>
      </View>

      {/* Animated View */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {userLog ? (
          <LogInBox
            email={logInDetails.email}
            password={logInDetails.password}
            setLogInDetails={setLogInDetails}
          />
        ) : (
          <RegisterBox
            email={registerDetails.email}
            username={registerDetails.username}
            password={registerDetails.password}
            confirmPass={registerDetails.confirmPass}
            setRegisterDetails={setRegisterDetails}
          />
        )}
        {/* Divider */}
        <View>
          <Text className="w-full text-center font-light italic">or</Text>
        </View>

        {/* Toggle Button */}
        <View className="w-full">
          <View className=" items-center bg-slate-200 p-5 m-2 rounded-md">
            <CustomButton
              containerStyles="w-full min-h-[50px] bg-gray border-[1px]"
              title={userLog ? "Register" : "Log In"}
              onPress={toggleUserLog}
            ></CustomButton>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default UserLog;
