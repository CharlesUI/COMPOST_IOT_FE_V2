import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderSection from "@/components/HeaderSection";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { API_URL_BASE } from "@/constants/API_URL";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, StatusBar } from "react-native";

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [totalUsers, setTotalUsers] = useState(null);
  const [newUsersLastWeek, setNewUsersLastWeek] = useState(null);
  const [totalDevices, setTotalDevices] = useState(null);
  const [activeDevices, setActiveDevices] = useState(null);
  const [inactiveDevices, setInactiveDevices] = useState(null);
  const [allDevicesPerformanceData, setAllDevicesPerformanceData] = useState<
    any[] | []
  >([]);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [latestAlerts, setLatestAlerts] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleNavigation = (tab: any) => {
    console.log(`Maps to ${tab}`);
    if (tab === "Users") {
      router.push("/(tabs)/ManageUsers");
    } else if (tab === "Devices" || tab === "AllDevices") {
      router.push("/(tabs)/ManageDevices");
    } else if (tab === "Notifications") {
      router.push("/(modal)/AdminNotifications");
    }
  };

  const toggleDeviceExpansion = (deviceNumber: any) => {
    if (expandedDevice === deviceNumber) {
      setExpandedDevice(null);
    } else {
      setExpandedDevice(deviceNumber);
    }
  };

  // Function to determine status color based on value and thresholds
  const getStatusColor = (value: any, type: any) => {
    if (value === undefined || value === null) return "#858585"; // gray for N/A

    switch (type) {
      case "battery":
        return value > 50 ? "#10B04B" : value > 20 ? "#FFA500" : "#FF0000";
      case "temperature":
        return value > 65 ? "#FF0000" : value > 40 ? "#10B04B" : "#3B82F6";
      case "voltage":
        return value > 3 ? "#10B04B" : value > 2 ? "#FFA500" : "#FF0000";
      case "methane":
        return value < 50 ? "#10B04B" : value < 100 ? "#FFA500" : "#FF0000";
      case "moisture":
        return value > 40 && value < 70 ? "#10B04B" : "#FFA500";
      default:
        return "#10B04B";
    }
  };

  // Function to render status indicators
  const renderStatusIndicator = (
    value: any,
    type: any,
    label: any,
    unit = ""
  ) => {
    const color = getStatusColor(value, type);
    return (
      <View className="flex-row items-center justify-between mt-1">
        <Text className="text-white text-xs">{label}</Text>
        <View className="flex-row items-center">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
              marginRight: 4,
            }}
          />
          <Text className="text-white text-xs">
            {value !== undefined ? `${value}${unit}` : "N/A"}
          </Text>
        </View>
      </View>
    );
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch user stats
      setIsLoading(true)
      const totalUsersResponse = await fetch(
        `${API_URL_BASE}/admin/dashboard/users/count`
      );
      const newUsersResponse = await fetch(
        `${API_URL_BASE}/admin/dashboard/users/new`
      );
      const totalDevicesResponse = await fetch(
        `${API_URL_BASE}/admin/dashboard/devices/count/total`
      );
      const activeDevicesResponse = await fetch(
        `${API_URL_BASE}/admin/dashboard/devices/count/active`
      );
      const inactiveDevicesResponse = await fetch(
        `${API_URL_BASE}/admin/dashboard/devices/count/inactive`
      );
      const allDevicesPerformanceResponse = await fetch(
        `${API_URL_BASE}/admin/dashboard/performance/devices/all`
      );
      const latestAlertsResponse = await fetch(
        `${API_URL_BASE}/admin/dashboard/alerts/latest`
      );
      setIsLoading(false)

      const results = await Promise.all([
        totalUsersResponse.json(),
        newUsersResponse.json(),
        totalDevicesResponse.json(),
        activeDevicesResponse.json(),
        inactiveDevicesResponse.json(),
        allDevicesPerformanceResponse.json(),
        latestAlertsResponse.json(),
      ]);

      // Update state with fetched data
      setTotalUsers(results[0].totalUsers);
      setNewUsersLastWeek(results[1].newUsers);
      setTotalDevices(results[2].totalDevices);
      setActiveDevices(results[3].activeDevices);
      setInactiveDevices(results[4].inactiveDevices);
      setAllDevicesPerformanceData(results[5].devicesPerformance);
      setLatestAlerts(results[6].alerts);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboardData().then(() => {
      setIsRefreshing(false);
    });
  }, []);

  const criticalAlertCount = latestAlerts
    ? latestAlerts.filter((alert: any) => alert.severity === "danger").length
    : 0;
  const totalAlertCount = latestAlerts ? latestAlerts.length : 0;

  if (isLoading) {
      return (
        <SafeAreaView className="flex-1 bg-[#242424] items-center justify-center">
          <StatusBar barStyle="light-content" />
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-white mt-4">Loading dashboard...</Text>
        </SafeAreaView>
      );
    }

  return (
    <SafeAreaView className="flex-1">
      <HeaderSection headerText="CompostSense" title="Admin" />
      <ScrollView
        className="flex-1 p-4 space-y-4 bg-[#2F2C2C]"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#10B04B", "#3B82F6", "#EF4444"]} // Optional: colors for the refresh indicator
            tintColor="#10B04B" // Color of the refresh indicator
            title="Updating Dashboard..." // Optional: text shown during refresh
          />
        }
      >
        {/* Summary Cards - 2x2 Grid */}
        <View className="flex-row flex-wrap justify-between">
          {/* Users Card */}
          <Pressable
            onPress={() => handleNavigation("Users")}
            className="bg-[#3E3A3A] p-6 rounded-lg shadow-md w-[48%] mb-4 border-l-4 border-l-blue-500"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Ionicons name="people" size={24} color="#3B82F6" />
              <Text className="text-white text-xs opacity-70">View All</Text>
            </View>
            <Text className="text-xl font-bold text-white mb-1">Users</Text>
            <View className="flex-row items-end">
              <Text className="text-2xl font-bold text-white">
                {totalUsers !== null ? totalUsers : "-"}
              </Text>
              <Text className="text-green-400 text-xs ml-2 mb-1">
                +{newUsersLastWeek !== null ? newUsersLastWeek : "0"} new
              </Text>
            </View>
          </Pressable>

          {/* Devices Card */}
          <Pressable
            onPress={() => handleNavigation("Devices")}
            className="bg-[#3E3A3A] p-6 rounded-lg shadow-md w-[48%] mb-4 border-l-4 border-l-green-500"
          >
            <View className="flex-row justify-between items-center mb-2">
              <MaterialIcons name="devices" size={24} color="#10B04B" />
              <Text className="text-white text-xs opacity-70">View All</Text>
            </View>
            <Text className="text-xl font-bold text-white mb-1">Devices</Text>
            <View className="flex-row items-end">
              <Text className="text-2xl font-bold text-white">
                {totalDevices !== null ? totalDevices : "-"}
              </Text>
            </View>
            <View className="flex-row mt-2 justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                <Text className="text-white text-xs">
                  {activeDevices !== null ? activeDevices : "-"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                <Text className="text-white text-xs">
                  {inactiveDevices !== null ? inactiveDevices : "-"}
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Notifications Card */}
          <Pressable
            onPress={() => handleNavigation("Notifications")}
            className="bg-[#3E3A3A] p-6 rounded-lg shadow-md w-[48%] mb-4 border-l-4 border-l-red-500"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Ionicons name="notifications" size={24} color="#EF4444" />
              <Text className="text-white text-xs opacity-70">View All</Text>
            </View>
            <Text className="text-xl font-bold text-white mb-1">Alerts</Text>
            <View className="flex-row items-end">
              <Text className="text-2xl font-bold text-white">
                {totalAlertCount}
              </Text>
              <Text className="text-red-400 text-xs ml-2 mb-1">
                {criticalAlertCount}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Device Performance Section */}
        <View className="bg-[#3E3A3A] rounded-lg shadow-md p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-white">
              Device Performance
            </Text>
            <Pressable
              onPress={() => handleNavigation("AllDevices")}
              className="bg-[#4B4747] py-1 px-3 rounded-full"
            >
              <Text className="text-white text-xs">View All</Text>
            </Pressable>
          </View>

          {allDevicesPerformanceData ? (
            allDevicesPerformanceData.map((deviceData: any) => (
              <Pressable
                key={deviceData.deviceNumber}
                onPress={() => toggleDeviceExpansion(deviceData.deviceNumber)}
                className={`bg-[#2F2C2C] rounded-lg mb-4 overflow-hidden border-l-4 ${
                  deviceData.batteryPercentage > 50
                    ? "border-l-green-500"
                    : deviceData.batteryPercentage > 20
                    ? "border-l-yellow-500"
                    : "border-l-red-500"
                }`}
              >
                {/* Device Header */}
                <View className="p-4">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <MaterialIcons name="devices" size={20} color="white" />
                      <Text className="font-bold text-white ml-2 text-lg">
                        Device {deviceData.deviceNumber}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="bg-[#4B4747] px-2 py-1 rounded-full mr-2">
                        <Text className="text-white text-xs">
                          {deviceData.batteryPercentage > 20
                            ? "Online"
                            : "Offline"}
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          expandedDevice === deviceData.deviceNumber
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color="white"
                      />
                    </View>
                  </View>

                  {/* Summary Stats - Always Visible */}
                  <View className="flex-row justify-between mt-3">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="battery-half"
                        size={16}
                        color={getStatusColor(
                          deviceData.batteryPercentage,
                          "battery"
                        )}
                      />
                      <Text className="text-white text-xs ml-1">
                        {deviceData.batteryPercentage !== undefined
                          ? `${deviceData.batteryPercentage}%`
                          : "N/A"}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <FontAwesome5
                        name="temperature-high"
                        size={16}
                        color={getStatusColor(
                          deviceData.compostOneTemperatureIn,
                          "temperature"
                        )}
                      />
                      <Text className="text-white text-xs ml-1">
                        {deviceData.compostOneTemperatureIn !== undefined
                          ? `${deviceData.compostOneTemperatureIn}°C`
                          : "N/A"}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="sunny"
                        size={16}
                        color={getStatusColor(
                          deviceData.solarVoltage,
                          "voltage"
                        )}
                      />
                      <Text className="text-white text-xs ml-1">
                        {deviceData.solarVoltage !== undefined
                          ? `${deviceData.solarVoltage}V`
                          : "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Expanded Details */}
                {expandedDevice === deviceData.deviceNumber && (
                  <View className="p-4 pt-0">
                    <View className="h-px bg-[#4B4747] my-3" />

                    <View className="flex-row flex-wrap">
                      {/* Battery Section */}
                      <View className="w-1/2 pr-2 mb-4">
                        <View className="bg-[#363333] p-3 rounded-lg">
                          <View className="flex-row items-center mb-2">
                            <Ionicons
                              name="battery-half"
                              size={18}
                              color="white"
                            />
                            <Text className="text-white font-medium ml-2">
                              Battery
                            </Text>
                          </View>
                          {renderStatusIndicator(
                            deviceData.batteryPercentage,
                            "battery",
                            "Percentage",
                            "%"
                          )}
                          {renderStatusIndicator(
                            deviceData.batteryVoltage,
                            "voltage",
                            "Voltage",
                            "V"
                          )}
                        </View>
                      </View>

                      {/* Solar Section */}
                      <View className="w-1/2 pl-2 mb-4">
                        <View className="bg-[#363333] p-3 rounded-lg">
                          <View className="flex-row items-center mb-2">
                            <Ionicons name="sunny" size={18} color="white" />
                            <Text className="text-white font-medium ml-2">
                              Solar
                            </Text>
                          </View>
                          {renderStatusIndicator(
                            deviceData.solarVoltage,
                            "voltage",
                            "Voltage",
                            "V"
                          )}
                          {renderStatusIndicator(
                            deviceData.solarCurrent,
                            "current",
                            "Current",
                            "A"
                          )}
                          {renderStatusIndicator(
                            deviceData.solarWattage,
                            "wattage",
                            "Power",
                            "W"
                          )}
                        </View>
                      </View>

                      {/* Compost 1 Section */}
                      <View className="w-1/2 pr-2">
                        <View className="bg-[#363333] p-3 rounded-lg">
                          <View className="flex-row items-center mb-2">
                            <FontAwesome5
                              name="temperature-high"
                              size={18}
                              color="white"
                            />
                            <Text className="text-white font-medium ml-2">
                              Coco
                            </Text>
                          </View>
                          {renderStatusIndicator(
                            deviceData.compostOneTemperatureIn,
                            "temperature",
                            "Temp In",
                            "°C"
                          )}
                          {renderStatusIndicator(
                            deviceData.compostOneTemperatureOut,
                            "temperature",
                            "Temp Out",
                            "°C"
                          )}
                          {renderStatusIndicator(
                            deviceData.compostOneMethane,
                            "methane",
                            "Methane",
                            ""
                          )}
                          {renderStatusIndicator(
                            deviceData.compostOneMoisture,
                            "moisture",
                            "Moisture",
                            "%"
                          )}
                          {renderStatusIndicator(
                            deviceData.tegOneVoltage,
                            "voltage",
                            "TEG",
                            "V"
                          )}
                        </View>
                      </View>

                      {/* Compost 2 Section */}
                      <View className="w-1/2 pl-2">
                        <View className="bg-[#363333] p-3 rounded-lg">
                          <View className="flex-row items-center mb-2">
                            <FontAwesome5
                              name="temperature-high"
                              size={18}
                              color="white"
                            />
                            <Text className="text-white font-medium ml-2">
                              Mixed
                            </Text>
                          </View>
                          {renderStatusIndicator(
                            deviceData.compostTwoTemperatureIn,
                            "temperature",
                            "Temp In",
                            "°C"
                          )}
                          {renderStatusIndicator(
                            deviceData.compostTwoTemperatureOut,
                            "temperature",
                            "Temp Out",
                            "°C"
                          )}
                          {renderStatusIndicator(
                            deviceData.compostTwoMethane,
                            "methane",
                            "Methane",
                            ""
                          )}
                          {renderStatusIndicator(
                            deviceData.compostTwoMoisture,
                            "moisture",
                            "Moisture",
                            "%"
                          )}
                          {renderStatusIndicator(
                            deviceData.tegTwoVoltage,
                            "voltage",
                            "TEG",
                            "V"
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    {/* <View className="flex-row justify-between mt-4">
                      <Pressable className="bg-[#4B4747] py-2 px-4 rounded-md flex-row items-center">
                        <Ionicons name="analytics-outline" size={16} color="white" />
                        <Text className="text-white text-xs ml-2">View History</Text>
                      </Pressable>
                      <Pressable className="bg-[#4B4747] py-2 px-4 rounded-md flex-row items-center">
                        <Ionicons name="settings-outline" size={16} color="white" />
                        <Text className="text-white text-xs ml-2">Configure</Text>
                      </Pressable>
                    </View> */}
                  </View>
                )}
              </Pressable>
            ))
          ) : (
            <View className="bg-[#2F2C2C] rounded-lg p-4 flex items-center justify-center h-20">
              <Text className="text-gray-400">
                Loading device performance data...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
