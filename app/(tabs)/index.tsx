import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for consistency
import { useRouter } from "expo-router";

import HeaderSection from "@/components/HeaderSection";
import { useUser } from "@/context/UserContext";
import useAddDevice from "@/hooks/useAddDevice";
import { useAdmin } from "@/context/AdminContext";
import AddedDevice from "@/components/AddedDevice"; // Assuming this component exists and might need styling

export interface DeviceTextProp {
  id: string;
  deviceId: string;
}

const HomePage = () => {
  const { user, updateUser } = useUser();
  const { admin, updateAdmin } = useAdmin();

  const {
    addDevice,
    loading: addingDevice,
    error: addDeviceError,
  } = useAddDevice();

  const [permission, requestPermission] = useCameraPermissions();
  const [deviceText, setDeviceText] = useState<string>("");
  const isPermissionGranted = Boolean(permission?.granted);
  const router = useRouter();

  
  const handleScanQRCode = () => {
    if (!isPermissionGranted) {
      requestPermission();
    } else {
      router.push("/scanner");
    }
  };

  const handleAddDevice = async (text: string | null) => {
    if (!text) {
      Alert.alert("Error", "Please enter a device ID.");
      return;
    }

    if (text.length !== 10) {
      Alert.alert("Error", "Device ID must be 10 characters long.");
      setDeviceText("");
      return;
    }

    if (!user?._id || !user?.email || !user?.username) {
      Alert.alert("Error", "User not found. Please log in.");
      return;
    }

    const success = await addDevice(text, user?._id);

    if (success) {
      Alert.alert("Success", "Device added successfully!");
      updateUser({
        ...user,
        devices: [...(user?.devices || []), text],
        selectedDevice: text,
      });
      setDeviceText("");
      // router.replace("/Statistics");
    } else if (addDeviceError) {
      Alert.alert("Error", addDeviceError);
      setDeviceText("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#242424]">
      <HeaderSection headerText="CompostSense" title="Home" />
      <View className="flex-1 p-4">
        <Text className="text-lg font-semibold text-white mb-4">
          Compost Statistics
        </Text>

        {/* Information Box */}
        <View className="bg-[#3A3A3A] rounded-lg p-4 mb-4 border border-[#4A4A4A]">
          <Text className="text-white text-justify">
            Sign in to your CompostSense account and monitor your device.
          </Text>
        </View>

        {/* Add Device Section */}
        <View className="bg-[#3A3A3A] rounded-lg p-4 border border-[#4A4A4A]">
          <Text className="text-white font-semibold mb-2">Enter Device Number:</Text>
          <TextInput
            placeholder="CMPST*****"
            placeholderTextColor="#777"
            value={deviceText}
            onChangeText={setDeviceText}
            className="bg-[#2A2A2A] text-white rounded-lg py-3 px-4 mb-3 border border-[#4A4A4A]"
          />
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => handleAddDevice(deviceText)}
              className={`flex-1 bg-indigo-500 py-3 rounded-lg items-center justify-center ${
                addingDevice ? 'opacity-70' : ''
              }`}
              disabled={addingDevice}
            >
              {addingDevice ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">Monitor Device</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleScanQRCode}
              className="bg-[#3A3A3A] p-3 rounded-lg border border-[#4A4A4A] justify-center items-center"
            >
              <Ionicons name="qr-code-outline" size={40} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Added Devices */}
        <View className="flex-1 mt-4">
          {user?.devices?.length > 0 ? (
            <AddedDevice />
          ) : (
            <View className="flex-1 justify-center items-center p-5">
              <Text className="text-gray-400 opacity-50">No Added Device</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;