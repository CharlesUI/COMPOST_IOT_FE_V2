import React, { useRef, useEffect } from "react"; // Import useRef and useEffect
import { View, Text, Animated, Easing } from "react-native"; // Import Animated and Easing
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import HeaderSection from "@/components/HeaderSection";
import { useUser } from "@/context/UserContext";

const Settings = () => {
  const { user, logoutUser } = useUser();
  const slideAnim = useRef(new Animated.Value(0)).current; // Initial value for slide animation (0 = fully in view)

  useEffect(() => {
    // Optional: You might want a slight delay or initial animation when the settings page loads
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  });

  const handleLogout = () => {
    console.log("Logging out with animation...");

    Animated.timing(slideAnim, {
      toValue: -500, // Slide out to the left (adjust value as needed)
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      logoutUser();
      router.push("/(tabs)");
    });
  };

  console.log("User:", user);

  const animatedStyle = {
    transform: [{ translateX: slideAnim }],
  };

  return (
    <SafeAreaView className="flex-1 bg-[#2F2C2C]">
      <Animated.View style={[animatedStyle, { flex: 1, alignItems: "center" }]}>
        <HeaderSection headerText="Settings" title="Account" />
        <View className="flex-1 justify-between flex-col w-full p-6 space-y-4">
          <View>
            {user ? (
              <View className="bg-slate-200 rounded-md p-4">
                <Text className="text-lg font-semibold text-black mb-2">
                  User Details
                </Text>
                <View className="border-t border-gray-700 pt-2">
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-black font-medium">Username</Text>
                    <Text className="text-gray-800">{user.username}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-black font-medium">Email</Text>
                    <Text className="text-gray-800">{user.email}</Text>
                  </View>
                  {/* You can add more user details here */}
                </View>
              </View>
            ) : null}

            {/* App Information Section */}
            <View className="bg-slate-200 rounded-md my-2 p-4">
              <Text className="text-lg font-semibold text-black mb-2">
                App Information
              </Text>
              <View className="border-t border-gray-700 pt-2">
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-black font-medium">Version</Text>
                  <Text className="text-gray-800">1.0.0</Text>
                </View>
                {/* You can add more app-related information here */}
              </View>
            </View>
          </View>

          {/* Logout Button */}
          {user && (
            <View className="w-full items-center">
              <CustomButton
                title={"LOGOUT"}
                onPress={handleLogout}
                containerStyles="w-full bg-gray-200 min-h-[40px] border-[0.5px] border-red-500 rounded-md"
                textStyles="text-[14px] p-4 font-bold text-black"
              />
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Settings;
