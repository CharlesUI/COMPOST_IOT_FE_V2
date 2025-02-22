import { useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import HomeHeaderSection from "@/components/HomePage/HomeHeaderSection";
import { View, Text, Pressable, TextInput, Alert } from "react-native";
import CustomButton from "@/components/CustomButton";
import { Link, useRouter } from "expo-router";
import AddedDevice from "@/components/AddedDevice";
import { goToUserLog } from "@/components/HomePage/HomeHeaderSection";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAddedDeviceContext } from '@/context/useAddedDeviceContext' // Import the hook


export interface DeviceTextProp {
  id: string;
  deviceId: string;
}

const validDeviceIds = ["CMPST10923", "CMPST18276", "CMPST19284"]; // Array of valid device IDs

const HomePage = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [deviceText, setDeviceText] = useState<string>("");
  const { addedDevices, setAddedDevices } = useAddedDeviceContext(); // Access the context
  // const [addedDevices, setAddedDevices] = useState<DeviceTextProp[] | null>(
  //   null
  // );
  const isPermissionGranted = Boolean(permission?.granted);

  const router = useRouter(); // Initialize router

  const handleScanQRCode = () => {
    if (!isPermissionGranted) {
      requestPermission(); // Request permission if not granted
    } else {
      router.push("/scanner"); // Navigate to scanner if permission is granted
    }
  };

  const handleAddDevice = (text: string | null) => {
    if (!text) {
      Alert.alert("Error", "Please enter a device ID.");
      return;
    }

    if (text.length !== 10) {
      Alert.alert("Error", "Device ID must be 10 characters long.");
      return;
    }

    if (!validDeviceIds.includes(text)) {
      Alert.alert("Error", "Invalid device ID.");
      return;
    }

    if (
      addedDevices &&
      addedDevices.find((device) => device.deviceId === text)
    ) {
      Alert.alert("Error", "Device ID already exists.");
      return;
    }

    const newDevice: DeviceTextProp = {
      id: Math.random().toString(),
      deviceId: text,
    };

    setAddedDevices(addedDevices ? [...addedDevices, newDevice] : [newDevice]);
    setDeviceText("");

    // Navigate to the Device tab (replace "/device" with your actual route)
    router.push("/Device"); // Or router.navigate("/device") depending on your expo-router version
  };

  return (
    <SafeAreaView className="flex-1">
      <HomeHeaderSection />
      <View className="flex-1 bg-gray-200">
        <View className="w-full flex-row justify-between p-3 mt-5">
          <Text className=" font-semibold p-1">Compost Monitoring Server</Text>
          <Pressable onPress={() => console.log("Go to HELP")}>
            <Text className=" font-light p-1">HELP</Text>
          </Pressable>
        </View>

        <View className=" w-full flex justify-center items-center">
          <View className="w-[92.5%] bg-white rounded-md mx-2">
            {/* First */}
            <View className=" px-5 py-4 border-b-2 border-gray-300">
              <Pressable className="w-full" onPress={goToUserLog}>
                <Text className=" text-justify">
                  Press here to sign in to your compost IoT account and see the
                  details regarding your compost bin energy harvesting and
                  monitoring system.
                </Text>
              </Pressable>
            </View>
            {/* Second */}
            <View className=" px-5 py-4  border-b-2 border-gray-300">
              <Pressable className=" mb-2">
                <Text>Enter Device Number:</Text>
              </Pressable>
              <View className="flex justify-around">
                <TextInput
                  placeholder="#0SDFESKDSDFSM"
                  placeholderTextColor="gray"
                  value={deviceText}
                  onChangeText={(text) => setDeviceText(text)}
                  className=" border-[0.5px] mb-3 rounded-md p-2"
                />
                <CustomButton
                  title="Add Device"
                  containerStyles="min-h-[45px] border-[1px] bg-black"
                  textStyles=" text-white"
                  onPress={() => handleAddDevice(deviceText)}
                ></CustomButton>
              </View>
            </View>
            {/* Third */}
            <View className="px-5 py-4">
              <CustomButton
                title="Scan QR Code"
                containerStyles="min-h-[45px] border-[1px] bg-black"
                textStyles=" text-white"
                onPress={handleScanQRCode}
              ></CustomButton>
            </View>
          </View>
        </View>

        {addedDevices === null ? (
          <View className="flex-1 p-5 bg-pink">
            <Text>No Added Device</Text>
          </View>
        ) : (
          <AddedDevice
            addedDevices={addedDevices}
            setAddedDevices={setAddedDevices}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
