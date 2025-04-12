import {
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";
import useClearDevices from "@/hooks/useClearDevices";
import { LinearGradient } from "expo-linear-gradient";

const AddedDevice = () => {
  const {
    clearDevices,
    loading: clearingDevices,
    error: clearDevicesError,
  } = useClearDevices();
  const { updateUser, user } = useUser();
  const router = useRouter();

  const handleDevicePress = (deviceNumber: string) => {
    updateUser({
      _id: user?._id,
      username: user?.username,
      email: user?.email,
      title: user?.title,
      devices: user?.devices,
      selectedDevice: deviceNumber,
    });
    router.replace("/Statistics");
  };

  const handleClearAllDevices = () => {
    Alert.alert(
      "Clear Devices",
      "Are you sure you want to clear all added devices?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Clear All",
          onPress: async () => {
            const success = await clearDevices(user?._id);
            if (success) {
              updateUser({
                _id: user?._id,
                username: user?.username,
                email: user?.email,
                title: user?.title,
                devices: [],
                selectedDevice: null,
              });
              Alert.alert("Success", "All devices cleared successfully!");
            } else if (clearDevicesError) {
              Alert.alert("Error", clearDevicesError);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View className="flex-1 px-2">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Ionicons name="hardware-chip-outline" size={22} color="#6366F1" />
          <Text className="text-white font-bold text-lg ml-2">Your Devices</Text>
        </View>
        <Pressable 
          onPress={handleClearAllDevices} 
          disabled={clearingDevices}
          className="bg-[#333333] px-3 py-1 rounded-full flex-row items-center"
        >
          {clearingDevices ? (
            <ActivityIndicator color="#6366F1" size="small" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={16} color="#F87171" />
              <Text className="text-gray-300 text-sm ml-1">Clear All</Text>
            </>
          )}
        </Pressable>
      </View>

      {(user?.devices?.length === 0 || !user?.devices) ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="add-circle-outline" size={60} color="#6366F1" />
          <Text className="text-gray-400 text-center mt-4">No devices added yet.</Text>
          <Text className="text-gray-500 text-center">Connect a device to get started</Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={user?.devices || []}
          ListHeaderComponent={
            <View className="mb-4 border-b border-[#4A4A4A] pb-2">
              <Text className="text-gray-400 text-sm">Select a device to view statistics</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = user?.selectedDevice === item;
            return (
              <Pressable
                onPress={() => handleDevicePress(item)}
                className={`mb-3 rounded-xl overflow-hidden`}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={['#4F46E5', '#3730A3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="p-4 rounded-xl"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="bg-white/20 rounded-full p-2 mr-3">
                          <Ionicons name="bluetooth" size={20} color="white" />
                        </View>
                        <View>
                          <Text className="text-white font-bold">{item}</Text>
                          <Text className="text-indigo-200 text-xs">Currently selected</Text>
                        </View>
                      </View>
                      <View className="bg-white/20 rounded-full p-1">
                        <Ionicons name="checkmark" size={18} color="white" />
                      </View>
                    </View>
                  </LinearGradient>
                ) : (
                  <View className="bg-[#2A2A2A] p-4 rounded-xl border border-[#3A3A3A]">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="bg-[#3A3A3A] rounded-full p-2 mr-3">
                          <Ionicons name="bluetooth-outline" size={20} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-300">{item}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                    </View>
                  </View>
                )}
              </Pressable>
            );
          }}
          keyExtractor={(item) => item}
        />
      )}
    </View>
  );
};

export default AddedDevice;