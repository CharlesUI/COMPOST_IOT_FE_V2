import { View, Text, Pressable, FlatList, Alert } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { DeviceTextProp } from "@/app/(tabs)";
import { useRouter } from "expo-router";

interface AddedDevicesProps {
  addedDevices: DeviceTextProp[] | null;
  setAddedDevices: React.Dispatch<
    React.SetStateAction<DeviceTextProp[] | null>
  >;
}

const AddedDevice = ({ addedDevices, setAddedDevices }: AddedDevicesProps) => {
  const router = useRouter(); // Initialize router

  const handleDevicePress = (deviceId: string) => {

    const validDeviceIds = ["CMPST10923", "CMPST18276", "CMPST19284"]; // Array of valid device IDs
    if (!validDeviceIds.includes(deviceId)) {
      Alert.alert("Error", "Invalid device ID.");
      return;
    }

    router.push("/Device"); // Navigate to the Device tab (replace "/device" with your route)
  };

  return (
    // Added
    <View className="flex-1 p-5 bg-pink">
      <View className=" flex-row justify-between items-center mb-4">
        <Text>Recently Added</Text>
        <Pressable onPress={() => setAddedDevices(null)}>
          <Text>Clear</Text>
        </Pressable>
      </View>

      <FlatList
        // Add a listHeader to not make an error using scrollView
        ListHeaderComponent={
          <View className="border-b-2 border-gray-200"></View>
        }
        showsVerticalScrollIndicator={false}
        data={addedDevices}
        renderItem={({ item }) => {
          return (
            <View className="rounded-md mb-2 bg-white flex-row justify-between items-center p-5">
              <Text className="">{item.deviceId}</Text>
              <Pressable onPress={() => handleDevicePress(item.deviceId)}>
                <AntDesign name="right" size={24} color="black" />
              </Pressable>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
        // contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

export default AddedDevice;
