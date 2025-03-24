import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderSection from "@/components/HeaderSection";
import useManageDevices from "@/hooks/useManageDevices";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router"; // Import router for navigation
import { useAdmin } from "@/context/AdminContext";

interface DeviceType {
  _id: string;
  deviceNumber: string;
  realTimeData: any; // Adjust type as needed
  savedTimeFrameData: any[]; // Adjust type as needed
  __v: number;
}

const ManageDevices = () => {
  const {
    devices,
    loading,
    error,
    addingDevice,
    addingError,
    addDevice,
    deletingDeviceId,
    deletingError,
    deleteDevice,
  } = useManageDevices();
  const [newDeviceNumber, setNewDeviceNumber] = useState("");
  const { admin, updateAdmin } = useAdmin();

  console.log("ADMIN IN MANAGE DEVICES", admin)

  const handleAddDevice = () => {
    if (!newDeviceNumber) {
      Alert.alert("Error", "Please enter a device number.");
      return;
    }

    if (newDeviceNumber.length !== 10 || !newDeviceNumber.startsWith("CMPST")) {
      Alert.alert(
        "Error",
        "Device number must be 10 characters long and start with 'CMPST'."
      );
      return;
    }

    addDevice(newDeviceNumber);
    setNewDeviceNumber("");
  };

  const handleDeleteDevice = (deviceId: string) => {
    Alert.alert(
      "Delete Device",
      "Are you sure you want to delete this device?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteDevice(deviceId),
          style: "destructive",
        },
      ]
    );
  };

  const handleDevicePress = (deviceNumber: string) => {
    Alert.alert(
      "Device Statistics",
      `See statistics for device ${deviceNumber}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            updateAdmin({
              _id: admin?._id,
              username: admin?.username,
              title: admin?.title,
              email: admin?.email,
              managedDevices: admin?.managedDevices || [],
              managedUsers: admin?.managedUsers || [],
              selectedDevice: deviceNumber || null // Add selectedDevice with a fallback
            });;
            router.push("/(modal)/AdminDevicesTab");
          },
        }, // Navigate to the statistics page
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#2F2C2C] justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#2F2C2C] justify-center items-center">
        <Text className="text-red-500">Error loading devices: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#2F2C2C]">
      <HeaderSection headerText="Manage Devices" title="Admin" />
      <View className="p-4">
        {/* Add Device Section */}
        <View className="flex-row items-center mb-4">
          <TextInput
            className="flex-1 bg-[#3B3B3B] text-white rounded-md py-2 px-3 mr-2"
            placeholder="New Device Number"
            placeholderTextColor="#777"
            value={newDeviceNumber}
            onChangeText={setNewDeviceNumber}
          />
          <TouchableOpacity
            className={`bg-green-500 py-2 px-4 rounded-md ${
              addingDevice ? "opacity-50" : ""
            }`}
            onPress={handleAddDevice}
            disabled={addingDevice}
          >
            {addingDevice ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold">Add</Text>
            )}
          </TouchableOpacity>
        </View>
        {addingError && (
          <Text className="text-red-500 mb-2">{addingError}</Text>
        )}

        {/* Device List */}
        <FlatList
          data={devices}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleDevicePress(item.deviceNumber)}
            >
              <View className="bg-[#3B3B3B] rounded-md p-4 mb-2 flex-row items-center justify-between">
                <Text className="text-white">{item.deviceNumber}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteDevice(item._id)}
                  className="ml-4"
                  disabled={deletingDeviceId === item._id}
                >
                  {deletingDeviceId === item._id ? (
                    <ActivityIndicator size="small" color="red" />
                  ) : (
                    <Feather name="trash-2" size={20} color="red" />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
        {deletingError && (
          <Text className="text-red-500 mt-2">{deletingError}</Text>
        )}
        {devices.length === 0 && !loading && (
          <Text className="text-gray-400 text-center mt-4">
            No devices found.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ManageDevices;
