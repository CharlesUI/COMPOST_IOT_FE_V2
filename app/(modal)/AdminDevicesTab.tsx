import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View, Alert, Text, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
const { debounce } = require("lodash");

import HeaderSection from "@/components/HeaderSection";
import CustomButton from "@/components/CustomButton";
import RealTimeReading from "@/components/RealTimeReading";
import LineGraphDataVisual from "@/components/LineGraphDataVisual";
import { useAdmin } from "@/context/AdminContext";
import { getYAxisLabelSuffix, getMaxValue } from "@/hooks/deviceFunctions";
import { AllSavedDataProp } from "@/hooks/APICallTypes";
import { API_URL_BASE } from "@/constants/API_URL";
import ChartSkeleton from "@/components/ChartSkeleton";

const AdminDevicesTab = () => {
  const { admin, token } = useAdmin();
  const deviceIdentifier = admin?.selectedDevice;

  const [realTimeData, setRealTimeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chartDataCache, setChartDataCache] = useState<{
    [key: string]: AllSavedDataProp;
  }>({});

  const [deviceType, setDeviceType] = useState<"energy" | "compost" | "solar">(
    "energy"
  );
  const [deviceTime, setDeviceTime] = useState<string>("day");
  const [deviceParameter, setDeviceParameter] = useState<string>("voltage");
  const [selectedReading, setSelectedReading] = useState<string>("BATTERY");
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [currentUsers, setCurrentUsers] = useState<string[]>();

    // Create a memoized reset function
    const resetDeviceStates = useCallback(() => {
      setRealTimeData(null);
      setChartDataCache({});
      setDeviceType("energy");
      setDeviceTime("day");
      setDeviceParameter("voltage");
      setSelectedReading("BATTERY");
      setIsInitialDataLoaded(false);
      setError(null);
    }, []);

  const fetchCurrentUsers = useCallback(async () => {
    if (!deviceIdentifier) {
      console.log("No device identifier provided, cannot fetch current users.");
      return;
    }
    try {
      const tokenForFetch = token;
      const response = await fetch(
        `${API_URL_BASE}/admin/users/specific/${deviceIdentifier}`,
        {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
        }
      );

      if (!response.ok) {
        const message = `Workspace current users failed: ${response.status}`;
        throw new Error(message);
      }
      const responseData = await response.json();
      console.log("Current Users API Response:", responseData);
      setCurrentUsers(responseData.users || []);
    } catch (error: any) {
      console.error("Error fetching current users:", error);
    }
  }, [deviceIdentifier, token, API_URL_BASE, setCurrentUsers]);

  const fetchRealTimeData = useCallback(async () => {
    if (!deviceIdentifier) {
      console.log("No device identifier provided.");
      return;
    }
    try {
      const tokenForFetch = token;
      const response = await fetch(
        `${API_URL_BASE}/device/${deviceIdentifier}/real-time`,
        {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
        }
      );

      if (!response.ok) {
        const message = `Real-time data fetch failed: ${response.status}`;
        throw new Error(message);
      }
      const responseData = await response.json();
      console.log("Real-time API Response:", responseData);
      setRealTimeData(responseData.realTimeData);
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
    deviceIdentifier,
    setIsLoading,
    setError,
    setRealTimeData,
    token,
    API_URL_BASE,
  ]);

  const fetchChartData = useCallback(
    async (timeFrame: string, dataType: string, parameter: string) => {
      if (!deviceIdentifier) {
        console.log("No device identifier selected, skipping fetch");
        return null;
      }

      const cacheKey = `${timeFrame}-${dataType}-${parameter}-${deviceIdentifier}`;
      if (chartDataCache[cacheKey]) {
        console.log(`AdminDevicesTab - CACHE HIT for ${cacheKey}`);
        return chartDataCache[cacheKey];
      }

      setIsLoading(true);
      setError(null);

      try {
        const tokenForFetch = token;

        const queryString = new URLSearchParams({
          timeFrame,
          dataType,
          parameter,
        }).toString();
        const apiUrl = `${API_URL_BASE}/device/${deviceIdentifier}/saved-time-frame?${queryString}`;

        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
        });

        if (!response.ok) {
          const message = `Chart data fetch failed: ${response.status}`;
          throw new Error(message);
        }
        const responseData = await response.json();

        const rawData = responseData.data;

        setChartDataCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: rawData,
        }));

        console.log(`AdminDevicesTab - CACHE UPDATE for ${cacheKey}`);
        return rawData;
      } catch (error: any) {
        console.error("Error fetching chart data:", error);
        setError(error.message || "Failed to load chart data.");
        Alert.alert(
          "Chart Data Error",
          error.message || "Failed to load chart data."
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [
      deviceIdentifier,
      setIsLoading,
      setError,
      chartDataCache,
      token,
      API_URL_BASE,
    ]
  );

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchRealTimeData();
      await fetchChartData(deviceTime, deviceType, deviceParameter);
    } catch (apiError: any) {
      setError(apiError.message || "Failed to load initial device data.");
      Alert.alert(
        "Data Load Error",
        apiError.message || "Failed to load initial device data."
      );
    } finally {
      setIsLoading(false);
      setIsInitialDataLoaded(true);
    }
  }, [
    fetchRealTimeData,
    fetchChartData,
    setIsLoading,
    setError,
    setIsInitialDataLoaded,
    deviceTime,
    deviceType,
    deviceParameter,
  ]);

  useEffect(() => {
    resetDeviceStates();
  }, [deviceIdentifier])

  useEffect(() => {
    if (!deviceIdentifier) {
      console.log("Device identifier not available yet");
      return;
    }
    fetchCurrentUsers();
    fetchInitialData();
  }, [deviceIdentifier, fetchInitialData, fetchCurrentUsers]);

  const debouncedSetParameter = useRef(
    debounce(async (parameter: string) => {
      setIsLoading(true);
      setDeviceParameter(parameter);

      if (
        deviceTime &&
        (deviceType === "energy" ||
          deviceType === "solar" ||
          deviceType === "compost")
      ) {
        const dataType = deviceType;
        await fetchChartData(deviceTime, dataType, parameter);
      } else {
        setIsLoading(false);
      }
      setIsLoading(false);
    }, 200)
  ).current;

  const debouncedSetTime = useRef(
    debounce(async (time: string) => {
      setIsLoading(true);
      setDeviceTime(time);

      if (
        (deviceType === "energy" ||
          deviceType === "solar" ||
          deviceType === "compost") &&
        deviceParameter
      ) {
        const dataType = deviceType;
        await fetchChartData(time, dataType, deviceParameter);
      } else {
        setIsLoading(false);
      }
      setIsLoading(false);
    }, 200)
  ).current;

  const handleTimeClick = (time: string) => {
    debouncedSetTime(time);
  };

  const handleParameterChange = (parameter: string) => {
    debouncedSetParameter(parameter);
  };

  const handleDeviceEnergyClick = async () => {
    setIsLoading(true);
    setDeviceType("energy");
    setDeviceParameter("voltage");
    await fetchChartData(deviceTime, "energy", "voltage");
    setIsLoading(false);
  };

  const handleSolarEnergyClick = async () => {
    setIsLoading(true);
    setDeviceType("solar");
    setDeviceParameter("voltage");
    await fetchChartData(deviceTime, "solar", "voltage");
    setIsLoading(false);
  };

  const handleDeviceCompostClick = async () => {
    setIsLoading(true);
    setDeviceType("compost");
    setDeviceParameter("methane");
    await fetchChartData(deviceTime, "compost", "methane");
    setIsLoading(false);
  };

  const getChartDataForDisplay = useMemo(() => {
    const dataType = deviceType;
    const parameter = deviceParameter;
    const timeFrame = deviceTime;
    const cacheKey = `${timeFrame}-${dataType}-${parameter}-${deviceIdentifier}`;

    return (
      chartDataCache[cacheKey] || {
        solar: [],
        tegOne: [],
        tegTwo: [],
        compostContainerOne: [],
        compostContainerTwo: [],
      }
    );
  }, [
    deviceTime,
    deviceParameter,
    deviceType,
    chartDataCache,
    deviceIdentifier,
  ]);

  const selectReading = (title: string) => {
    setSelectedReading(title);
  };

  const currentChartData = getChartDataForDisplay;
  console.log(
    "currentChartData",
    currentChartData.tegOne?.length,
    currentChartData.tegTwo?.length,
    currentChartData.compostContainerOne?.length,
    currentChartData.compostContainerTwo?.length,
    currentChartData.solar?.length
  );

  console.log("ADMIN IN DEVICE", admin);

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <View className="flex-1">
        <View className="flex-row bg-[#2F2C2C] border-b-[0.5px] border-[#d0cccc] justify-between items-center px-4 py-3">
          <Pressable onPress={() => router.back()} className="p-2">
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable>
          <Text className="text-lg font-bold color-white">
            Viewer: {admin?.username}
          </Text>
          <View className="w-6" />
        </View>

        {!deviceIdentifier && (
          <View className="flex-1 justify-center items-center bg-[#1E1E1E] px-4">
            <View className="w-full bg-[#2A2A2A] rounded-2xl p-6 shadow-lg">
              <Text className="text-gray-400 text-center text-lg mb-4">
                No device selected. Please go back and select a device.
              </Text>
              <View className="w-full h-[200px] bg-[#3A3A3A] rounded-xl animate-pulse" />
            </View>
          </View>
        )}

        {deviceIdentifier && (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="bg-[#1E1E1E] rounded-b-3xl overflow-hidden">
              {/* Device Number Section with Elegant Design */}
              <View className="w-full px-4 py-4 bg-[#2A2A2A] flex-row justify-between items-center">
                <View className="flex-row items-center space-x-3">
                  <MaterialIcons name="devices" size={28} color="#10B04B" />
                  <Text className="text-white text-lg font-semibold">
                    {deviceIdentifier}
                  </Text>
                </View>
              </View>

              {currentUsers?.length! > 0 && (
                <View className="px-4 py-2 bg-[#2A2A2A]">
                  <Text className="text-gray-400 text-xs mb-1">
                    Current User(s):
                  </Text>
                  <View className="flex-row flex-wrap">
                    {currentUsers?.map((user, index) => (
                      <Text
                        key={index}
                        className="text-white text-xs font-semibold mr-2"
                      >
                        {user}
                        {index < currentUsers.length - 1 ? ", " : ""}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
              {currentUsers?.length === 0 && (
                <View className="px-4 py-2 bg-[#2A2A2A]">
                  <Text className="text-gray-400 text-xs">
                    No users currently using.
                  </Text>
                </View>
              )}

              {/* Device Type Selection with Improved UI */}
              <View className="px-4 mt-4">
                <View className="flex-row gap-2 space-x-3 justify-between">
                  {[
                    {
                      title: "TEG",
                      type: "energy",
                      onPress: handleDeviceEnergyClick,
                    },
                    {
                      title: "Solar",
                      type: "solar",
                      onPress: handleSolarEnergyClick,
                    },
                    {
                      title: "Compost",
                      type: "compost",
                      onPress: handleDeviceCompostClick,
                    },
                  ].map((device) => (
                    <CustomButton
                      key={device.type}
                      onPress={device.onPress}
                      title={device.title}
                      textStyles={`text-xs font-bold ${
                        deviceType === device.type
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                      containerStyles={`flex-1 p-3 rounded-xl ${
                        deviceType === device.type
                          ? "bg-[#10B04B]/30 border-2 border-[#10B04B]"
                          : "bg-[#2A2A2A]"
                      }`}
                    />
                  ))}
                </View>
              </View>

              {/* Time Period Selection with Improved Design */}
              <View className="px-4 mt-4">
                <View className="flex-row gap-2 space-x-3">
                  {["day", "week", "month"].map((time) => (
                    <CustomButton
                      key={time}
                      onPress={() => handleTimeClick(time)}
                      title={time.charAt(0).toUpperCase() + time.slice(1)}
                      textStyles={`text-xs font-bold ${
                        deviceTime === time ? "text-white" : "text-gray-400"
                      }`}
                      containerStyles={`flex-1 p-3 rounded-xl ${
                        deviceTime === time
                          ? "bg-[#10B04B]/30 border-2 border-[#10B04B]"
                          : "bg-[#2A2A2A]"
                      }`}
                      disabled={
                        !(
                          deviceType === "energy" ||
                          deviceType === "solar" ||
                          deviceType === "compost"
                        )
                      }
                    />
                  ))}
                </View>
              </View>

              {/* Line Chart with Parameter Selection for Energy and Compost*/}
              <View className="w-full flex-col">
                {!(deviceType === "energy") &&
                  !(deviceType === "compost") &&
                  !(deviceType === "solar") && (
                    <View className="w-full h-[350px] justify-center items-center">
                      <Text className="font-semibold text-white">
                        Select A Parameter
                      </Text>
                    </View>
                  )}

                {!isInitialDataLoaded && (
                  <View className="w-full flex-col">
                    <View className="w-full h-[475px] min-h-[475px] rounded-md justify-center items-center">
                      <Text className="text-white">Loading data...</Text>
                      <ActivityIndicator color={"#DE0F3F"} size={"small"} />
                    </View>
                  </View>
                )}

                {/* For The LineGraph */}
                {(deviceType === "energy" ||
                  deviceType === "solar" ||
                  deviceType === "compost") &&
                  isInitialDataLoaded && (
                    <>
                      {isLoading ? (
                        <ChartSkeleton description={""} />
                      ) : error ? (
                        <Text style={{ color: "red" }}>{error}</Text>
                      ) : (
                        <>
                          <LineGraphDataVisual
                            deviceTime={deviceTime}
                            chartData={currentChartData}
                            isLoading={isLoading}
                            isDeviceCompostSelected={deviceType === "compost"}
                            isDeviceEnergySelected={deviceType === "energy"}
                            isSolarSelected={deviceType === "solar"}
                            deviceParameter={deviceParameter}
                            getMaxValue={getMaxValue}
                            getYAxisLabelSuffix={getYAxisLabelSuffix}
                            handleParameterChange={handleParameterChange}
                          />
                        </>
                      )}
                    </>
                  )}
              </View>

              {/* Replace the existing reading buttons section with this */}
              <View className="w-full justify-center items-center p-5 bg-[#1E1E1E]">
                <View className="w-full bg-[#2A2A2A] rounded-2xl overflow-hidden">
                  <View className="flex-row">
                    {["SOLAR", "BATTERY", "COMPOST #1", "COMPOST #2"].map(
                      (itemTitle) => (
                        <TouchableOpacity
                          key={itemTitle}
                          onPress={() => selectReading(itemTitle)}
                          className={`flex-1 p-4 items-center justify-center ${
                            selectedReading === itemTitle
                              ? "bg-[#10B04B]/30 border-b-2 border-[#10B04B]"
                              : "bg-[#2A2A2A]"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold uppercase ${
                              selectedReading === itemTitle
                                ? "text-white"
                                : "text-gray-400"
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

                  {/* Subtle divider */}
                  <View className="h-[1px] w-full bg-[#10B04B]/20" />

                  {/* RealTimeReading component */}
                  <RealTimeReading
                    realTimeData={realTimeData}
                    selectedReading={selectedReading}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AdminDevicesTab;
