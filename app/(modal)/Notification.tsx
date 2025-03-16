import React, { useState, useRef } from "react";
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

const Notification = () => {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Compost Bin Alert",
      message: "Compost bin temperature exceeding safe levels.",
      time: "10:00 AM",
    },
    {
      id: "2",
      title: "Energy Grid Update",
      message: "Local energy grid experiencing temporary fluctuation.",
      time: "11:30 AM",
    },
    {
      id: "3",
      title: "Compost Moisture Low",
      message: "Compost moisture level is critically low.",
      time: "1:00 PM",
    },
    {
      id: "4",
      title: "Solar Panel Output",
      message: "Solar panel energy output below expected levels.",
      time: "2:45 PM",
    },
    {
      id: "5",
      title: "Methane Sensor Warning",
      message: "Methane sensor detected elevated levels.",
      time: "3:30 PM",
    },
    {
      id: "6",
      title: "Compost Bin Full",
      message: "Compost bin is approaching maximum capacity.",
      time: "4:00 PM",
    },
    {
      id: "7",
      title: "Wind Turbine Offline",
      message: "Wind turbine #3 is currently offline.",
      time: "4:30 PM",
    },
    {
      id: "8",
      title: "Compost Turning Required",
      message: "Compost requires turning to maintain aeration.",
      time: "5:00 PM",
    },
  ]);

  const handleRemoveNotification = (id: any) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const NotificationItem = ({ item, onRemove }: any) => {
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
            }).start(() => onRemove(item.id));
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

    return (
      <Animated.View
        className="flex-row justify-between items-center py-3 border-[0.5px] rounded-md p-2 my-2 border-gray-200"
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <View className="flex-1">
          <Text className="text-base text-white font-semibold">
            {item.title}
          </Text>
          <Text className="text-sm text-slate-200">{item.message}</Text>
        </View>
        <Text className="text-xs text-gray-400">{item.time}</Text>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: any) => (
    <NotificationItem item={item} onRemove={handleRemoveNotification} />
  );

  return (
    <SafeAreaView className="flex-1 bg-[#2F2C2C]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color="white" />
        </Pressable>
        <Text className="text-lg font-bold color-white">Notifications</Text>
        <View className="w-6" />
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        className="px-4"
      />
    </SafeAreaView>
  );
};

export default Notification;
