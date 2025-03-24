import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  FlatList,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useUser } from "@/context/UserContext";
import { API_URL_BASE } from "@/constants/API_URL";
import useNotifications from "@/hooks/useNotifications";
import { AntDesign } from "@expo/vector-icons"; // Import AntDesign
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import MaterialCommunityIcons
import { MaterialIcons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications"; // Import useToast

// Define the TypeScript interface for the Notification object
interface NotificationItemType {
  _id: string;
  deviceId?: string;
  userId?: string;
  level: "good" | "warning" | "danger" | "info";
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
  createdAt?: string;
  updatedAt?: string;
}

const Notification = () => {
  const { user, updateUser } = useUser();
  const [allNotifications, setAllNotifications] = useState<NotificationItemType[]>([]);
  const [previousNotificationIds, setPreviousNotificationIds] = useState<string[]>([]);

  const {
    fetchDeviceNotifications,
    fetchUserNotifications,
    deviceNotifications,
    userNotifications,
    loadingDevice,
    loadingUser,
    errorDevice,
    errorUser,
    deleteNotification,
  } = useNotifications();

  const toast = useToast(); // Initialize the toast

  console.log("DEVICE", deviceNotifications)
  console.log("USER",userNotifications)

  useEffect(() => {
    if (user?.devices) {
      updateUser({ ...user, selectedDevice: user.devices[0] });
    }
    if (user?.selectedDevice) {
      console.log("FETCHING BOTH")
      fetchDeviceNotifications(user?.selectedDevice);
      fetchUserNotifications(user?._id);
    }
    if(!user?.selectedDevice && user?._id) {
      console.log("FETCHING USER")
      fetchUserNotifications(user?._id);
    }
  }, [user?.selectedDevice, user?._id]);

  useEffect(() => {
    // Combine device and user notifications and sort by timestamp
    const combined = [...(deviceNotifications || []), ...(userNotifications || [])];
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAllNotifications(combined);

    // Update previous notification IDs for toast logic
    setPreviousNotificationIds(combined.map(n => n._id));
  }, [deviceNotifications, userNotifications]);

  useEffect(() => {
    // Show toast notifications for new notifications
    if (allNotifications && previousNotificationIds) {
      const newNotifications = allNotifications.filter(notif => !previousNotificationIds.includes(notif._id));

      newNotifications.forEach((notif) => {
        let type = "default";
        if (notif.level === "good") {
          type = "success";
        } else if (notif.level === "warning") {
          type = "warning";
        } else if (notif.level === "danger") {
          type = "danger";
        } else if (notif.level === "info") {
          type = "info";
        }
        toast.show(notif.message.split(": ")[1], {
          type: type,
          placement: "bottom",
          duration: 3000,
          animationType: "slide-in",
        });
      });
    }
  }, [allNotifications, previousNotificationIds, toast]);

  const handleRemoveNotification = async (id: string) => {
    await deleteNotification(id);
  };

  interface NotificationItemProps {
    item: NotificationItemType;
    onRemove: (id: string) => void;
  }

  const NotificationItem: React.FC<NotificationItemProps> = ({
    item,
    onRemove,
  }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -100) {
            Animated.timing(translateX, {
              toValue: -300,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onRemove(item._id));
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      })
    ).current;

    let iconComponent;
    let bgColorClass = "border-b border-gray-800 bg-[#1E1E1E]";
    switch (item.level) {
      case "good":
        iconComponent = (
          <MaterialCommunityIcons name="hand-okay" size={24} color="green" />
        );
        bgColorClass = "border-b border-green-800 bg-[#0A3622]";
        break;
      case "warning":
        iconComponent = <AntDesign name="warning" size={24} color="orange" />;
        bgColorClass = "border-b border-orange-800 bg-[#47340A]";
        break;
      case "danger":
        iconComponent = (
          <MaterialIcons name="dangerous" size={24} color="red" />
        );
        bgColorClass = "border-b border-red-800 bg-[#441616]";
        break;
      case "info":
        iconComponent = (
          <MaterialIcons name="info-outline" size={24} color="blue" />
        );
        bgColorClass = "border-b border-blue-800 bg-[#142D4C]";
        break;
    }

    const deviceName = item.deviceId || "Admin Notification";
    const notificationTime = new Date(item.timestamp).toLocaleTimeString();

    return (
      <Animated.View
        className={`py-3 ${bgColorClass}`}
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <View className="flex-row items-center justify-between px-4">
          {iconComponent}
          <Text className="flex-1 ml-4 text-white font-semibold">
            {deviceName}
          </Text>
          <Text className="text-xs text-gray-400">{notificationTime}</Text>
        </View>
        <View className="px-4 py-2">
          <Text className="text-sm text-slate-200">
            {item.level === "info" ? item.message : item.message.split(": ")[1]}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: NotificationItemType }) => (
    <NotificationItem item={item} onRemove={handleRemoveNotification} />
  );

  const loadingAll = loadingDevice || loadingUser;
  const errorAll = errorDevice || errorUser;

  return (
    <SafeAreaView className="flex-1 bg-[#2F2C2C]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-800">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color="white" />
        </Pressable>
        <Text className="text-lg font-bold color-white">Notifications</Text>
        <View className="w-6" />
      </View>

      {/* Notification List */}
      {allNotifications?.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-slate-300 text-center">
            No notifications yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={allNotifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          className="px-4"
        />
      )}
    </SafeAreaView>
  );
};

export default Notification;