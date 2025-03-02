import React, { useRef, useEffect, useState } from "react";
import { Camera, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  AppState,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, Text } from "react-native";
import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";
import { DeviceTextProp } from "../(tabs)";
import { useAddedDeviceContext } from "@/context/useAddedDeviceContext";

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
  const { addedDevices, setAddedDevices } = useAddedDeviceContext(); // Access the context

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
    // router.push("/Device"); // Or router.navigate("/device") depending on your expo-router version
    
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
    if (data && cameraReady && !hasScanned) {
      setHasScanned(true);
      qrLock.current = true;

      if (!validDeviceIds.includes(data)) {
        Alert.alert("Error", "Invalid QR Code.");
        router.back(); // Exit immediately on invalid code
        return; // Important: Return to prevent further execution
      }

      Alert.alert("QR Code Result", data, [
        {
          text: "OK",
          onPress: () => {
            const newDevice: DeviceTextProp = {
              id: Math.random().toString(),
              deviceId: data, // Use the scanned data as the deviceId
            };
            console.log("data", data)
            
            setAddedDevices((prevDevices) => {
              return prevDevices ? [...prevDevices, newDevice] : [newDevice];
            });
            handleAddDevice(data);
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
              <DiffRect
                inner={inner}
                outer={outer}
                color="black"
                opacity={0.5}
              />
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
