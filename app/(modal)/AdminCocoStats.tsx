import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import LineGraphDataVisual from "@/components/LineGraphDataVisual";
import { useAdmin } from "@/context/AdminContext"; // Use Admin Context
import { getYAxisLabelSuffix, getMaxValue } from "@/hooks/deviceFunctions";
import { API_URL_BASE } from "@/constants/API_URL";

const { width } = Dimensions.get("window");

// Define Summary Types
type SummaryValues = { average: string; peak: string };
type CompostSummaryState = {
    methane?: SummaryValues;
    moisture?: SummaryValues;
    temperatureIn?: SummaryValues;
    temperatureOut?: SummaryValues;
};

const AdminCocoStats = () => {
  const { admin, token, abortController } = useAdmin(); // Use Admin Context
  const deviceIdentifier = admin?.selectedDevice;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]); // Simple array state
  const [deviceTime, setDeviceTime] = useState<string>("day");
  const [deviceParameter, setDeviceParameter] = useState<string>("methane"); // Compost default
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [summary, setSummary] = useState<CompostSummaryState>({}); // Summary State

  const iconMapping: any = {
    methane: "wind",
    moisture: "tint",
    temperatureIn: "temperature-high",
    temperatureOut: "temperature-low",
  };

  // Helper for summary suffix
  const getSummarySuffix = (param: string): string => {
      switch (param) {
        case "methane": return " ppm";
        case "moisture": return "%";
        case "temperatureIn":
        case "temperatureOut": return "°C";
        default: return "";
      }
  };

   // Helper to reset summary
   const resetSummary = (parameter: string) => {
       const suffix = getSummarySuffix(parameter);
       setSummary(prev => ({
           ...prev,
           [parameter]: { average: `0${suffix}`, peak: `0${suffix}` }
       }));
   };

  // Calculate summary statistics
  const calculateSummary = (data: any[], parameter: string) => {
      if (!data || data.length === 0) {
          resetSummary(parameter);
          return;
      }
      try {
          const values = data.map(item => parseFloat(item.value)).filter(val => !isNaN(val));
          if (values.length === 0) {
              resetSummary(parameter);
              return;
          }
          const sum = values.reduce((acc, val) => acc + val, 0);
          const avg = sum / values.length;
          const peak = Math.max(...values);
          const suffix = getSummarySuffix(parameter);
          setSummary(prev => ({
              ...prev,
              [parameter]: {
                  average: `${avg.toFixed(1)}${suffix}`,
                  peak: `${peak.toFixed(1)}${suffix}`
              }
          }));
      } catch (err) {
          console.error("Error calculating summary:", err);
          resetSummary(parameter);
      }
  };

  const fetchChartData = useCallback(
    async (timeFrame: string, parameter: string) => {
      if (!deviceIdentifier) {
        setError("No device selected in admin context.");
        setChartData([]);
        resetSummary(parameter);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const tokenForFetch = token;
        const queryString = new URLSearchParams({
          timeFrame,
          dataType: "compost", // Data type for Coco
          parameter,
        }).toString();
        const apiUrl = `${API_URL_BASE}/device/${deviceIdentifier}/saved-time-frame?${queryString}`;

        console.log("Admin Coco API URL:", apiUrl);
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
          signal: abortController.signal,
        });
        if (!response.ok) {
          const message = `Admin Coco chart data fetch failed: ${response.status}`;
          throw new Error(message);
        }
        const responseData = await response.json();

        // --- MODIFIED DATA HANDLING ---
        // Assuming Coco uses compostContainerOne
        const dataArray = responseData.data?.compostContainerOne;

        if (Array.isArray(dataArray)) {
            setChartData(dataArray);
            calculateSummary(dataArray, parameter);
        } else {
            console.error("Admin Coco (C1) data received is not an array:", dataArray);
            setChartData([]);
            resetSummary(parameter);
        }
        // --- END MODIFIED DATA HANDLING ---

      } catch (err: any) {
        console.error("Error fetching admin coco chart data:", err);
        setError(err.message || "Failed to load compost chart data.");
        setChartData([]);
        resetSummary(parameter);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [deviceIdentifier, token, API_URL_BASE, abortController]
  );

  useEffect(() => {
    fetchChartData(deviceTime, deviceParameter);
  }, [fetchChartData, deviceTime, deviceParameter]);

  const handleTimeChange = (time: string) => {
    setDeviceTime(time);
  };

  const handleParameterChange = (parameter: string) => {
    setDeviceParameter(parameter);
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchChartData(deviceTime, deviceParameter);
  }, [fetchChartData, deviceTime, deviceParameter]);

  // Get current summary values or fallback
  const currentAvg = summary[deviceParameter as keyof CompostSummaryState]?.average || 'N/A';
  const currentPeak = summary[deviceParameter as keyof CompostSummaryState]?.peak || 'N/A';

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <LinearGradient colors={['#121212', '#1A1A1A']} className="absolute inset-0" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-2 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#10B04B", "#34D399"]} // Compost colors
            tintColor="#10B04B"
            title="Updating Compost Data..."
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
              <Pressable onPress={() => router.back()} className="mr-3 p-1">
                <Feather name="arrow-left" size={24} color="white" />
              </Pressable>
              <View className="bg-[#10B04B]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="leaf" size={18} color="#10B04B" />
              </View>
              <Text className="text-white text-lg font-semibold">
                Admin Compost Data (C1)
              </Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <View className="p-4">
            {/* Time Period */}
            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-2 px-1">Time Period</Text>
              <View className="flex-row justify-around">
                {["day", "week", "month"].map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => handleTimeChange(time)}
                    className={`flex-1 py-3 mx-1 rounded-xl items-center justify-center ${
                      deviceTime === time
                        ? "bg-[#10B04B]/20 border border-[#10B04B]" // Compost active color
                        : "bg-[#2A2A2A]"
                    }`}
                  >
                    <Text className={`text-xs font-bold uppercase ${ deviceTime === time ? "text-white" : "text-gray-400" }`}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Chart Area */}
            <View className="bg-[#2F2C2C] rounded-xl overflow-hidden shadow-lg mb-4 min-h-[350px]">
               {isLoading && !isRefreshing ? (
                 <View className="h-[350px] justify-center items-center">
                   <ActivityIndicator color={"#10B04B"} size={"large"} />
                   <Text className="text-gray-400 mt-4">Loading data...</Text>
                 </View>
               ) : error ? (
                 <View className="h-[350px] justify-center items-center p-4">
                   <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                   <Text className="text-red-500 mt-2 text-center">{error}</Text>
                   <TouchableOpacity
                     onPress={() => fetchChartData(deviceTime, deviceParameter)}
                     className="mt-4 bg-[#10B04B]/20 px-6 py-2 rounded-full" >
                     <Text className="text-[#10B04B]">Retry</Text>
                   </TouchableOpacity>
                 </View>
               ) : chartData.length > 0 ? ( // Updated check
                 <LineGraphDataVisual
                   deviceTime={deviceTime}
                   chartData={chartData} // Pass simple array
                   isLoading={isLoading}
                   deviceType="compost" // Pass device type
                   deviceParameter={deviceParameter}
                   getMaxValue={getMaxValue}
                   getYAxisLabelSuffix={getYAxisLabelSuffix}
                   handleParameterChange={handleParameterChange}
                   title="Compost Trends (C1)" // Add title
                 />
               ) : (
                 <View className="h-[350px] justify-center items-center p-4">
                   <Ionicons name="bar-chart-outline" size={40} color="#666" />
                   <Text className="text-gray-400 mt-2">No Compost Data Available</Text>
                   <Text className="text-gray-500 text-xs mt-1 max-w-[250px] text-center">
                     Check device selection or try refreshing.
                   </Text>
                   <TouchableOpacity
                     onPress={() => fetchChartData(deviceTime, deviceParameter)}
                     className="mt-4 bg-[#10B04B]/20 px-6 py-2 rounded-full">
                     <Text className="text-[#10B04B]">Refresh</Text>
                   </TouchableOpacity>
                 </View>
               )}
            </View>

            {/* Parameter Buttons */}
            <View className="mb-2">
              <Text className="text-gray-400 text-sm mb-2 px-1">Parameters</Text>
              <View className="flex-row flex-wrap justify-between">
                 {["methane", "moisture", "temperatureIn", "temperatureOut"].map((param) => (
                   <TouchableOpacity
                     key={param}
                     onPress={() => handleParameterChange(param)}
                     className={`w-[49%] py-3 px-2 mb-2 rounded-xl flex-row items-center justify-center ${
                       deviceParameter === param
                         ? "bg-[#EEC643]/20 border border-[#EEC643]" // Param highlight
                         : "bg-[#2A2A2A]"
                     }`}
                   >
                     <FontAwesome5
                       name={iconMapping[param] || "circle"} size={14}
                       color={deviceParameter === param ? "#EEC643" : "#666"}
                       style={{ marginRight: 6 }} />
                     <Text className={`text-xs font-medium ${ deviceParameter === param ? "text-white" : "text-gray-400" }`}>
                       {param === "temperatureIn" ? "Temp In" :
                        param === "temperatureOut" ? "Temp Out" :
                        param.charAt(0).toUpperCase() + param.slice(1)}
                     </Text>
                   </TouchableOpacity>
                 ))}
              </View>
            </View>

             {/* Summary Section */}
            <View className="bg-[#2A2A2A] rounded-xl p-4 mt-2">
              <Text className="text-white text-sm font-medium mb-3">Summary ({deviceParameter === "temperatureIn" ? "Temp In" : deviceParameter === "temperatureOut" ? "Temp Out" : deviceParameter.charAt(0).toUpperCase() + deviceParameter.slice(1)})</Text>
              <View className="flex-row justify-between mb-2">
                <View className="bg-[#333] rounded-lg p-3 w-[48%]">
                  <Text className="text-gray-400 text-xs">Average</Text>
                  <Text className="text-white text-lg font-bold">
                     {currentAvg}
                  </Text>
                </View>
                <View className="bg-[#333] rounded-lg p-3 w-[48%]">
                  <Text className="text-gray-400 text-xs">Peak</Text>
                  <Text className="text-white text-lg font-bold">
                     {currentPeak}
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="bg-[#10B04B]/20 py-3 rounded-xl items-center justify-center mt-2">
                <Text className="text-[#10B04B] font-medium">Export Data</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminCocoStats;