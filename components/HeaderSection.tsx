// HeaderSection.tsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for consistency
import { useAdmin } from "@/context/AdminContext";
import useNotifications from "@/hooks/useNotifications"; // Import your notification hook

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
  const [notificationCount, setNotificationCount] = useState(0);

  // Use your notifications hook
  const {
    fetchDeviceNotifications,
    fetchUserNotifications,
    deviceNotifications,
    userNotifications,
  } = useNotifications();



  useEffect(() => {
    // Load notifications for the selected device when component mounts
    const loadNotifications = async () => {
      if (user?.selectedDevice) {
        fetchDeviceNotifications(user.selectedDevice);
      }
      if (user?._id) {
        fetchUserNotifications(user._id);
      }
    };

    loadNotifications();
  }, [user?.selectedDevice, user?._id]);

  useEffect(() => {
    // Calculate unread notifications
    const deviceUnread = deviceNotifications?.filter((n) => !n.read) || [];
    const userUnread = userNotifications?.filter((n) => !n.read) || [];

    // If you want to show only device notifications for the selected device
    const totalUnread = user?.selectedDevice
      ? deviceUnread.length + userUnread.length
      : userUnread.length;

    setNotificationCount(totalUnread);
  }, [deviceNotifications, userNotifications, user?.selectedDevice]); // Removed deleteNotification from dependencies

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
            className="p-2 rounded-md relative"
          >
            <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />

            {/* Notification Badge */}
            {notificationCount > 0 && (
              <View className="absolute right-[4px] top-[3px] min-w-[14px] h-[14px] rounded-full bg-red-500 flex items-center justify-center">
                <Text className="text-white text-[6px] font-bold">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={
            !user && !admin
              ? goToUserLog
              : () => console.log("Punta profile page")
          }
          className="min-w-[70px] min-h-[40px] border border-[#4A4A4A] rounded-md justify-center items-center"
        >
          <Text className="text-sm font-semibold text-white p-2">
            {user?.username
              ? user.username
              : admin?.username
              ? admin.username
              : "Log In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderSection;