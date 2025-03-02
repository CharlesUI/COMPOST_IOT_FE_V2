import { useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { View, Text, Pressable, TextInput, Alert } from "react-native";
import CustomButton from "@/components/CustomButton";
import { useRouter, router } from "expo-router";
import AddedDevice from "@/components/AddedDevice";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAddedDeviceContext } from "@/context/useAddedDeviceContext"; // Import the hook
import HeaderSection from "@/components/HeaderSection";
import AntDesign from "@expo/vector-icons/AntDesign";
import { TouchableOpacity } from "react-native";

export interface DeviceTextProp {
  id: string;
  deviceId: string;
}

const goToUserLog = () => {
  router.push("/(modal)/userLog");
};

const validDeviceIds = ["CMPST10923", "CMPST18276", "CMPST19284"]; // Array of valid device IDs

const HomePage = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [deviceText, setDeviceText] = useState<string>("");
  const { addedDevices, setAddedDevices } = useAddedDeviceContext(); // Access the context
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
      setDeviceText("");
      return;
    }

    if (!validDeviceIds.includes(text)) {
      Alert.alert("Error", "Invalid device ID.");
      setDeviceText("");
      return;
    }

    if (
      addedDevices &&
      addedDevices.find((device) => device.deviceId === text)
    ) {
      Alert.alert("Error", "Device ID already exists.");
      setDeviceText("");
      return;
    }

    const newDevice: DeviceTextProp = {
      id: Math.random().toString(),
      deviceId: text,
    };

    setAddedDevices(addedDevices ? [...addedDevices, newDevice] : [newDevice]);
    setDeviceText("");

    router.push("/Device"); // Or router.navigate("/device") depending on your expo-router version
  };

  return (
    <SafeAreaView className="flex-1">
      <HeaderSection
        headerText="Compost IoT"
        title="Log In"
        onPressToggle={goToUserLog}
      />
      <View className="flex-1 bg-[#2F2C2C]">
        <View className="mt-10 mb-2 w-full flex-row justify-between px-5">
          <Text className=" font-bold p-1 color-white">
            Compost Monitoring Server
          </Text>
        </View>

        <View className=" w-full flex justify-center items-center p-2">
          <View className="w-[92.5%] bg-slate-200 rounded-lg mb-2">
            {/* First */}
            <View className=" px-5 py-4 border-gray-300">
              <Pressable className="w-full" onPress={goToUserLog}>
                <Text className=" text-justify">
                  Sign in to your compost IoT account and monitor your device.
                </Text>
              </Pressable>
            </View>
          </View>
          {/* Second */}
          <View className="w-[92.5%] bg-slate-200 rounded-lg mx-2">
            <View className=" px-5 py-4 border-gray-800">
              <Pressable className=" mb-2">
                <Text>Enter Device Number:</Text>
              </Pressable>
              <View className="flex justify-around">
                <TextInput
                  placeholder="CMPST*****"
                  placeholderTextColor="gray"
                  value={deviceText}
                  onChangeText={(text) => setDeviceText(text)}
                  className=" border-[0.5px] mb-3 rounded-md p-2"
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

        {addedDevices === null ? (
          <View className="flex-1 justify-start items-center p-5">
            <Text className="color-gray-100 opacity-30">No Added Device</Text>
          </View>
        ) : (
          <View className="flex-1">
            <AddedDevice
              addedDevices={addedDevices}
              setAddedDevices={setAddedDevices}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
