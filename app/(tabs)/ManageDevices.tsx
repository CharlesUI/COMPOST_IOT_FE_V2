import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeaderSection from "@/components/HeaderSection";
import useManageDevices from "@/hooks/useManageDevices";
import { router } from "expo-router";
import { useAdmin } from "@/context/AdminContext";

interface DeviceType {
  _id: string;
  deviceNumber: string;
  realTimeData: any; // Adjust type as needed
  savedTimeFrameData: any; // Adjust type as needed
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDevices, setFilteredDevices] = useState<DeviceType[] | null>();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deviceNumberToDelete, setDeviceNumberToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (devices) {
      const filtered: any = devices.filter((device) =>
        device.deviceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDevices(filtered);
    }
  }, [searchQuery, devices]);

  const closeDeviceDetails = useCallback(() => {
    setIsModalVisible(false);
    setSelectedDevice(null);
  }, []);

  useEffect(() => {
    if (deviceNumberToDelete && !deletingDeviceId && !deletingError) {
      Alert.alert(
        "Success",
        `Successfully deleted device number ${deviceNumberToDelete}`,
        [
          {
            text: "OK",
            onPress: () => {
              closeDeviceDetails();
              setDeviceNumberToDelete(null);
            },
          },
        ]
      );
    } else if (deletingError) {
      // Optionally handle the error case here if needed
      setDeviceNumberToDelete(null); // Reset state on error as well
    }
  }, [deletingDeviceId, deletingError, deviceNumberToDelete, closeDeviceDetails]);

  const openDeviceDetails = (device: DeviceType) => {
    setSelectedDevice(device);
    setIsModalVisible(true);
  };

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

  const handleDeleteDeviceAlert = (deviceId: string, deviceNumber: string) => {
    Alert.alert(
      "Delete Device",
      `Are you sure you want to delete device: ${deviceNumber}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeviceNumberToDelete(deviceNumber);
            deleteDevice(deviceId);
          },
        },
      ]
    );
  };

  const handleViewStatistics = (deviceNumber: string) => {
    closeDeviceDetails(); // Close the modal
    updateAdmin({
      _id: admin?._id,
      username: admin?.username,
      title: admin?.title,
      email: admin?.email,
      managedDevices: admin?.managedDevices || [],
      managedUsers: admin?.managedUsers || [],
      selectedDevice: deviceNumber || null,
    });
    router.push("/(modal)/AdminStatistics");
  };

  const renderItem = ({ item }: { item: DeviceType }) => (
    <TouchableOpacity
      onPress={() => openDeviceDetails(item)}
      className="bg-[#3A3A3A] p-5 my-2 mx-4 rounded-xl shadow-md border border-[#4A4A4A]"
      style={{ elevation: 3 }}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-white">
            {item.deviceNumber}
          </Text>
          {/* You can add more device details here if needed */}
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#242424] items-center justify-center">
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-white mt-4">Loading devices...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#242424] items-center justify-center">
        <StatusBar barStyle="light-content" />
        <HeaderSection headerText="Manage Devices" title="Admin" />
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-red-500 mt-2">Error loading devices</Text>
        <Text className="text-gray-400 text-center mx-6 mt-2">{error}</Text>
        <TouchableOpacity
          className="bg-[#3A3A3A] px-6 py-3 rounded-lg mt-6"
          onPress={() => router.replace("/AdminDashboard")}
        >
          <Text className="text-white font-semibold">Back to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#242424]">
      <StatusBar barStyle="light-content" />
      <HeaderSection headerText="Manage Devices" title="Admin" />

      {/* Search Bar */}
      <View className="px-4 my-3">
        <View className="bg-[#3A3A3A] rounded-lg px-3 py-2 flex-row items-center border border-[#4A4A4A]">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Search devices..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Device Count */}
      <View className="px-4 mb-2">
        <Text className="text-gray-400">
          {filteredDevices?.length || 0} device
          {filteredDevices?.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      {/* Add Device Section (Moved here to match ManageUsers flow) */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-[#3A3A3A] text-white rounded-lg py-3 px-4 mr-2 border border-[#4A4A4A]"
            placeholder="New Device Number"
            placeholderTextColor="#777"
            value={newDeviceNumber}
            onChangeText={setNewDeviceNumber}
          />
          <TouchableOpacity
            className={`bg-green-500 py-3 px-4 rounded-lg ${
              addingDevice ? "opacity-50" : ""
            }`}
            onPress={handleAddDevice}
            disabled={addingDevice}
          >
            {addingDevice ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold">Add Device</Text>
            )}
          </TouchableOpacity>
        </View>
        {addingError && (
          <Text className="text-red-500 mt-2">{addingError}</Text>
        )}
      </View>

      <FlatList
        data={filteredDevices}
        renderItem={renderItem}
        keyExtractor={(item) => item._id!}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-12">
            <Ionicons name="hardware-chip-outline" size={64} color="#6B7280" />
            <Text className="text-gray-400 text-center mt-4 text-lg">
              {searchQuery
                ? "No devices match your search."
                : "No devices found."}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                className="mt-4 bg-[#3A3A3A] px-6 py-2 rounded-lg"
                onPress={() => setSearchQuery("")}
              >
                <Text className="text-white">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        refreshing={loading}
        onRefresh={() => {
          // Implement refresh logic here if needed
        }}
      />

      {/* Device Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeDeviceDetails}
      >
        <View className="flex-1 justify-end bg-[#00000099]">
          <View className="bg-[#2A2A2A] rounded-t-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-16 h-1 bg-gray-500 rounded-full mb-4" />

              <View className="w-16 h-16 bg-[#3A3A3A] rounded-full items-center justify-center mb-2">
                <Ionicons
                  name="hardware-chip-outline"
                  size={28}
                  color="#9CA3AF"
                />
              </View>

              <Text className="text-xl font-bold text-white">
                {selectedDevice?.deviceNumber || "Device Details"}
              </Text>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Ionicons
                  name="finger-print-outline"
                  size={22}
                  color="#9CA3AF"
                  className="mr-3"
                />
                <Text className="text-white ml-2">
                  Device Number: {selectedDevice?.deviceNumber}
                </Text>
              </View>
              {/* You can display other relevant device information here */}
            </View>

            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                onPress={() =>
                  handleViewStatistics(selectedDevice?.deviceNumber!)
                }
                className="bg-blue-600 p-3 rounded-lg flex-1 mr-2"
              >
                <Text className="text-white font-semibold text-center">
                  View Statistics
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  handleDeleteDeviceAlert(
                    selectedDevice?._id!,
                    selectedDevice?.deviceNumber!
                  )
                }
                className={`bg-red-600 p-3 rounded-lg flex-1 ml-2 ${
                  deletingDeviceId === selectedDevice?._id ? "opacity-50" : ""
                }`}
                disabled={deletingDeviceId === selectedDevice?._id}
              >
                {deletingDeviceId === selectedDevice?._id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center">
                    Delete Device
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={closeDeviceDetails}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {deletingError && (
        <Text className="text-red-500 mt-2 text-center">{deletingError}</Text>
      )}
    </SafeAreaView>
  );
};

export default ManageDevices;