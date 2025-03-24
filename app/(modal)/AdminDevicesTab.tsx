import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { View, Alert, Text, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
const { debounce } = require("lodash");

import CustomButton from "@/components/CustomButton";
import RealTimeReading from "@/components/RealTimeReading";
import LineGraphDataVisual from "@/components/LineGraphDataVisual";
import { useAdmin } from "@/context/AdminContext";
import { getYAxisLabelSuffix, getMaxValue } from "@/hooks/deviceFunctions";
import { AllSavedDataProp } from "@/hooks/APICallTypes";
import { API_URL_BASE } from "@/constants/API_URL";
import ChartSkeleton from "@/components/ChartSkeleton";
import { Pressable } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";

const AdminDevicesTab = () => {
  const { admin, token } = useAdmin();
  const deviceIdentifier = admin?.selectedDevice; // Prioritize deviceNumber if both are present\

  const [realTimeData, setRealTimeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chartDataCache, setChartDataCache] = useState<{
    [key: string]: AllSavedDataProp;
  }>({});

  const [deviceType, setDeviceType] = useState<"energy" | "compost" | "solar">(
    "energy"
  ); // Initial: Energy
  const [deviceTime, setDeviceTime] = useState<string>("day"); // Initial: Day
  const [deviceParameter, setDeviceParameter] = useState<string>("voltage"); // Initial: Voltage
  const [selectedReading, setSelectedReading] = useState<string>("BATTERY");
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [currentUsers, setCurrentUsers] = useState<string[]>([]);

  const fetchCurrentUsers = useCallback(async () => {
    if (!deviceIdentifier) {
      console.log("No device identifier provided, cannot fetch current users.");
      return;
    }
    try {
      const tokenForFetch = token;
      const response = await fetch(
        `${API_URL_BASE}/admin/users/specific/${deviceIdentifier}`, // Replace with the actual API endpoint
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
      // Assuming the API returns an array of usernames or user objects with a username property
      setCurrentUsers(responseData.users || []); // Adjust based on the actual response structure
    } catch (error: any) {
      console.error("Error fetching current users:", error);
      // Optionally handle the error (e.g., display a message)
    }
  }, [deviceIdentifier, token, API_URL_BASE, setCurrentUsers]);

  // Function to fetch real-time data
  const fetchRealTimeData = useCallback(async () => {
    if (!deviceIdentifier) {
      console.log("No device identifier provided.");
      return;
    }
    try {
      const tokenForFetch = token;
      const response = await fetch(
        `${API_URL_BASE}/device/${deviceIdentifier}/real-time`, // Assuming backend can handle deviceNumber or deviceId
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

  // Refactored fetchChartData to use cache and handle all combinations:
  const fetchChartData = useCallback(
    async (timeFrame: string, dataType: string, parameter: string) => {
      if (!deviceIdentifier) {
        console.log("No device identifier selected, skipping fetch");
        return null;
      }

      const cacheKey = `${timeFrame}-${dataType}-${parameter}-${deviceIdentifier}`; // Include deviceIdentifier in cache key
      if (chartDataCache[cacheKey]) {
        console.log(`AdminDevicesTab - CACHE HIT for ${cacheKey}`);
        return chartDataCache[cacheKey]; // Return cached data if available
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
          [cacheKey]: rawData, // Store the data directly from the backend
        })); // Update cache

        console.log(`AdminDevicesTab - CACHE UPDATE for ${cacheKey}`);
        return rawData; // Return processed data for direct use
      } catch (error: any) {
        console.error("Error fetching chart data:", error);
        setError(error.message || "Failed to load chart data.");
        Alert.alert(
          "Chart Data Error",
          error.message || "Failed to load chart data."
        );
        return null; // Return null in case of error
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
      // Fetch initial chart data and cache it (Day, Energy, Voltage)
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
    if (!deviceIdentifier) {
      console.log("Device identifier not available yet");
      return;
    }
    fetchCurrentUsers(); // Call the new function here

    fetchInitialData();
  }, [deviceIdentifier, fetchInitialData]);

  // Debounced handlers
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

  // Event handlers
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
    <SafeAreaView className="flex-1">
      <View className="flex-row bg-[#2F2C2C] border-b-[0.5px] border-[#d0cccc] justify-between items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color="white" />
        </Pressable>
        <Text className="text-lg font-bold color-white">
          Viewer: {admin?.username}
        </Text>
        <View className="w-6" />
      </View>
      <View className="flex-1">
        {!deviceIdentifier && (
          <View className="flex-1 justify-center items-center bg-gray-200 ">
            <View className="w-full h-[350px] flex justify-center items-center">
              <Text className="color-gray-400 p-4">
                No device selected. Please go back and select a device.
              </Text>
              <View className="w-[90%] h-[250px] bg-gray-200 rounded-md">
                <View className="w-full h-6 bg-gray-300 mb-2 rounded-sm" />
                <View className="w-full flex-1 flex-row">
                  <View className="w-[10%] h-full bg-gray-300 rounded-sm" />
                  <View className="flex-1 flex justify-end">
                    <View className="w-full h-[40%] bg-gray-300 rounded-sm" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {deviceIdentifier && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 bg-gray-200"
          >
            <View className="w-full flex justify-center items-center bg-[#2F2C2C]">
              {/* Device Number */}
              <View className="w-[92.5%] py-3 flex-col border-[#10B04B] border-b-2 gap-2 flex mt-2">
                <View className="flex flex-row gap-4">
                  <MaterialIcons name="devices" size={25} color="white" />
                  <Text className="font-semibold color-white">
                    {deviceIdentifier}
                  </Text>
                </View>
                {currentUsers.length > 0 && (
                  <View>
                    <Text className="text-xs color-white">
                      Current User:
                    </Text>
                    <View className="flex-row flex-wrap">
                      {currentUsers.map((user, index) => (
                        <Text key={index} className="font-semibold color-white mr-2">
                          {user}
                          {index < currentUsers.length - 1 ? "," : ""}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {currentUsers.length === 0 && (
                  <Text className="text-xs color-white">
                    No users currently using.
                  </Text>
                )}
              </View>

              {/* Device Data Buttons */}
              <View className="w-full justify-center items-center mt-4">
                <View className="w-[72.5%] py-2 flex-row flex justify-between items-center mt-2 gap-2">
                  <CustomButton
                    onPress={handleDeviceEnergyClick}
                    title="TEG"
                    textStyles="text-[8px] font-bold color-white"
                    containerStyles={`flex-1 p-2 align-center bg-gray-800 ${
                      deviceType === "energy"
                        ? "border-[#10B04B] border-2"
                        : "border-gray-100 border-[0.5px]"
                    }`}
                  />
                  <CustomButton
                    onPress={handleSolarEnergyClick}
                    title="Solar"
                    textStyles="text-[8px] font-bold color-white"
                    containerStyles={`flex-1 p-2 align-center bg-gray-800 ${
                      deviceType === "solar"
                        ? "border-[#10B04B] border-2"
                        : "border-gray-100 border-[0.5px]"
                    }`}
                  />

                  <CustomButton
                    onPress={handleDeviceCompostClick}
                    title="Compost Data"
                    textStyles="text-[8px] font-bold color-white"
                    containerStyles={`flex-1 p-2 align-center bg-gray-800 ${
                      deviceType === "compost"
                        ? "border-[#10B04B] border-2"
                        : "border-gray-100 border-[0.5px]"
                    }`}
                  />
                </View>

                {/* Time Period Buttons */}
                <View className="w-[72.5%] pb-3 gap-2 flex-row flex justify-between items-center">
                  {["day", "week", "month"].map((time) => (
                    <CustomButton
                      key={time}
                      onPress={() => handleTimeClick(time)}
                      title={time.charAt(0).toUpperCase() + time.slice(1)} // Capitalize first letter
                      textStyles="text-[8px] font-bold color-white"
                      containerStyles={`flex-1 align-center p-2 bg-gray-800 ${
                        deviceTime === time
                          ? "border-[#10B04B] border-2"
                          : "border-gray-100 border-[0.5px]"
                      } ${
                        !(
                          deviceType === "energy" ||
                          deviceType === "solar" ||
                          deviceType === "compost"
                        ) && "opacity-50 border-green-4 bg-transparent"
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

              {/* Line Chart with Parameter Selection */}
              <View className="w-full flex-col">
                {!(deviceType === "energy") &&
                  !(deviceType === "compost") &&
                  !(deviceType === "solar") && (
                    <View className="w-full h-[350px] justify-center items-center">
                      <Text className="font-semibold">Select A Parameter</Text>
                    </View>
                  )}

                {!isInitialDataLoaded && (
                  <View className="w-full flex-col">
                    <View className="w-full h-[475px] min-h-[475px] rounded-md justify-center items-center">
                      <Text>Loading data...</Text>
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
                        <ChartSkeleton description={null} />
                      ) : error ? (
                        <Text style={{ color: "red" }}>{error}</Text>
                      ) : (
                        <>
                          {deviceType === "energy" &&
                          currentChartData?.tegOne?.length === 0 &&
                          currentChartData?.tegTwo?.length === 0 ? (
                            <ChartSkeleton description={"No TEG Data"} />
                          ) : deviceType === "solar" &&
                            currentChartData?.solar?.length === 0 ? (
                            <ChartSkeleton description={"No Solar Data"} />
                          ) : deviceType === "compost" &&
                            currentChartData?.compostContainerOne?.length ===
                              0 &&
                            currentChartData?.compostContainerTwo?.length ===
                              0 ? (
                            <ChartSkeleton description={"No Compost Data"} />
                          ) : (
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
                          )}
                        </>
                      )}
                    </>
                  )}
              </View>

              {/* Reading for Power*/}
              <View className="w-full justify-center items-center p-5 border-gray-100 border-t-[0.5px]">
                <View className="w-full flex-row justify-center items-center pt-2 bg-[#2F2C2C]">
                  <View className="w-full flex-row justify-between items-center  gap-[1px] bg-[#2F2C2C]">
                    {["SOLAR", "BATTERY", "COMPOST #1", "COMPOST #2"].map(
                      (itemTitle) => (
                        <CustomButton
                          key={itemTitle}
                          onPress={() => selectReading(itemTitle)}
                          title={itemTitle}
                          textStyles="text-[7px] font-bold color-white"
                          containerStyles={`flex-1 py-5 align-center bg-gray-800 ${
                            selectedReading === itemTitle
                              ? "border-[#10B04B] border-2"
                              : ""
                          }`}
                        />
                      )
                    )}
                  </View>
                </View>
                <RealTimeReading
                  realTimeData={realTimeData}
                  selectedReading={selectedReading}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AdminDevicesTab;
