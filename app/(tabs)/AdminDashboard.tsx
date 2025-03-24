import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderSection from "@/components/HeaderSection";
import React from "react";
import { useNavigation } from "@react-navigation/native"; // If you're using @react-navigation

const AdminDashboard = () => {
  const navigation = useNavigation(); // If you're using @react-navigation

  const handleNavigation = (tab: any) => {
    // Replace with your actual navigation logic using router from expo-router
    console.log(`Maps to ${tab}`);
    // Example using @react-navigation:
    // navigation.navigate(tab);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
        <HeaderSection headerText="Dashboard" title="Admin" />
      <ScrollView className="flex-1 p-4 space-y-4">

        {/* 2x2 Grid */}
        <View className="flex-row flex-wrap justify-between">
          {/* Users Block */}
          <Pressable
            onPress={() => handleNavigation("Users")}
            className="bg-white p-6 rounded-md shadow-md w-[48%] mb-4"
          >
            <Text className="text-xl font-bold text-blue-500 mb-1">Users</Text>
            <Text className="text-gray-600">Total: [Fetch Count]</Text>
            <Text className="text-gray-600">New: [Fetch Count]</Text>
          </Pressable>

          {/* Devices Block */}
          <Pressable
            onPress={() => handleNavigation("Devices")}
            className="bg-white p-6 rounded-md shadow-md w-[48%] mb-4"
          >
            <Text className="text-xl font-bold text-green-500 mb-1">Devices</Text>
            <Text className="text-gray-600">Total: [Fetch Count]</Text>
            <Text className="text-gray-600">Active: [Fetch Count]</Text>
          </Pressable>

          {/* Performance Block */}
          <Pressable
            onPress={() => handleNavigation("Performance")}
            className="bg-white p-6 rounded-md shadow-md w-[48%] mb-4"
          >
            <Text className="text-xl font-bold text-orange-500 mb-1">Performance</Text>
            <Text className="text-gray-600">Avg Battery: [Fetch Data]</Text>
            <Text className="text-gray-600">Avg Solar: [Fetch Data]</Text>
          </Pressable>

          {/* Notifications Block */}
          <Pressable
            onPress={() => handleNavigation("Notifications")}
            className="bg-white p-6 rounded-md shadow-md w-[48%] mb-4"
          >
            <Text className="text-xl font-bold text-red-500 mb-1">Notifications</Text>
            <Text className="text-gray-600">Total: [Fetch Count]</Text>
            <Text className="text-gray-600">Unread: [Fetch Count]</Text>
          </Pressable>
        </View>

        {/* Overview Section (Below the Grid) */}
        <View className="bg-white p-6 rounded-md shadow-md">
          <Text className="text-xl font-bold text-gray-700 mb-2">Overview</Text>
          <View className="mb-3">
            <Text className="font-semibold text-gray-700 mb-1">Key Metrics</Text>
            <Text className="text-gray-600">Overall System Health: [Indicator]</Text>
            <Text className="text-gray-600">Total Users: [Fetch Count]</Text>
            <Text className="text-gray-600">Total Devices: [Fetch Count]</Text>
          </View>
          <View className="mb-3">
            <Text className="font-semibold text-gray-700 mb-1">Recent Activity</Text>
            <Text className="text-gray-600">Latest Registered Users: [List]</Text>
            <Text className="text-gray-600">Recent Notifications: [List]</Text>
          </View>
          {/* Add more overview content as needed */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;