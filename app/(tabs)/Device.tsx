import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Alert,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
const { debounce } = require("lodash");

import HeaderSection from "@/components/HeaderSection";
import CustomButton from "@/components/CustomButton";
import RealTimeReading from "@/components/RealTimeReading";
import LineGraphDataVisual from "@/components/LineGraphDataVisual";
import { useUser } from "@/context/UserContext";
import { getYAxisLabelSuffix, getMaxValue } from "@/hooks/deviceFunctions";
import { AllSavedDataProp } from "@/hooks/APICallTypes";
import { API_URL_BASE } from "@/constants/API_URL";

// Create a skeleton loader component for better UX during loading
const ChartSkeleton = () => (
  <View className="w-full h-[350px] flex justify-center items-center">
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
);

const TIME_INTERVALS: any = {
  day: 15, // 15 minutes interval for day view (This might still be used for backend querying if needed)
  week: 180, // 3 hours interval for week view (This might still be used for backend querying if needed)
  month: 240, // 4 hours interval for month view (This might still be used for backend querying if needed)
};

const Device = () => {
  const { user, token, updateToken } = useUser();
  console.log("User", user);

  const [deviceNumber, setDeviceNumber] = useState<string>("CMPST10923");
  const [realTimeData, setRealTimeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // **Refactored Chart Data State - Cache for all combinations:**

  const [chartDataCache, setChartDataCache] = useState<{
    [key: string]: AllSavedDataProp;
  }>({});

  // **UI State - Device Type, Time, Parameter Selections (Keep these):**
  const [deviceType, setDeviceType] = useState<string>("energy"); // Initial: Energy
  const [deviceTime, setDeviceTime] = useState<string>("day"); // Initial: Day
  const [deviceParameter, setDeviceParameter] = useState<string>("voltage"); // Initial: Voltage
  const [selectedReading, setSelectedReading] = useState<string>("BATTERY");
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [isChartDataLoaded, setIsChartDataLoaded] = useState(false);

  console.log(
    `${API_URL_BASE}/device/${deviceNumber}/saved-time-frame?timeFrame=${deviceTime}&dataType=${deviceType}&parameter=${deviceParameter}`
  );

  // Function to fetch real-time data (KEEP)
  const fetchRealTimeData = useCallback(async () => {
    console.log("fetchRealTimeData START - isLoading:", isLoading);
    try {
      const tokenForFetch = token;
      const response = await fetch(
        `${API_URL_BASE}/device/${deviceNumber}/real-time`,
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
      console.log("fetchRealTimeData FINALLY - isLoading:", isLoading);
    }
  }, [deviceNumber, setIsLoading, setError, setRealTimeData, token, API_URL_BASE]);

  // **Refactored fetchChartData to use cache and handle all combinations:**
  const fetchChartData = useCallback(
    async (timeFrame: string, dataType: string, parameter: string) => {
      const cacheKey = `${timeFrame}-${dataType}-${parameter}`; // Unique cache key
      if (chartDataCache[cacheKey]) {
        console.log(`WorkspaceChartData - CACHE HIT for ${cacheKey}`);
        return chartDataCache[cacheKey]; // Return cached data if available
      }

      setIsLoading(true);
      setIsChartDataLoaded(false);
      setError(null);

      try {
        const tokenForFetch = token;

        const queryString = new URLSearchParams({
          timeFrame,
          dataType,
          parameter,
        }).toString();
        const apiUrl = `${API_URL_BASE}/device/${deviceNumber}/saved-time-frame?${queryString}`;

        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
        });

        if (!response.ok) {
          const message = `Chart data fetch failed: ${response.status}`;
          throw new Error(message);
        }
        const responseData = await response.json();
        const rawData = responseData.data; // API returns data in responseData.data

        // **No need for frontend processing here anymore **
        // const intervalMins = TIME_INTERVALS[timeFrame];
        // const processedData = filterAndFormatAllData(rawData, intervalMins);

        // **Cache and return processed data:**
        setChartDataCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: rawData, // Store the data directly from the backend
        })); // Update cache
        console.log(`WorkspaceChartData - CACHE UPDATE for ${cacheKey}`);
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
        setIsChartDataLoaded(true);
        console.log(
          "fetchChartData FINALLY - timeFrame:",
          timeFrame,
          " || dataType:",
          dataType,
          " || parameter:",
          parameter,
          " || isLoading:",
          isLoading
        );
      }
    },
    [
      deviceNumber,
      setIsLoading,
      setError,
      // filterAndFormatAllData, // Removed
      setIsChartDataLoaded,
      chartDataCache,
      token,
      API_URL_BASE,
    ]
  );

  const fetchInitialData = useCallback(async () => {
    console.log("fetchInitialData START - isLoading:", isLoading);
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
      setIsChartDataLoaded(true);
      console.log("fetchInitialData FINALLY - isLoading:", isLoading);
    }
  }, [
    fetchRealTimeData,
    fetchChartData, // fetchChartData is now useCallback and memoized
    setIsLoading,
    setError,
    setIsInitialDataLoaded,
    setIsChartDataLoaded,
    deviceTime,
    deviceType,
    deviceParameter,
  ]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Debounced handlers (KEEP these and modify to use fetchChartData):
  const debouncedSetParameter = useRef(
    debounce(async (parameter: string) => {
      // Make debounced functions async
      console.log(
        "debouncedSetParameter - START",
        "parameter:",
        parameter,
        "isLoading:",
        isLoading
      );
      setIsLoading(true);
      setDeviceParameter(parameter);

      if (deviceTime && (deviceType === "energy" || deviceType === "compost")) {
        const dataType = deviceType;
        await fetchChartData(deviceTime, dataType, parameter); // Await fetchChartData
      } else {
        setIsLoading(false);
        console.log(
          "debouncedSetParameter - setIsLoading(false) - no time or device - isLoading:",
          isLoading
        );
      }
      setIsLoading(false); // Ensure loading is set to false after fetch completes or fails
      console.log("debouncedSetParameter - END");
    }, 200)
  ).current;

  const debouncedSetTime = useRef(
    debounce(async (time: string) => {
      // Make debounced function async
      setIsLoading(true);
      setDeviceTime(time);

      if (
        (deviceType === "energy" || deviceType === "compost") &&
        deviceParameter
      ) {
        const dataType = deviceType;
        await fetchChartData(time, dataType, deviceParameter); // Await fetchChartData
      } else {
        setIsLoading(false);
      }
      setIsLoading(false); // Ensure loading is set to false after fetch completes or fails
    }, 200)
  ).current;

  // Event handlers (MODIFY to use fetchChartData):
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

    await fetchChartData(deviceTime, "energy", "voltage"); // Await fetchChartData

    setIsLoading(false);
  };

  const handleDeviceCompostClick = async () => {
    setIsLoading(true);
    setDeviceType("compost");
    setDeviceParameter("methane");

    await fetchChartData(deviceTime, "compost", "methane"); // Await fetchChartData

    setIsLoading(false);
  };

  const getChartDataForDisplay = useMemo(() => {
    const dataType = deviceType;
    const parameter = deviceParameter;
    const timeFrame = deviceTime;
    const cacheKey = `${timeFrame}-${dataType}-${parameter}`;

    return chartDataCache[cacheKey] || {
      solar: [],
      teg: [],
      compostContainerOne: [],
      compostContainerTwo: [],
    };
  }, [deviceTime, deviceParameter, deviceType, chartDataCache]);

  const selectReading = (title: string) => {
    setSelectedReading(title);
  };

  const currentChartData = getChartDataForDisplay; // Use memoized chart data

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <HeaderSection headerText="Device" title="User" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-gray-200"
        >
          <View className="w-full flex justify-center items-center bg-[#2F2C2C]">
            {/* Device Number */}
            <View className="w-[92.5%] py-3 flex-row border-[#10B04B] border-b-2 flex justify-between items-center mt-2">
              <View className="flex flex-row gap-4">
                <MaterialIcons name="devices" size={25} color="white" />
                <Text className="font-semibold color-white">
                  {deviceNumber}
                </Text>
              </View>

              <CustomButton
                onPress={() => console.log("HELP")}
                title="HELP"
                containerStyles="border-[0]"
                textStyles="color-white"
              />
            </View>

            {/* Device Data Buttons */}
            <View className="w-full justify-center items-center bg-[#2F2C2C] mt-4">
              <View className="w-[72.5%] py-2 flex-row flex justify-between items-center mt-2 gap-2">
                <CustomButton
                  onPress={handleDeviceEnergyClick}
                  title="Energy Data"
                  textStyles="text-[8px] font-bold color-white"
                  containerStyles={`w-[40%] p-2 align-center bg-gray-800 ${
                    deviceType === "energy"
                      ? "border-[#10B04B] border-2"
                      : "border-gray-100 border-[0.5px]"
                  }`}
                />

                <CustomButton
                  onPress={handleDeviceCompostClick}
                  title="Compost Data"
                  textStyles="text-[8px] font-bold color-white"
                  containerStyles={`w-[40%] p-2 align-center bg-gray-800 ${
                    deviceType === "compost"
                      ? "border-[#10B04B] border-2"
                      : "border-gray-100 border-[0.5px]"
                  }`}
                />
              </View>

              {/* Time Period Buttons */}
              <View className="w-[72.5%] pb-3 flex-row flex justify-between items-center">
                {["day", "week", "month"].map((time) => (
                  <CustomButton
                    key={time}
                    onPress={() => handleTimeClick(time)}
                    title={time.charAt(0).toUpperCase() + time.slice(1)} // Capitalize first letter
                    textStyles="text-[8px] font-bold color-white"
                    containerStyles={`w-1/4 align-center p-2 bg-gray-800 ${
                      deviceTime === time
                        ? "border-[#10B04B] border-2"
                        : "border-gray-100 border-[0.5px]"
                    } ${
                      !(deviceType === "energy" || deviceType === "compost") &&
                      "opacity-50 border-green-4 bg-transparent"
                    }`}
                    disabled={
                      !(deviceType === "energy" || deviceType === "compost")
                    }
                  />
                ))}
              </View>
            </View>

            {/* Line Chart with Parameter Selection for Energy and Compost*/}
            <View className="w-full flex-col">
              {!(deviceType === "energy") && !(deviceType === "compost") && (
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
              {(deviceType === "energy" || deviceType === "compost") &&
                isInitialDataLoaded && (
                  <>
                    {isLoading ? (
                      <ChartSkeleton />
                    ) : error ? (
                      <Text style={{ color: "red" }}>{error}</Text>
                    ) : (
                      <>
                        <LineGraphDataVisual
                          deviceTime={deviceTime}
                          chartData={currentChartData} // Use memoized chart data
                          isLoading={isLoading}
                          isDeviceCompostSelected={deviceType === "compost"}
                          isDeviceEnergySelected={deviceType === "energy"}
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

            {/* Reading for Power*/}
            <View className="w-full justify-center items-center p-5 border-gray-100 border-t-[0.5px]">
              <View className="w-full flex-row justify-center items-center pt-2 bg-[#2F2C2C]">
                <View className="w-full flex-row justify-between items-center  gap-[1px] bg-[#2F2C2C]">
                  {[
                    "SOLAR",
                    "TEG",
                    "BATTERY",
                    "COMPOST1",
                    "COMPOST2",
                  ].map((itemTitle) => (
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
                  ))}
                </View>
              </View>
              <RealTimeReading
                realTimeData={realTimeData}
                selectedReading={selectedReading}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Device;