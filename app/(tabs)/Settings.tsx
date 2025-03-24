import React, { useRef, useEffect, useState } from "react"; // Import useState
import { View, Text, Animated, Easing, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import HeaderSection from "@/components/HeaderSection";
import { useUser } from "@/context/UserContext";
import { useAdmin } from "@/context/AdminContext";

const Settings = () => {
  const { user, logoutUser } = useUser();
  const { admin, logoutAdmin } = useAdmin();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [adminClickCount, setAdminClickCount] = useState(0); // State for click count

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]); // Added slideAnim to dependency array

  const handleLogout = () => {
    console.log("Logging out with animation...");

    Animated.timing(slideAnim, {
      toValue: -500,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      logoutUser();
      logoutAdmin();
      setAdminClickCount(0);
      router.push("/(tabs)");
    });
  };

  console.log("User:", user);

  const animatedStyle = {
    transform: [{ translateX: slideAnim }],
  };

  const openAdminPanel = () => {
    setAdminClickCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    if (adminClickCount === 5) {
      Alert.alert("Admin Panel", "You are now opening the admin panel");
      setTimeout(() => {
        router.push("/adminLog");
        setAdminClickCount(0);
      }, 500); // Added a small delay for the alert to be noticed
    } else if (adminClickCount > 5) {
      // Reset counter if it exceeds 5 to avoid repeated alerts
      setAdminClickCount(0);
    }
  }, [adminClickCount, router]);

  return (
    <SafeAreaView className="flex-1 bg-[#2F2C2C]">
      <HeaderSection headerText="Settings" title="Account" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-between flex-col w-full p-6 space-y-4">
          <View>
            {user && (
              <View className="bg-slate-200 rounded-md p-4">
                <Text className="text-lg font-semibold text-black">
                  User Details
                </Text>
                <View className="border-t border-gray-700 pt-[4px]">
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-black font-medium">Username</Text>
                    <Text className="text-gray-800">{user.username}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-black font-medium">Email</Text>
                    <Text className="text-gray-800">{user.email}</Text>
                  </View>
                  {/* You can add more user details here */}
                </View>
              </View>
            )}
          </View>
          <View>
            {admin && (
              <View className="bg-slate-200 rounded-md p-4">
                <Text className="text-lg font-semibold text-black">
                  {user?.username
                    ? "User Details"
                    : admin?.username
                    ? "Admin Details"
                    : ""}
                </Text>
                <View className="border-t border-gray-700 pt-[4px]">
                  {admin && (
                    <View className="flex-row justify-between items-center pt-2">
                      <Text className="text-black font-medium">Title</Text>
                      <Text className="text-gray-800">{admin.title}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-black font-medium">Username</Text>
                    <Text className="text-gray-800">{admin.username}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-black font-medium">Email</Text>
                    <Text className="text-gray-800">{admin.email}</Text>
                  </View>
                  {/* You can add more user details here */}
                </View>
              </View>
            )}
          </View>

          {/* App Information Section */}
          <View className="bg-slate-200 rounded-md my-2 p-4">
            <View className="">
              {/* Version */}

              <View className="border-b-[0.5px] flex-row justify-between items-center py-2">
                <Text className="text-black font-medium">
                  Application ID:
                </Text>
                <CustomButton
                  title={"CompostSenseV1.0"}
                  onPress={openAdminPanel}
                  containerStyles=""
                  textStyles="text-gray-800"
                />
              </View>

              {/* Capstone Project Of */}
              <View className="flex-col py-2">
                <Text className="text-start text-black font-medium">
                  Capstone Project:
                </Text>
                <View>
                  <Text className="text-gray-800 text-center font-semibold mt-2">
                    Design and Development of an IoT-Based System for Solar and
                    Thermal Energy Conversion to Electricity from Composting of
                    Food and Agricultural Waste
                  </Text>
                </View>
              </View>

              {/* Developed By */}
              <View className="flex-col py-2 mt-2">
                <View>
                  <Text className="text-gray-800 text-center font-semibold">
                    Team Thermo:
                  </Text>
                  <Text className="text-gray-800 text-center">
                    Bernardo, Cedric Levy F.
                  </Text>
                  <Text className="text-gray-800 text-center">
                    Laurente, Russel Carlou P.
                  </Text>
                  <Text className="text-gray-800 text-center">
                    Padua, Nathan John A.
                  </Text>
                  <Text className="text-gray-800 text-center">
                    Verano, Gia Jenica G.
                  </Text>
                  <Text className="text-gray-800 text-center">
                    Vivas, Charles David B.
                  </Text>
                  {/* Add other team members here */}
                  {/* <Text className="text-gray-800">John Doe</Text>
                    <Text className="text-gray-800">Jane Smith</Text> */}
                </View>
              </View>
              <View className="flex-col py-2 mt-2">
                <View>
                  <Text className="text-gray-800 text-center font-semibold">
                    Developer:
                  </Text>
                  <Text className="text-gray-800 text-center">
                    Vivas, Charles David B.
                  </Text>
                  {/* Add other team members here */}
                  {/* <Text className="text-gray-800">John Doe</Text>
                    <Text className="text-gray-800">Jane Smith</Text> */}
                </View>
              </View>

              {/* Copyright */}
              <View className="flex-row justify-between py-2 border-t-[0.5px]">
                <Text className="text-start text-black font-medium">
                  Copyright:
                </Text>
                <Text className="">
                  © {new Date().getFullYear()} Team Thermo
                </Text>
              </View>

              {/* You can add more app-related information here */}
            </View>
          </View>

          {/* Logout Button */}
          {user && (
            <View className="w-full items-center">
              <CustomButton
                title={"LOGOUT"}
                onPress={handleLogout}
                containerStyles="w-full min-h-[40px] border-[0.5px] border-red-500 rounded-md bg-gray-200"
                textStyles="text-[14px] p-4 font-bold text-red"
              />
            </View>
          )}
          {admin && (
            <View className="w-full items-center">
              <CustomButton
                title={"LOGOUT"}
                onPress={handleLogout}
                containerStyles="w-full min-h-[40px] border-[0.5px] border-red-500 rounded-md bg-gray-200"
                textStyles="text-[14px] p-4 font-bold text-red"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
