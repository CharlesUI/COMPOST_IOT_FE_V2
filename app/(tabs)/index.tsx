import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCameraPermissions } from "expo-camera";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";

import CustomButton from "@/components/CustomButton";
import AddedDevice from "@/components/AddedDevice";
import HeaderSection from "@/components/HeaderSection";
import { useUser } from "@/context/UserContext";
import useAddDevice from "@/hooks/useAddDevice"; // Import the new hook
import { useAdmin } from "@/context/AdminContext";

export interface DeviceTextProp {
  id: string;
  deviceId: string;
}

const HomePage = () => {
  const { user, updateUser } = useUser(); // Access updateUser
  const { admin, updateAdmin } = useAdmin();

  console.log("ADMIN IN HOME", admin);

  const {
    addDevice,
    loading: addingDevice,
    error: addDeviceError,
  } = useAddDevice(); // Use the new hook

  const [permission, requestPermission] = useCameraPermissions();
  const [deviceText, setDeviceText] = useState<string>("");
  const isPermissionGranted = Boolean(permission?.granted);
  const router = useRouter(); // Initialize router

  console.log("User", user);
  console.log("Added Devices", user?.devices);

  const handleScanQRCode = () => {
    if (!isPermissionGranted) {
      requestPermission(); // Request permission if not granted
    } else {
      router.push("/scanner"); // Navigate to scanner if permission is granted
    }
  };

  const handleAddDevice = async (text: string | null) => {
    console.log("Check if user is logged in", user);
    if (!text) {
      Alert.alert("Error", "Please enter a device ID.");
      return;
    }

    if (text.length !== 10) {
      Alert.alert("Error", "Device ID must be 10 characters long.");
      setDeviceText("");
      return;
    }

    if (
      user?._id === undefined ||
      user?.devices?.length < 0 ||
      user?.email === undefined ||
      user?.username === undefined
    ) {
      Alert.alert("Error", "User not found. Please log in.");
      return;
    }

    const success = await addDevice(text, user?._id);

    if (success) {
      Alert.alert("Success", "Device added successfully!");
      updateUser({
        _id: user?._id,
        username: user?.username,
        email: user?.email,
        devices: [...user?.devices, text],
        selectedDevice: text,
      });
      // setAddedDevices([...addedDevices, text]); // Update the context
      setDeviceText("");
      router.push("/Device");
    } else if (addDeviceError) {
      Alert.alert("Error", addDeviceError);
      setDeviceText("");
    }
  };

  console.log("USER IN HOME", user);

  return (
    <SafeAreaView className="flex-1 w-full">
      <HeaderSection headerText="CompostSense" title="Log In" />
      <View className="flex-1 bg-[#2F2C2C]">
        <View className="mt-10 mb-[4px] w-full flex-row justify-between px-5">
          <Text className="text-[13px] font-semibold p-1 color-white">
            Compost Statistics Server
          </Text>
        </View>

        <View className=" w-full flex justify-center items-center p-2">
          <View className="w-[92.5%] bg-slate-200 rounded-lg mb-2">
            {/* First */}
            <View className=" px-5 py-4 border-gray-300">
              <Pressable
                className="w-full"
                onPress={() => console.log("HELLO MUNA")}
              >
                <Text className="text-[12px] font-medium text-justify">
                  Sign in to your CompostSense account and monitor your device.
                </Text>
              </Pressable>
            </View>
          </View>
          {/* Second */}
          <View className="w-[92.5%] bg-slate-200 rounded-lg mx-2">
            <View className=" px-5 py-4 border-gray-800">
              <Pressable className=" mb-2">
                <Text className="text-[12px] font-medium">
                  Enter Device Number:
                </Text>
              </Pressable>
              <View className="flex justify-around">
                <TextInput
                  placeholder="CMPST*****"
                  placeholderTextColor="gray"
                  value={deviceText}
                  onChangeText={(text) => setDeviceText(text)}
                  className="font-medium border-[0.5px] mb-3 rounded-md p-2"
                />
                <View className="flex flex-row gap-2">
                  <CustomButton
                    title="Monitor Device"
                    containerStyles="flex-1 min-h-[45px] border-[1px] bg-gray-800"
                    textStyles=" text-white"
                    onPress={() => handleAddDevice(deviceText)}
                  ></CustomButton>
                  <TouchableOpacity
                    onPress={handleScanQRCode}
                    className="p-2 justify-center items-center border-gray-800 border-2 rounded-md"
                  >
                    <AntDesign name="qrcode" size={40} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* The display of added devices should now reflect the user's context */}
        {user?.devices?.length > 0 ? (
          <View className="flex-1">
            <AddedDevice />
          </View>
        ) : (
          <View className="flex-1 justify-start items-center p-5">
            <Text className="color-gray-200 opacity-30">No Added Device</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
