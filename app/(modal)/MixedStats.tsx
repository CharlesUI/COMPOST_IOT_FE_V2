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

const MixedStats = () => {
  const { user, token, abortController } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<AllSavedDataProp | null>(null);
  const [deviceTime, setDeviceTime] = useState<string>("day");
  const [deviceParameter, setDeviceParameter] = useState<string>("methane");
  const [selectedDataType, setSelectedDataType] = useState<"compost" | "teg">("compost");
  const [refreshing, setRefreshing] = useState(false);

  const iconMapping: any = {
    methane: "wind",
    moisture: "tint",
    temperatureIn: "temperature-high",
    temperatureOut: "temperature-low",
    voltage: "bolt",
    current: "exchange-alt",
    wattage: "plug",
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
          dataType: dataType === "teg" ? "energy" : "compost",
          parameter,
        }).toString();
        const apiUrl = `${API_URL_BASE}/device/${user?.selectedDevice}/saved-time-frame?${queryString}`;

        console.log("API URL:", apiUrl);
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
          signal: abortController.signal,
        });
        if (!response.ok) {
          const message = `Mixed chart data fetch failed: ${response.status}`;
          throw new Error(message);
        }
        const responseData = await response.json();
        setChartData(responseData.data);
      } catch (err: any) {
        console.error(`Error fetching ${dataType} chart data:`, err);
        setError(err.message || `Failed to load ${dataType} chart data.`);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [user?.selectedDevice, token, API_URL_BASE, abortController]
  );

  useEffect(() => {
    const dataTypeForFetch = selectedDataType;
    let initialParameter = "methane";
    if (dataTypeForFetch === "teg") {
      initialParameter = "voltage";
    }
    setDeviceParameter(initialParameter);
    fetchChartData(deviceTime, initialParameter, dataTypeForFetch);
  }, [fetchChartData, deviceTime, selectedDataType]);

  const handleTimeChange = (time: string) => {
    setDeviceTime(time);
  };

  const handleParameterChange = (parameter: string) => {
    setDeviceParameter(parameter);
  };

  const handleDataTypeChange = (type: "compost" | "teg") => {
    setSelectedDataType(type);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChartData(deviceTime, deviceParameter, selectedDataType);
  }, [deviceTime, deviceParameter, selectedDataType, fetchChartData]);

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={"#10B04B"} />
        }
      >
        <View className="bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-lg mb-6">
          {/* Header with close button */}
          <LinearGradient
            colors={['#2A2A2A', '#232323']}
            className="p-4 flex-row justify-between items-center border-b border-[#333]"
          >
            <View className="flex-row items-center">
              <View className="bg-[#10B04B]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="recycle" size={18} color="#10B04B" />
              </View>
              <Text className="text-white text-lg font-semibold">
                Mixed Data
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
                  Compost
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDataTypeChange("teg")}
                className={`flex-1 py-3 mx-2 rounded-xl items-center justify-center flex-row ${
                  selectedDataType === "teg"
                    ? "bg-[#10B04B]/20 border border-[#10B04B]"
                    : "bg-[#2A2A2A]"
                }`}
              >
                <FontAwesome5
                  name="bolt"
                  size={14}
                  color={selectedDataType === "teg" ? "#10B04B" : "#666"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`text-xs font-bold uppercase ${
                    selectedDataType === "teg" ? "text-white" : "text-gray-400"
                  }`}
                >
                  TEG
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

            {/* Chart Area */}
            <View className="bg-[#2F2C2C] rounded-xl overflow-hidden shadow-lg mb-4">
              {isLoading && !refreshing ? (
                <View className="h-[350px] justify-center items-center">
                  <ActivityIndicator color={"#10B04B"} size={"large"} />
                  <Text className="text-gray-400 mt-4">Loading data...</Text>
                </View>
              ) : error ? (
                <View className="h-[350px] justify-center items-center">
                  <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                  <Text className="text-red-500 mt-2">{error}</Text>
                  <TouchableOpacity
                    onPress={() => fetchChartData(deviceTime, deviceParameter, selectedDataType)}
                    className="mt-4 bg-[#10B04B]/20 px-6 py-2 rounded-full"
                  >
                    <Text className="text-[#10B04B]">Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : selectedDataType === "compost" && chartData?.compostContainerTwo?.length! > 0 ? (
                <LineGraphDataVisual
                  deviceTime={deviceTime}
                  chartData={chartData}
                  isLoading={isLoading}
                  isSolarSelected={false}
                  isDeviceCompostSelected={true}
                  isDeviceEnergySelected={false}
                  deviceParameter={deviceParameter}
                  getMaxValue={getMaxValue}
                  getYAxisLabelSuffix={getYAxisLabelSuffix}
                  handleParameterChange={handleParameterChange}
                />
              ) : selectedDataType === "teg" && chartData?.tegTwo?.length! > 0 ? (
                <LineGraphDataVisual
                  deviceTime={deviceTime}
                  chartData={chartData}
                  isLoading={isLoading}
                  isSolarSelected={false}
                  isDeviceCompostSelected={false}
                  isDeviceEnergySelected={true}
                  deviceParameter={deviceParameter}
                  getMaxValue={getMaxValue}
                  getYAxisLabelSuffix={getYAxisLabelSuffix}
                  handleParameterChange={handleParameterChange}
                />
              ) : (
                <View className="h-[350px] justify-center items-center">
                  <Ionicons name="bar-chart-outline" size={40} color="#666" />
                  <Text className="text-gray-400 mt-2">No Data Available</Text>
                  <TouchableOpacity
                    onPress={() => fetchChartData(deviceTime, deviceParameter, selectedDataType)}
                    className="mt-4 bg-[#10B04B]/20 px-6 py-2 rounded-full"
                  >
                    <Text className="text-[#10B04B]">Refresh</Text>
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
                    {deviceParameter === "methane" ? "32 ppm" :
                     deviceParameter === "moisture" ? "64%" :
                     deviceParameter === "temperatureIn" ? "28°C" :
                     deviceParameter === "temperatureOut" ? "22°C" :
                     deviceParameter === "voltage" ? "12.4V" :
                     deviceParameter === "current" ? "0.8A" : "9.6W"}
                  </Text>
                </View>

                <View className="bg-[#333] rounded-lg p-3 w-[48%]">
                  <Text className="text-gray-400 text-xs">Peak</Text>
                  <Text className="text-white text-lg font-bold">
                    {deviceParameter === "methane" ? "45 ppm" :
                     deviceParameter === "moisture" ? "78%" :
                     deviceParameter === "temperatureIn" ? "32°C" :
                     deviceParameter === "temperatureOut" ? "26°C" :
                     deviceParameter === "voltage" ? "14.2V" :
                     deviceParameter === "current" ? "1.2A" : "12.8W"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-[#10B04B]/20 py-3 rounded-xl items-center justify-center mt-2"
              >
                <Text className="text-[#10B04B] font-medium">Export Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MixedStats;