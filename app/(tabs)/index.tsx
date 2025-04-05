// HomePage.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  View,
  Text,
  Pressable, // Keep Pressable if used elsewhere, or replace with TouchableOpacity
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet, // Import StyleSheet if needed for local styles
  // StatusBar, // Not used in the return, can be removed if not needed globally
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCameraPermissions } from "expo-camera"; // Import the hook
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import HeaderSection from "@/components/HeaderSection";
import { useUser } from "@/context/UserContext";
import useAddDevice from "@/hooks/useAddDevice";
// import { useAdmin } from "@/context/AdminContext"; // Removed if admin context not used here
import AddedDevice from "@/components/AddedDevice";

// Interface remains the same
export interface DeviceTextProp {
  id: string;
  deviceId: string;
}

const HomePage = () => {
  const { user, updateUser } = useUser();
  // const { admin, updateAdmin } = useAdmin(); // Removed if not used

  const {
    addDevice,
    loading: addingDevice,
    error: addDeviceError,
  } = useAddDevice();

  const [deviceText, setDeviceText] = useState<string>("");
  const router = useRouter();

  // --- Add Camera Permissions Hook ---
  const [permission, requestPermission] = useCameraPermissions();

  // --- Modified handleScanQRCode ---
  const handleScanQRCode = async () => {
    if (!permission) {
      // Permissions are still loading, maybe show a brief indicator or disable button
      return;
    }

    let currentStatus = permission.status;
    if (currentStatus === 'undetermined') {
       console.log("Requesting camera permission...");
       const { status } = await requestPermission();
       currentStatus = status;
       console.log("Permission status after request:", currentStatus);
    }

    if (currentStatus === 'granted') {
      console.log("Permission granted, navigating to scanner...");
      router.push('/scanner'); // Navigate to the scanner screen route
    } else {
      console.log("Permission denied or not granted:", currentStatus);
      Alert.alert(
        'Permission Required',
        'Camera access is needed to scan QR codes. Please enable it in your device settings or grant permission when asked.',
        [
          { text: 'OK' },
          // Optionally add a button to open settings if using Linking API
        ]
      );
    }
  };

  // --- handleAddDevice (for manual input) remains largely the same ---
  const handleAddDeviceManual = async (text: string | null) => {
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

    const success = await addDevice(text, user._id); // Use the hook

    if (success) {
      Alert.alert("Success", "Device added successfully!");
      // Update context
      updateUser({
        ...user,
        devices: [...(user?.devices || []), text],
        selectedDevice: text, // Optionally select the new device
      });
      setDeviceText(""); // Clear input field
      // Optional: Navigate after manual add
      // router.replace("/Statistics");
    } else {
      // Use the error message from the hook if available
       const errorMessage = addDeviceError || "Failed to add device. It might already be registered or an error occurred.";
       Alert.alert("Error", errorMessage);
       setDeviceText(""); // Clear input field on error too
    }
  };

  // --- Return JSX (Mostly the same, ensure onPress handlers are correct) ---
  return (
    <SafeAreaView className="flex-1 bg-[#242424]">
      <HeaderSection headerText="CompostSense" title="Home" />
      <View className="flex-1 p-4">
        {/* ... other components like Title, Info Box ... */}
         <Text className="text-lg font-semibold text-white mb-4">
           Compost Statistics
         </Text>

         {/* Information Box */}
         <View className="bg-[#3A3A3A] rounded-lg p-4 mb-4 border border-[#4A4A4A]">
           <Text className="text-white text-justify">
             Sign in to your CompostSense account and monitor your device. Add devices below using the ID or QR Code.
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
            {/* Button for Manual Add */}
            <TouchableOpacity
              // Use the renamed handler for manual input
              onPress={() => handleAddDeviceManual(deviceText)}
              className={`flex-1 bg-indigo-500 py-3 rounded-lg items-center justify-center ${
                addingDevice ? 'opacity-70' : '' // Disable based on the hook's loading state
              }`}
              disabled={addingDevice}
            >
              {addingDevice ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">Monitor Device</Text>
              )}
            </TouchableOpacity>

            {/* Button for QR Scan */}
            <TouchableOpacity
              onPress={handleScanQRCode} // Use the updated handler
              className="bg-[#4A4A4A] p-3 rounded-lg border border-[#5A5A5A] justify-center items-center" // Slightly different style for distinction
            >
               {/* Increased size slightly */}
              <Ionicons name="qr-code-outline" size={32} color="#E5E7EB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Added Devices */}
        <View className="flex-1 mt-4">
          {user?.devices && user.devices.length > 0 ? ( // Check user.devices directly
            <AddedDevice /> // Make sure this component reads from user context
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