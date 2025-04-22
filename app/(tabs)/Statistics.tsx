import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Alert,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import HeaderSection from "@/components/HeaderSection";
import CustomButton from "@/components/CustomButton";
import RealTimeReading from "@/components/RealTimeReading";
import { useUser } from "@/context/UserContext";
import { API_URL_BASE } from "@/constants/API_URL";

// Custom debounce hook to replace Lodash
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return useCallback(
    (...args: any[]) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

const { width } = Dimensions.get("window");

const Statistics = () => {
  const { user, token, abortController } = useUser();
  const hasDeviceSelected = !!user?.selectedDevice;

  const [realTimeData, setRealTimeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatistics, setSelectedStatistics] = useState<string>("");
  const [selectedReading, setSelectedReading] = useState<string>("BATTERY");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  const iconMapping: any = {
    SOLAR: "solar-panel",
    BATTERY: "battery-full",
    "COMPOST #1": "seedling",
    "COCO Statistics": "seedling",
    "COMPOST #2": "leaf",
    "Mixed Statistics": "leaf",
  };

  // Function to send notification to user
  const sendNotification = async (message: string) => {
    if (!user?._id || notificationSent) return;

    try {
      const response = await fetch(
        `${API_URL_BASE}/admin/device/${user?.selectedDevice}/notify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            deviceId: user.selectedDevice,
          }),
        }
      );

      console.log("sending notif to", user?.selectedDevice);
      const data = await response.json();
      console.log("Notification sent:", data);
      setNotificationSent(true);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Check if timestamp is older than 30 minutes
  const isTimestampOld = (timestamp: string): boolean => {
    const now = new Date();
    const dataTime = new Date(timestamp);
    const diffMs = now.getTime() - dataTime.getTime();
    return diffMs > 30 * 60 * 1000; // 30 minutes in milliseconds
  };

  // Format relative time (e.g., "5 minutes ago")
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const dataTime = new Date(timestamp);
    const diffMs = now.getTime() - dataTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const goToStatisticsPage = (stats: string) => {
    if (!hasDeviceSelected) return;

    if (stats === "SOLAR") {
      setSelectedStatistics("SOLAR");
      router.push("/(modal)/SolarStats");
    } else if (stats === "COCO Statistics") {
      setSelectedStatistics("COCO Statistics");
      router.push("/(modal)/CocoStats");
    } else if (stats === "Mixed Statistics") {
      setSelectedStatistics("Mixed Statistics");
      router.push("/(modal)/MixedStats");
    }
  };

  const fetchRealTimeData = useCallback(async () => {
    if (!user?.selectedDevice) {
      console.log("No device selected, skipping real-time fetch");
      return null;
    }

    try {
      const tokenForFetch = token;
      const response = await fetch(
        `${API_URL_BASE}/device/${user?.selectedDevice}/real-time`,
        {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        const message = `Real-time data fetch failed: ${response.status}`;
        throw new Error(message);
      }

      console.log(
        "API URL:",
        `${API_URL_BASE}/device/${user?.selectedDevice}/real-time`
      );

      const responseData = await response.json();

      console.log("Real-time data fetch successful:", responseData);
      setRealTimeData(responseData.realTimeData);

      // Update last updated timestamp if data has a timestamp
      if (responseData.realTimeData && responseData.realTimeData.timestamp) {
        setLastUpdated(responseData.realTimeData.timestamp);

        // Check if data is old and send notification if needed
        if (
          isTimestampOld(responseData.realTimeData.timestamp) &&
          !notificationSent
        ) {
          sendNotification(
            `Your device ${user.selectedDevice} hasn't sent data for over 30 minutes. Please check if everything is functioning properly.`
          );
        } else if (!isTimestampOld(responseData.realTimeData.timestamp)) {
          // Reset notification sent flag if we get fresh data
          setNotificationSent(false);
        }
      }
    } catch (error: any) {
      console.error("Error fetching real-time data:", error);
      setError(error.message || "Failed to load real-time data.");
      Alert.alert(
        "Real-time Data Error",
        error.message || "Failed to load real-time data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    user?.selectedDevice,
    token,
    API_URL_BASE,
    abortController,
    notificationSent,
  ]);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchRealTimeData();
    } catch (apiError: any) {
      setError(apiError.message || "Failed to load initial device data.");
      Alert.alert(
        "Data Load Error",
        apiError.message || "Failed to load initial device data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchRealTimeData, setIsLoading, setError]);

  

  useEffect(() => {
    if (user?.selectedDevice) {
      fetchInitialData();
    } else {
      console.log("NO SELECTED DEVICE");
      setRealTimeData(null);
      setLastUpdated(null);
    }
  }, [user, fetchInitialData]);

  const selectReading = (title: string) => {
    if (!hasDeviceSelected) return;
    setSelectedReading(title);
  };

  const onRefresh = useCallback(() => {
    if (!hasDeviceSelected) return;

    setIsRefreshing(true);
    fetchInitialData()
      .then(() => {
        setIsRefreshing(false);
      })
      .catch((error) => {
        console.error("Refresh error:", error);
        setIsRefreshing(false);
        Alert.alert(
          "Refresh Failed",
          "Unable to update data. Please try again."
        );
      });
  }, [fetchInitialData, hasDeviceSelected]);

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <LinearGradient
        colors={["#121212", "#1A1A1A"]}
        className="absolute inset-0"
      />
      <HeaderSection headerText="Statistics" title="User" />

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B04B" />
          <Text className="text-gray-400 mt-4">Loading device data...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#10B04B", "#3B82F6", "#EF4444"]}
              tintColor="#10B04B"
              title="Updating Dashboard..."
              enabled={hasDeviceSelected}
            />
          }
        >
          {/* Device Header Card */}
          <View className="bg-[#1E1E1E] rounded-b-3xl overflow-hidden mx-4 mt-2 shadow-lg">
            <LinearGradient
              colors={["#2A2A2A", "#262626"]}
              className="w-full px-4 py-5 flex-row justify-between items-center"
            >
              <View className="flex-row items-center space-x-3">
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    hasDeviceSelected ? "bg-[#10B04B]/20" : "bg-gray-700/30"
                  }`}
                >
                  <MaterialIcons
                    name="devices"
                    size={24}
                    color={hasDeviceSelected ? "#10B04B" : "#666"}
                  />
                </View>
                <View>
                  <Text className="text-gray-400 text-xs">
                    Connected Device
                  </Text>
                  <Text className="text-white text-lg font-semibold">
                    {user?.selectedDevice || "No Device Selected"}
                  </Text>
                </View>
              </View>

              {/* <CustomButton
                onPress={() => console.log("HELP")}
                title="HELP"
                containerStyles={`px-4 py-2 rounded-full ${
                  hasDeviceSelected ? "bg-[#10B04B]/20" : "bg-gray-700/30"
                }`}
                textStyles={`font-bold ${
                  hasDeviceSelected ? "text-[#10B04B]" : "text-gray-500"
                }`}
                disabled={!hasDeviceSelected}
              /> */}
            </LinearGradient>
          </View>

          {/* Statistics Card */}
          <View className="mx-4 mt-6 mb-2">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-semibold">
                View Device Statistics
              </Text>
              {!hasDeviceSelected && (
                <Text className="text-gray-500 text-xs italic">
                  Device required
                </Text>
              )}
            </View>

            <View className="bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-lg">
              <View className="flex-row justify-around p-2">
                {["SOLAR", "COCO Statistics", "Mixed Statistics"].map(
                  (itemTitle) => (
                    <TouchableOpacity
                      key={itemTitle}
                      onPress={() => goToStatisticsPage(itemTitle)}
                      className="items-center px-2 py-4 w-1/3"
                      disabled={!hasDeviceSelected}
                    >
                      <View
                        className={`w-16 h-16 rounded-full mb-2 items-center justify-center
                            ${
                              selectedStatistics === itemTitle &&
                              hasDeviceSelected
                                ? "bg-[#10B04B]/30"
                                : hasDeviceSelected
                                ? "bg-[#2A2A2A]"
                                : "bg-[#2A2A2A]/50"
                            }`}
                      >
                        <FontAwesome5
                          name={iconMapping[itemTitle] || "chart-pie"}
                          size={24}
                          color={
                            selectedStatistics === itemTitle &&
                            hasDeviceSelected
                              ? "#10B04B"
                              : hasDeviceSelected
                              ? "#666"
                              : "#444"
                          }
                        />
                      </View>
                      <Text
                        className={`text-xs font-bold text-center ${
                          selectedStatistics === itemTitle && hasDeviceSelected
                            ? "text-[#10B04B]"
                            : hasDeviceSelected
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {itemTitle === "COCO Statistics"
                          ? "COCO"
                          : itemTitle === "Mixed Statistics"
                          ? "MIXED"
                          : itemTitle}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>

          {/* Real-time Readings Card */}
          <View className="mx-4 mt-4 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-semibold">
                Device Readings
              </Text>
              <View className="flex-row items-center">
                {lastUpdated ? (
                  <View className="flex-row items-center">
                    <Text
                      className={`text-xs mr-2 ${
                        isTimestampOld(lastUpdated)
                          ? "text-amber-500"
                          : "text-gray-400"
                      }`}
                    >
                      Updated {getRelativeTime(lastUpdated)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={
                        isTimestampOld(lastUpdated) ? "#FFB020" : "#10B04B"
                      }
                    />
                  </View>
                ) : (
                  <Text
                    className={`text-xs mr-2 ${
                      hasDeviceSelected ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No updates
                  </Text>
                )}
              </View>
            </View>

            <View className="bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-lg">
              <View className="flex-row p-1">
                {["SOLAR", "BATTERY", "COMPOST #1", "COMPOST #2"].map(
                  (itemTitle) => (
                    <TouchableOpacity
                      key={itemTitle}
                      onPress={() => selectReading(itemTitle)}
                      disabled={!hasDeviceSelected}
                      className={`flex-1 py-3 items-center justify-center rounded-xl mx-1
                          ${
                            selectedReading === itemTitle && hasDeviceSelected
                              ? "bg-[#10B04B]/30"
                              : hasDeviceSelected
                              ? "bg-[#2A2A2A]"
                              : "bg-[#2A2A2A]/50"
                          }`}
                    >
                      <FontAwesome5
                        name={iconMapping[itemTitle] || "thermometer-half"}
                        size={16}
                        color={
                          selectedReading === itemTitle && hasDeviceSelected
                            ? "#10B04B"
                            : hasDeviceSelected
                            ? "#666"
                            : "#444"
                        }
                        className="mb-1"
                      />
                      <Text
                        className={`text-xs font-bold uppercase ${
                          selectedReading === itemTitle && hasDeviceSelected
                            ? "text-white"
                            : hasDeviceSelected
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {itemTitle === "COMPOST #1"
                          ? "COCO"
                          : itemTitle === "COMPOST #2"
                          ? "MIXED"
                          : itemTitle}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <View className="h-[1px] w-full bg-[#10B04B]/20 my-2" />

              <View className="p-4">
                {!hasDeviceSelected ? (
                  <View className="items-center py-8">
                    <Text className="text-gray-400 text-center mt-2">
                      No device selected
                    </Text>
                    <Text className="text-gray-500 text-xs text-center mt-1">
                      Please select a device to view readings
                    </Text>
                  </View>
                ) : !realTimeData && !isLoading ? (
                  <View className="items-center py-8">
                    <Ionicons name="analytics-outline" size={40} color="#666" />
                    <Text className="text-gray-400 mt-2">
                      No data available
                    </Text>
                    <TouchableOpacity
                      onPress={onRefresh}
                      className="mt-4 bg-[#10B04B]/20 px-6 py-2 rounded-full"
                    >
                      <Text className="text-[#10B04B]">Refresh</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <RealTimeReading
                    realTimeData={realTimeData}
                    selectedReading={selectedReading}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Quick Actions Card */}
          {/* <View className="mx-4 mb-8">
            <Text className="text-white text-lg font-semibold mb-3">
              Quick Actions
            </Text>

            <View className="bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-lg p-4">
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className={`p-4 rounded-xl w-24 h-24 items-center justify-center ${
                    hasDeviceSelected ? "bg-[#2A2A2A]" : "bg-[#2A2A2A]/50"
                  }`}
                  disabled={!hasDeviceSelected}
                >
                  <Ionicons
                    name="download-outline"
                    size={28}
                    color={hasDeviceSelected ? "#10B04B" : "#666"}
                  />
                  <Text
                    className={`text-xs mt-2 text-center ${
                      hasDeviceSelected ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Export Data
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`p-4 rounded-xl w-24 h-24 items-center justify-center ${
                    hasDeviceSelected ? "bg-[#2A2A2A]" : "bg-[#2A2A2A]/50"
                  }`}
                  disabled={!hasDeviceSelected}
                  onPress={() => router.push("/(modal)/Notification")}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={28}
                    color={hasDeviceSelected ? "#10B04B" : "#666"}
                  />
                  <Text
                    className={`text-xs mt-2 text-center ${
                      hasDeviceSelected ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Set Alerts
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`p-4 rounded-xl w-24 h-24 items-center justify-center ${
                    hasDeviceSelected ? "bg-[#2A2A2A]" : "bg-[#2A2A2A]/50"
                  }`}
                  disabled={!hasDeviceSelected}
                >
                  <Ionicons
                    name="settings-outline"
                    size={28}
                    color={hasDeviceSelected ? "#10B04B" : "#666"}
                  />
                  <Text
                    className={`text-xs mt-2 text-center ${
                      hasDeviceSelected ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Settings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View> */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Statistics;
