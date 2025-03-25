import { View, Text, Pressable, FlatList, Alert, ActivityIndicator } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for consistency
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";
import useClearDevices from "@/hooks/useClearDevices";

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
        devices: user?.devices,
        selectedDevice: deviceNumber
       });
    router.push("/Device");
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
                  devices: [],            
                  selectedDevice: null              
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
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white font-semibold">Recently Added</Text>
        <Pressable onPress={handleClearAllDevices} disabled={clearingDevices}>
          {clearingDevices ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-gray-400">Clear All</Text>
          )}
        </Pressable>
      </View>

      <FlatList
        ListHeaderComponent={<View className="mb-2 border-b border-[#4A4A4A] pb-2"></View>}
        showsVerticalScrollIndicator={false}
        data={user?.devices || []}
        renderItem={({ item }) => (
          <View className="rounded-lg mb-2 bg-[#3A3A3A] flex-row justify-between items-center p-4 border border-[#4A4A4A]">
            <Text className="text-white">{item}</Text>
            <Pressable onPress={() => handleDevicePress(item)}>
              <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
            </Pressable>
          </View>
        )}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

export default AddedDevice;