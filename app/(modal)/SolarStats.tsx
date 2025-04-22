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

import HeaderSection from "@/components/HeaderSection";
import LineGraphDataVisual from "@/components/LineGraphDataVisual";
import { useUser } from "@/context/UserContext";
import { getYAxisLabelSuffix, getMaxValue } from "@/hooks/deviceFunctions";
import { AllSavedDataProp } from "@/hooks/APICallTypes";
import { API_URL_BASE } from "@/constants/API_URL";

const { width } = Dimensions.get("window");

const SolarStats = () => {
  const { user, token, abortController } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [deviceTime, setDeviceTime] = useState<string>("day");
  const [deviceParameter, setDeviceParameter] = useState<string>("voltage");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [summary, setSummary] = useState({
    average: { voltage: "12.8V", current: "1.5A", wattage: "19.2W" },
    peak: { voltage: "14.5V", current: "2.1A", wattage: "25.9W" }
  });

  const iconMapping: any = {
    voltage: "bolt",
    current: "exchange-alt",
    wattage: "plug",
  };

  const fetchChartData = useCallback(
    async (timeFrame: string, parameter: string) => {
      if (!user?.selectedDevice) return;
      setIsLoading(true);
      setError(null);
      try {
        const tokenForFetch = token;
        const queryString = new URLSearchParams({
          timeFrame,
          dataType: "solar",
          parameter,
        }).toString();
        const apiUrl = `${API_URL_BASE}/device/${user?.selectedDevice}/saved-time-frame?${queryString}`;
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
          signal: abortController.signal,
        });
        if (!response.ok) {
          const message = `Solar chart data fetch failed: ${response.status}`;
          throw new Error(message);
        }
        const responseData = await response.json();

        console.log("Fetched solar chart data:", responseData.data);
        
        // Direct assignment - assuming responseData.data.solar is already an array
        if (Array.isArray(responseData.data.solar)) {
          setChartData(responseData.data.solar);
          // Optionally calculate real summary values from the data
          if (responseData.data.solar.length > 0) {
            calculateSummary(responseData.data.solar, parameter);
          }
        } else {
          console.error("Solar data is not an array:", responseData.data.solar);
          setChartData([]);
        }
      } catch (err: any) {
        console.error("Error fetching solar chart data:", err);
        setError(err.message || "Failed to load solar chart data.");
        setChartData([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user?.selectedDevice, token, API_URL_BASE, abortController]
  );

  // Calculate summary statistics from the data
  const calculateSummary = (data: any[], parameter: string) => {
    if (!data || data.length === 0) return;
    
    try {
      // Extract values, filtering out any null/undefined/NaN
      const values = data
        .map(item => parseFloat(item.value))
        .filter(val => !isNaN(val));
      
      if (values.length === 0) return;
      
      // Calculate average and peak
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      const peak = Math.max(...values);
      
      // Format with appropriate units
      const suffix = parameter === "voltage" ? "V" : 
                    parameter === "current" ? "A" : "W";
      
      setSummary(prev => ({
        ...prev,
        average: {
          ...prev.average,
          [parameter]: `${avg.toFixed(1)}${suffix}`
        },
        peak: {
          ...prev.peak,
          [parameter]: `${peak.toFixed(1)}${suffix}`
        }
      }));
    } catch (err) {
      console.error("Error calculating summary:", err);
    }
  };

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
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#FFD700", "#EEC643"]}
            tintColor="#FFD700"
            title="Updating Solar Data..."
          />
        }
      >
        <View className="bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-lg mb-6">
          {/* Header with close button */}
          <LinearGradient
            colors={['#2A2A2A', '#232323']}
            className="p-4 flex-row justify-between items-center border-b border-[#333]"
          >
            <View className="flex-row items-center">
              <View className="bg-[#FFD700]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="sun" size={18} color="#FFD700" />
              </View>
              <Text className="text-white text-lg font-semibold">
                Solar Data
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

            {/* Chart Area */}
            <View className="bg-[#2F2C2C] rounded-xl overflow-hidden shadow-lg mb-4">
              {isLoading ? (
                <View className="h-[350px] justify-center items-center">
                  <ActivityIndicator color={"#FFD700"} size={"large"} />
                  <Text className="text-gray-400 mt-4">Loading data...</Text>
                </View>
              ) : error ? (
                <View className="h-[350px] justify-center items-center">
                  <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                  <Text className="text-red-500 mt-2">{error}</Text>
                  <TouchableOpacity
                    onPress={() => fetchChartData(deviceTime, deviceParameter)}
                    className="mt-4 bg-[#FFD700]/20 px-6 py-2 rounded-full"
                  >
                    <Text className="text-[#FFD700]">Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : chartData.length > 0 ? (
                <LineGraphDataVisual
                  deviceTime={deviceTime}
                  chartData={chartData}
                  isLoading={isLoading}
                  deviceType="solar"
                  deviceParameter={deviceParameter}
                  getMaxValue={getMaxValue}
                  getYAxisLabelSuffix={getYAxisLabelSuffix}
                  handleParameterChange={handleParameterChange}
                  title="Solar Output"
                />
              ) : (
                <View className="h-[350px] justify-center items-center">
                  <Ionicons name="bar-chart-outline" size={40} color="#666" />
                  <Text className="text-gray-400 mt-2">No Solar Data Available</Text>
                  <Text className="text-gray-500 text-xs mt-1 max-w-[250px] text-center">
                    Try changing the time period or parameter, or pull down to refresh.
                  </Text>
                  <TouchableOpacity
                    onPress={() => fetchChartData(deviceTime, deviceParameter)}
                    className="mt-4 bg-[#FFD700]/20 px-6 py-2 rounded-full"
                  >
                    <Text className="text-[#FFD700]">Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Parameter Buttons */}
            <View className="mb-2">
              <Text className="text-gray-400 text-sm mb-2 px-1">Parameters</Text>
              <View className="flex-row flex-wrap justify-between">
                {["voltage", "current", "wattage"].map((param) => (
                  <TouchableOpacity
                    key={param}
                    onPress={() => handleParameterChange(param)}
                    className={`w-[32%] py-3 px-2 mb-2 rounded-xl flex-row items-center justify-center ${
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

            {/* Additional data summary section */}
            <View className="bg-[#2A2A2A] rounded-xl p-4 mt-2">
              <Text className="text-white text-sm font-medium mb-3">Summary</Text>

              <View className="flex-row justify-between mb-2">
                <View className="bg-[#333] rounded-lg p-3 w-[48%]">
                  <Text className="text-gray-400 text-xs">Average</Text>
                  <Text className="text-white text-lg font-bold">
                    {summary.average[deviceParameter as keyof typeof summary.average]}
                  </Text>
                </View>

                <View className="bg-[#333] rounded-lg p-3 w-[48%]">
                  <Text className="text-gray-400 text-xs">Peak</Text>
                  <Text className="text-white text-lg font-bold">
                    {summary.peak[deviceParameter as keyof typeof summary.peak]}
                  </Text>
                </View>
              </View>

              {/* <TouchableOpacity
                className="bg-[#FFD700]/20 py-3 rounded-xl items-center justify-center mt-2"
              >
                <Text className="text-[#FFD700] font-medium">Export Data</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SolarStats;