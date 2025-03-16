import React, { useState, useRef, useEffect } from "react";
import {
  AppState,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
  View,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";

import { useUser } from "@/context/UserContext";
import useAddDevice from "@/hooks/useAddDevice";

const { width, height } = Dimensions.get("window");
const innerDimension = 300;
const outer = rrect(rect(0, 0, width, height), 0, 0);
const inner = rrect(
  rect(
    width / 2 - innerDimension / 2,
    height / 2 - innerDimension / 2,
    innerDimension,
    innerDimension
  ),
  50,
  50
);

const validDeviceIds = ["CMPST10923", "CMPST18276", "CMPST19284"];

export default function Home() {
  const { user, logoutUser, updateUser } = useUser(); // Access updateUser
  const {
    addDevice,
    loading: addingDevice,
    error: addDeviceError,
  } = useAddDevice(); // Use the new hook

  const handleAddDevice = async (text: string | null) => {
    if (!text) {
      Alert.alert("Error", "Please enter a device ID.");
      return;
    }

    if (text.length !== 10) {
      Alert.alert("Error", "Device ID must be 10 characters long.");
      return;
    }

    const success = await addDevice(text, user?._id);

    if (success) {
      router.back();
      Alert.alert("Success", "Device added successfully!");
      updateUser({
        _id: user?._id,
        username: user?.username,
        email: user?.email,
        devices: [...(user?.devices || []), text],
      });
      // No navigation here as it's the main screen
    } else if (addDeviceError) {
      Alert.alert("Error", addDeviceError);
    }
  };

  const qrLock = useRef(false);
  const router = useRouter();

  const [cameraReady, setCameraReady] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    setHasScanned(false); // Reset on component mount and cameraReady change
    qrLock.current = false;
  }, [cameraReady]);

  const handleBarcodeScanned = ({ data }: any) => {
    // No need for any type here
    console.log("data", data);
    console.log("user", user);
    
    if (qrLock.current) {
      // Check if a scan is already in progress
      return;
    }
    if (data && cameraReady && !hasScanned) {
      setHasScanned(true);
      qrLock.current = true;

      if(user?._id === undefined || user?.devices.length < 0 || user?.email === undefined || user?.username === undefined) {
        Alert.alert("Error", "User not found.");
        return; // Important: Return to prevent further execution
      }
      
      if (!validDeviceIds.includes(data)) {
        router.back();
        Alert.alert("Error", "Invalid QR Code.");
        updateUser({
          _id: user?._id,
          username: user?.username,
          email: user?.email,
          devices: [...(user?.devices || [])],
        });
        setHasScanned(false); // Allow scanning again
        qrLock.current = false;
        return; // Important: Return to prevent further execution
      }


      Alert.alert("QR Code Result", data, [
        {
          text: "OK",
          onPress: () => {
            handleAddDevice(data);
            setHasScanned(false); // Allow scanning again
            qrLock.current = false;
            router.back();
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {Platform.OS === "android" ? <StatusBar hidden /> : null}
        <CameraView
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
          onBarcodeScanned={handleBarcodeScanned}
        />

        {cameraReady && (
          <View style={styles.overlay}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Scan a CompostIoT Device</Text>
            </View>

            <Canvas style={styles.canvas}>
              <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
            </Canvas>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.exitButton}
                onPress={() => router.back()}
              >
                <Ionicons name="close" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "column",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 30 : 50,
    paddingBottom: 20,
  },
  headerText: {
    color: "white",
    fontSize: 17.5,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
  },
  footer: {
    position: "absolute",
    bottom: 20, // Adjust as needed
    left: 0,
    right: 0,
    alignItems: "center",
  },
  exitButton: {
    borderRadius: 15, // Make it a circle
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
  },
});