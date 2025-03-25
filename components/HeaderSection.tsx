import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for consistency
import { useAdmin } from "@/context/AdminContext";

interface HeaderProps {
  headerText: string;
  title: string;
}

const COMPOST_IMAGE = require("@/assets/images/COMPOST_IOT.png");

const goToUserLog = () => {
  router.push("/(modal)/userLog"); // Ensure modal route if that's the case
};

const goToUserNotification = () => {
  router.push("/Notification"); // Assuming Notification is a tab
};

const HeaderSection = ({ headerText, title }: HeaderProps) => {
  const { user, logoutUser } = useUser();
  const { admin } = useAdmin();

  return (
    <View className="flex max-h-[80px] flex-row justify-between items-center p-4 bg-[#242424] border-b border-[#4A4A4A]">
      <View className="flex-row items-center">
        <View className="w-[40px] h-[40px] justify-center mr-2">
          <Image
            className="w-full h-full"
            resizeMode="contain"
            source={COMPOST_IMAGE}
          />
        </View>
        <Text className="text-lg font-bold text-white">{headerText}</Text>
      </View>

      <View className="flex-row items-center space-x-2">
        {user && (
          <TouchableOpacity
            onPress={goToUserNotification}
            className="p-2 rounded-md"
          >
            <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={!user && !admin ? goToUserLog : () => console.log("Punta profile page")}
          className="min-w-[70px] min-h-[40px] border border-[#4A4A4A] rounded-md justify-center items-center"
        >
          <Text className="text-sm font-semibold text-white p-2">
            {user?.username ? user.username : admin?.username ? admin.username : "Log In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderSection;