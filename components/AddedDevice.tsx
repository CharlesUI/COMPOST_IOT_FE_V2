import { View, Text, Pressable, FlatList, Alert } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext"; // Import useUser
import useClearDevices from "@/hooks/useClearDevices"; // Import the new hook

const AddedDevice = () => {
  const {
    clearDevices,
    loading: clearingDevices,
    error: clearDevicesError,
  } = useClearDevices(); // Use the new hook
  const { updateUser, user } = useUser(); // Get updateUser function
  const router = useRouter(); // Initialize router

  console.log("user in add device", user);
  console.log("addedDevices in AddedDevice", user?.devices); // Add this for debugging

  const handleDevicePress = (deviceNumber: string) => {
    updateUser({
      _id: user?._id,
      username: user?.username,
      email: user?.email,
      devices: user?.devices,
      selectedDevice: deviceNumber
    });
    router.push("/Device"); // Navigate to the Device tab
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
            const success = await clearDevices(user?._id); // Clear all devices
            if (success) {
              updateUser({
                _id: user?._id,
                username: user?.username,
                email: user?.email,
                devices: [],
                selectedDevice: null
              });
              Alert.alert("Success", "All devices cleared successfully!");
              // The UserContext should already be updated by the hook
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
    // Added
    <View className="flex-1 p-6 bg-pink">
      <View className=" flex-row justify-between items-center mb-4">
        <Text className="color-gray-200">Recently Added</Text>
        <Pressable onPress={handleClearAllDevices} disabled={clearingDevices}>
          <Text className="color-gray-200">
            {clearingDevices ? "Clearing..." : "Clear All"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        ListHeaderComponent={<View className="mb-2 border-gray-200"></View>}
        showsVerticalScrollIndicator={false}
        data={user?.devices || []} // Use addedDevices from the context
        renderItem={({ item }) => {
          return (
            <View className="rounded-md mb-2 bg-slate-200 flex-row justify-between items-center p-5">
              <Text className="text-black">{item}</Text>
              <Pressable onPress={() => handleDevicePress(item)}>
                <AntDesign name="right" size={24} color="black" />
              </Pressable>
            </View>
          );
        }}
        keyExtractor={(item) => item} // Adjust keyExtractor
      />
    </View>
  );
};

export default AddedDevice;
