import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Assuming these components and hooks exist and function as expected
import LineGraphDataVisual from "@/components/LineGraphDataVisual"; // Ensure this component accepts the new props
import { useUser } from "@/context/UserContext";
import { getYAxisLabelSuffix, getMaxValue } from "@/hooks/deviceFunctions";
// AllSavedDataProp might not be the correct type for the raw response anymore if only one container is expected.
// Consider adjusting if the API structure changes significantly.
// For chartData state, we now use any[]
import { API_URL_BASE } from "@/constants/API_URL";

const { width } = Dimensions.get("window");

// Define a type for the summary state for better type safety
type SummaryValues = {
    average: string;
    peak: string;
};
type SummaryState = {
    methane?: SummaryValues;
    moisture?: SummaryValues;
    temperatureIn?: SummaryValues;
    temperatureOut?: SummaryValues;
    voltage?: SummaryValues;
    current?: SummaryValues;
    wattage?: SummaryValues;
};

const CocoStats = () => {
  const { user, token, abortController } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]); // Changed to simple array
  const [deviceTime, setDeviceTime] = useState<string>("day");
  const [deviceParameter, setDeviceParameter] = useState<string>("methane"); // Default compost
  const [selectedDataType, setSelectedDataType] = useState<"compost" | "teg">("compost");
  const [isRefreshing, setIsRefreshing] = useState(false); // Changed from refreshing
  const [summary, setSummary] = useState<SummaryState>({}); // Added Summary State

  const iconMapping: any = {
    methane: "wind",
    moisture: "tint",
    temperatureIn: "temperature-high",
    temperatureOut: "temperature-low",
    voltage: "bolt",
    current: "exchange-alt",
    wattage: "plug",
  };

  // Helper to get the correct suffix for summary calculation
  const getSummarySuffix = (param: string, dataType: "compost" | "teg"): string => {
    if (dataType === "compost") {
      switch (param) {
        case "methane": return " ppm";
        case "moisture": return "%";
        case "temperatureIn":
        case "temperatureOut": return "°C";
        default: return "";
      }
    } else { // TEG
      switch (param) {
        case "voltage": return "V";
        case "current": return "A";
        case "wattage": return "W";
        default: return "";
      }
    }
  };

  // Helper function to reset summary for a specific parameter
  const resetSummary = (parameter: string, dataType: "compost" | "teg") => {
      const suffix = getSummarySuffix(parameter, dataType);
      setSummary(prev => ({
          ...prev,
          [parameter]: { average: `0${suffix}`, peak: `0${suffix}` }
      }));
  };


  // Calculate summary statistics from the data
  const calculateSummary = (data: any[], parameter: string, dataType: "compost" | "teg") => {
    if (!data || data.length === 0) {
        resetSummary(parameter, dataType);
        return;
    }

    try {
      // Extract values, filtering out any null/undefined/NaN
      const values = data
        .map(item => parseFloat(item.value)) // Assuming data format { timestamp: ..., value: ... }
        .filter(val => !isNaN(val));

      if (values.length === 0) {
        resetSummary(parameter, dataType);
        return;
      }

      // Calculate average and peak
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      const peak = Math.max(...values);

      // Format with appropriate units
      const suffix = getSummarySuffix(parameter, dataType);

      setSummary(prev => ({
        ...prev,
        [parameter]: {
            average: `${avg.toFixed(1)}${suffix}`,
            peak: `${peak.toFixed(1)}${suffix}`
        }
      }));
    } catch (err) {
      console.error("Error calculating summary:", err);
      resetSummary(parameter, dataType); // Reset on error
    }
  };


  const fetchChartData = useCallback(
    async (timeFrame: string, parameter: string, dataType: "compost" | "teg") => {
      if (!user?.selectedDevice) return;
      setIsLoading(true);
      setError(null);
      try {
        const tokenForFetch = token;
        const queryString = new URLSearchParams({
          timeFrame,
          dataType: dataType === "teg" ? "energy" : "compost", // API expects 'energy' for TEG
          parameter,
        }).toString();
        const apiUrl = `${API_URL_BASE}/device/${user?.selectedDevice}/saved-time-frame?${queryString}`;

        console.log("API URL in MIXED:", apiUrl);
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
          signal: abortController.signal,
        });
        if (!response.ok) {
          const message = `Mixed chart data fetch failed: ${response.status}`;
          throw new Error(message);
        }
        const responseData = await response.json();

        // --- MODIFIED DATA HANDLING ---
        let dataArray: any[] = [];
        if (dataType === "compost" && responseData.data?.compostContainerOne) {
            dataArray = responseData.data.compostContainerOne;
            console.log("Fetched Compost Container ONE data:", dataArray.length);
        } else if (dataType === "teg" && responseData.data?.tegOne) {
            dataArray = responseData.data.tegOne;
            console.log("Fetched TEG ONE data:", dataArray.length);
        } else {
            console.warn(`Data key (${dataType === "compost" ? 'compostContainerOne' : 'tegOne'}) not found in response:`, responseData.data);
            dataArray = []; // Ensure it's an empty array if data key is missing
        }

        if (Array.isArray(dataArray)) {
            setChartData(dataArray); // Set the specific array to state
            calculateSummary(dataArray, parameter, dataType); // Calculate summary
        } else {
            console.error(`${dataType} data received is not an array:`, dataArray);
            setChartData([]); // Set empty array if not valid
            resetSummary(parameter, dataType); // Reset summary
        }
        // --- END MODIFIED DATA HANDLING ---

      } catch (err: any) {
        console.error(`Error fetching ${dataType} chart data:`, err);
        setError(err.message || `Failed to load ${dataType} chart data.`);
        setChartData([]); // Clear data on error
        resetSummary(parameter, dataType); // Reset summary on error
      } finally {
        setIsLoading(false);
        setIsRefreshing(false); // Changed from setRefreshing
      }
    },
    [user?.selectedDevice, token, API_URL_BASE, abortController] // Removed calculateSummary from deps, it doesn't depend on render cycle
  );

  // Effect to fetch data when time, parameter, or data type changes
  useEffect(() => {
    // No need to change parameter here, fetchChartData uses the current deviceParameter state
    fetchChartData(deviceTime, deviceParameter, selectedDataType);
  }, [fetchChartData, deviceTime, deviceParameter, selectedDataType]); // Added deviceParameter dependency


   // Effect to handle switching default parameter when data type changes
   useEffect(() => {
       const newParameter = selectedDataType === 'teg' ? 'voltage' : 'methane';
       setDeviceParameter(newParameter);
       // Fetching will be triggered by the previous useEffect because deviceParameter changes
       // Reset summary for the new parameter/datatype combo immediately
       resetSummary(newParameter, selectedDataType);
   }, [selectedDataType]); // Only run when selectedDataType changes


  const handleTimeChange = (time: string) => {
    setDeviceTime(time);
    // Fetching handled by useEffect
  };

  const handleParameterChange = (parameter: string) => {
    setDeviceParameter(parameter);
    // Fetching handled by useEffect
  };

  const handleDataTypeChange = (type: "compost" | "teg") => {
    setSelectedDataType(type);
    // The parameter change and subsequent fetch are handled by the second useEffect
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true); // Changed from setRefreshing
    fetchChartData(deviceTime, deviceParameter, selectedDataType);
  }, [deviceTime, deviceParameter, selectedDataType, fetchChartData]);

  // Get current summary values or fallback
  const currentAvg = summary[deviceParameter as keyof SummaryState]?.average || 'N/A';
  const currentPeak = summary[deviceParameter as keyof SummaryState]?.peak || 'N/A';

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <LinearGradient
        colors={['#121212', '#1A1A1A']}
        className="absolute inset-0"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-2 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing} // Changed from refreshing
            onRefresh={onRefresh}
            tintColor={"#10B04B"}
          />
        }
      >
        <View className="bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-lg mb-6">
          {/* Header */}
          <LinearGradient
            colors={['#2A2A2A', '#232323']}
            className="p-4 flex-row justify-between items-center border-b border-[#333]"
          >
            <View className="flex-row items-center">
               <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${selectedDataType === 'compost' ? 'bg-[#10B04B]/20' : 'bg-[#FFD700]/20'}`}>
                 <FontAwesome5
                    name={selectedDataType === 'compost' ? "leaf" : "bolt"}
                    size={18}
                    color={selectedDataType === 'compost' ? "#10B04B" : "#FFD700"} />
               </View>
              <Text className="text-white text-lg font-semibold">
                {selectedDataType === 'compost' ? 'COCO Data' : 'TEG Data'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-[#333] w-8 h-8 rounded-full items-center justify-center"
            >
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Content area */}
          <View className="p-4">
            {/* Data Type Selection Buttons */}
            <View className="flex-row justify-around mb-6">
                <TouchableOpacity
                  onPress={() => handleDataTypeChange("compost")}
                  className={`flex-1 py-3 mx-2 rounded-xl items-center justify-center flex-row ${
                    selectedDataType === "compost"
                      ? "bg-[#10B04B]/20 border border-[#10B04B]"
                      : "bg-[#2A2A2A]"
                  }`}
                >
                  <FontAwesome5
                    name="leaf"
                    size={14}
                    color={selectedDataType === "compost" ? "#10B04B" : "#666"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className={`text-xs font-bold uppercase ${
                      selectedDataType === "compost" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    COCO
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDataTypeChange("teg")}
                   className={`flex-1 py-3 mx-2 rounded-xl items-center justify-center flex-row ${
                    selectedDataType === "teg"
                      ? "bg-[#FFD700]/20 border border-[#FFD700]" // Use TEG color scheme
                      : "bg-[#2A2A2A]"
                  }`}
                >
                  <FontAwesome5
                    name="bolt"
                    size={14}
                    color={selectedDataType === "teg" ? "#FFD700" : "#666"} // Use TEG color scheme
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className={`text-xs font-bold uppercase ${
                      selectedDataType === "teg" ? "text-white" : "text-gray-400"
                    }`}
                  >
                    TEG COCO
                  </Text>
                </TouchableOpacity>
            </View>

            {/* Time Period Selection */}
            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-2 px-1">Time Period</Text>
              <View className="flex-row justify-around">
                {["day", "week", "month"].map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => handleTimeChange(time)}
                    className={`flex-1 py-3 mx-1 rounded-xl items-center justify-center ${
                      deviceTime === time
                        ? "bg-[#10B04B]/20 border border-[#10B04B]"
                        : "bg-[#2A2A2A]"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold uppercase ${
                        deviceTime === time ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Chart Area - Simplified Logic */}
            <View className="bg-[#2F2C2C] rounded-xl overflow-hidden shadow-lg mb-4 min-h-[350px]">
              {isLoading && !isRefreshing ? (
                <View className="h-[350px] justify-center items-center">
                  <ActivityIndicator color={selectedDataType === 'compost' ? "#10B04B" : "#FFD700"} size={"large"} />
                  <Text className="text-gray-400 mt-4">Loading data...</Text>
                </View>
              ) : error ? (
                <View className="h-[350px] justify-center items-center p-4">
                  <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                  <Text className="text-red-500 mt-2 text-center">{error}</Text>
                  <TouchableOpacity
                    onPress={() => fetchChartData(deviceTime, deviceParameter, selectedDataType)}
                    className={`mt-4 px-6 py-2 rounded-full ${selectedDataType === 'compost' ? 'bg-[#10B04B]/20' : 'bg-[#FFD700]/20'}`}
                  >
                    <Text className={`${selectedDataType === 'compost' ? 'text-[#10B04B]' : 'text-[#FFD700]'}`}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : chartData.length > 0 ? ( // Check simplified chartData array
                <LineGraphDataVisual
                  deviceTime={deviceTime}
                  chartData={chartData} // Pass the array directly
                  isLoading={isLoading}
                  deviceType={selectedDataType === "teg" ? "energy" : "compost"} // Pass 'compost' or 'teg'
                  deviceParameter={deviceParameter}
                  getMaxValue={getMaxValue} // Pass hooks/functions if needed by LineGraphDataVisual
                  getYAxisLabelSuffix={getYAxisLabelSuffix} // Pass hooks/functions if needed
                  handleParameterChange={handleParameterChange} // Pass if LineGraphDataVisual needs to change params itself
                  title={selectedDataType === 'compost' ? 'COCO Trends' : 'TEG Output'} // Optional: Pass a title
                  // Removed: isSolarSelected, isDeviceCompostSelected, isDeviceEnergySelected
                />
              ) : (
                <View className="h-[350px] justify-center items-center p-4">
                  <Ionicons name="bar-chart-outline" size={40} color="#666" />
                  <Text className="text-gray-400 mt-2">No Data Available</Text>
                   <Text className="text-gray-500 text-xs mt-1 max-w-[250px] text-center">
                     Try changing the time period or parameter, or pull down to refresh.
                   </Text>
                  <TouchableOpacity
                    onPress={() => fetchChartData(deviceTime, deviceParameter, selectedDataType)}
                     className={`mt-4 px-6 py-2 rounded-full ${selectedDataType === 'compost' ? 'bg-[#10B04B]/20' : 'bg-[#FFD700]/20'}`}
                  >
                     <Text className={`${selectedDataType === 'compost' ? 'text-[#10B04B]' : 'text-[#FFD700]'}`}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Parameter Buttons */}
            <View className="mb-2">
              <Text className="text-gray-400 text-sm mb-2 px-1">Parameters</Text>
              <View className="flex-row flex-wrap justify-between">
                {selectedDataType === "compost"
                  ? ["methane", "moisture", "temperatureIn", "temperatureOut"].map(
                      (param) => (
                        <TouchableOpacity
                          key={param}
                          onPress={() => handleParameterChange(param)}
                          className={`w-[49%] py-3 px-2 mb-2 rounded-xl flex-row items-center justify-center ${
                            deviceParameter === param
                              ? "bg-[#EEC643]/20 border border-[#EEC643]"
                              : "bg-[#2A2A2A]"
                          }`}
                        >
                          <FontAwesome5
                            name={iconMapping[param] || "circle"}
                            size={14}
                            color={deviceParameter === param ? "#EEC643" : "#666"}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            className={`text-xs font-medium ${
                              deviceParameter === param ? "text-white" : "text-gray-400"
                            }`}
                          >
                            {param === "temperatureIn"
                              ? "Temperature In"
                              : param === "temperatureOut"
                              ? "Temperature Out"
                              : param.charAt(0).toUpperCase() + param.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      )
                    )
                  : ["voltage", "current", "wattage"].map((param) => (
                      <TouchableOpacity
                        key={param}
                        onPress={() => handleParameterChange(param)}
                         // Adjust width for 3 buttons
                        className={`w-[32%] py-3 px-1 mb-2 rounded-xl flex-row items-center justify-center ${
                          deviceParameter === param
                            ? "bg-[#EEC643]/20 border border-[#EEC643]"
                            : "bg-[#2A2A2A]"
                        }`}
                      >
                        <FontAwesome5
                          name={iconMapping[param] || "circle"}
                          size={14}
                          color={deviceParameter === param ? "#EEC643" : "#666"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          className={`text-xs font-medium ${
                            deviceParameter === param ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {param.charAt(0).toUpperCase() + param.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
              </View>
            </View>

            {/* Additional data summary section - Using Summary State */}
            <View className="bg-[#2A2A2A] rounded-xl p-4 mt-2">
              <Text className="text-white text-sm font-medium mb-3">Summary ({deviceParameter.charAt(0).toUpperCase() + deviceParameter.slice(1)})</Text>

              <View className="flex-row justify-between mb-2">
                <View className="bg-[#333] rounded-lg p-3 w-[48%]">
                  <Text className="text-gray-400 text-xs">Average</Text>
                  <Text className="text-white text-lg font-bold">
                    {/* Display from summary state */}
                    {currentAvg}
                  </Text>
                </View>

                <View className="bg-[#333] rounded-lg p-3 w-[48%]">
                  <Text className="text-gray-400 text-xs">Peak</Text>
                  <Text className="text-white text-lg font-bold">
                     {/* Display from summary state */}
                     {currentPeak}
                  </Text>
                </View>
              </View>

              {/* <TouchableOpacity
                className={`py-3 rounded-xl items-center justify-center mt-2 ${selectedDataType === 'compost' ? 'bg-[#10B04B]/20' : 'bg-[#FFD700]/20'}`}
                 // Add export functionality if needed
              >
                 <Text className={`font-medium ${selectedDataType === 'compost' ? 'text-[#10B04B]' : 'text-[#FFD700]'}`}>Export Data</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CocoStats;