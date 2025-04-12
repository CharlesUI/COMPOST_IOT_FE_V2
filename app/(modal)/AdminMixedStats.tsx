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

// Define Summary Types (Covering both sets of parameters)
type SummaryValues = { average: string; peak: string };
type MixedSummaryState = {
    methane?: SummaryValues;
    moisture?: SummaryValues;
    temperatureIn?: SummaryValues;
    temperatureOut?: SummaryValues;
    voltage?: SummaryValues;
    current?: SummaryValues;
    wattage?: SummaryValues;
};

const AdminMixedStats = () => {
  const { admin, token, abortController } = useAdmin(); // Use Admin Context
  const deviceIdentifier = admin?.selectedDevice;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]); // Simple array state
  const [deviceTime, setDeviceTime] = useState<string>("day");
  // Default to compost, parameter will be updated by useEffect
  const [selectedDataType, setSelectedDataType] = useState<"compost" | "teg">("compost");
  const [deviceParameter, setDeviceParameter] = useState<string>("methane");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [summary, setSummary] = useState<MixedSummaryState>({}); // Summary State for all possible params

  const iconMapping: any = {
    methane: "wind",
    moisture: "tint",
    temperatureIn: "temperature-high",
    temperatureOut: "temperature-low",
    voltage: "bolt",
    current: "exchange-alt",
    wattage: "plug",
  };

  // Helper for summary suffix (handles both types)
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

   // Helper to reset summary
   const resetSummary = (parameter: string, dataType: "compost" | "teg") => {
       const suffix = getSummarySuffix(parameter, dataType);
       setSummary(prev => ({
           ...prev,
           [parameter]: { average: `0${suffix}`, peak: `0${suffix}` }
       }));
   };

  // Calculate summary statistics
  const calculateSummary = (data: any[], parameter: string, dataType: "compost" | "teg") => {
      if (!data || data.length === 0) {
          resetSummary(parameter, dataType);
          return;
      }
      try {
          const values = data.map(item => parseFloat(item.value)).filter(val => !isNaN(val));
          if (values.length === 0) {
              resetSummary(parameter, dataType);
              return;
          }
          const sum = values.reduce((acc, val) => acc + val, 0);
          const avg = sum / values.length;
          const peak = Math.max(...values);
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
          resetSummary(parameter, dataType);
      }
  };

  const fetchChartData = useCallback(
    async (timeFrame: string, parameter: string, dataType: "compost" | "teg") => {
      if (!deviceIdentifier) {
          setError("No device selected in admin context.");
          setChartData([]);
          resetSummary(parameter, dataType);
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const tokenForFetch = token;
        const queryString = new URLSearchParams({
          timeFrame,
          // API expects 'energy' for TEG, 'compost' for Compost
          dataType: dataType === "teg" ? "energy" : "compost",
          parameter,
        }).toString();
        const apiUrl = `${API_URL_BASE}/device/${deviceIdentifier}/saved-time-frame?${queryString}`;

        console.log("Admin Mixed API URL:", apiUrl);
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${tokenForFetch}` },
          signal: abortController.signal,
        });
        if (!response.ok) {
          const message = `Admin Mixed chart data fetch failed (${dataType}): ${response.status}`;
          throw new Error(message);
        }
        const responseData = await response.json();

        // --- MODIFIED DATA HANDLING ---
        // Using compostContainerTwo and tegTwo as requested
        let dataArray: any[] = [];
        let dataKey = '';
        if (dataType === "compost") {
            dataKey = 'compostContainerTwo';
            dataArray = responseData.data?.compostContainerTwo;
        } else { // dataType === "teg"
             dataKey = 'tegTwo';
             dataArray = responseData.data?.tegTwo;
        }

        console.log(`Workspaceed Admin Mixed ${dataType} (${dataKey}) data:`, dataArray?.length ?? 0);

        if (Array.isArray(dataArray)) {
            setChartData(dataArray);
            calculateSummary(dataArray, parameter, dataType);
        } else {
            console.error(`Admin Mixed (${dataKey}) data received is not an array:`, dataArray);
            setChartData([]);
            resetSummary(parameter, dataType);
        }
        // --- END MODIFIED DATA HANDLING ---

      } catch (err: any) {
        console.error(`Error fetching admin mixed ${dataType} chart data:`, err);
        setError(err.message || `Failed to load ${dataType} chart data.`);
        setChartData([]);
        resetSummary(parameter, dataType);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [deviceIdentifier, token, API_URL_BASE, abortController]
  );

  // Effect to fetch data when time, parameter, or data type changes
  useEffect(() => {
    // Only fetch if a parameter is set (prevents fetch before initial parameter is set)
    if(deviceParameter) {
        fetchChartData(deviceTime, deviceParameter, selectedDataType);
    }
  }, [fetchChartData, deviceTime, deviceParameter, selectedDataType]);

  // Effect to handle switching default parameter when data type changes
  useEffect(() => {
      const newParameter = selectedDataType === 'teg' ? 'voltage' : 'methane';
      setDeviceParameter(newParameter);
      // Reset summary for the new parameter/datatype combo immediately
      resetSummary(newParameter, selectedDataType);
      // The fetch will be triggered by the other useEffect due to deviceParameter change
  }, [selectedDataType]); // Only run when selectedDataType changes

  const handleTimeChange = (time: string) => {
    setDeviceTime(time);
  };

  const handleParameterChange = (parameter: string) => {
    setDeviceParameter(parameter);
  };

  const handleDataTypeChange = (type: "compost" | "teg") => {
    setSelectedDataType(type);
    // Parameter change and fetch handled by useEffect hooks
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchChartData(deviceTime, deviceParameter, selectedDataType);
  }, [fetchChartData, deviceTime, deviceParameter, selectedDataType]);

  // Get current summary values or fallback
  const currentAvg = summary[deviceParameter as keyof MixedSummaryState]?.average || 'N/A';
  const currentPeak = summary[deviceParameter as keyof MixedSummaryState]?.peak || 'N/A';

  // Determine active colors based on selected data type
  const activeColor = selectedDataType === 'compost' ? '#10B04B' : '#FFD700';
  const activeBgColor = selectedDataType === 'compost' ? 'bg-[#10B04B]/20' : 'bg-[#FFD700]/20';
  const activeBorderColor = selectedDataType === 'compost' ? 'border-[#10B04B]' : 'border-[#FFD700]';


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
            colors={[activeColor]}
            tintColor={activeColor}
            title={`Updating ${selectedDataType === 'compost' ? 'Compost' : 'TEG'} Data...`}
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
               <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${activeBgColor}`}>
                 <FontAwesome5
                    name={selectedDataType === 'compost' ? "leaf" : "bolt"}
                    size={18}
                    color={activeColor} />
               </View>
              <Text className="text-white text-lg font-semibold">
                Admin {selectedDataType === 'compost' ? 'Compost (C2)' : 'TEG (T2)'} Data
              </Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <View className="p-4">
            {/* Data Type Selection Buttons */}
            <View className="flex-row justify-around mb-6">
                <TouchableOpacity
                  onPress={() => handleDataTypeChange("compost")}
                  className={`flex-1 py-3 mx-2 rounded-xl items-center justify-center flex-row ${
                    selectedDataType === "compost" ? `${activeBgColor} ${activeBorderColor}` : "bg-[#2A2A2A]"
                  }`}
                >
                  <FontAwesome5 name="leaf" size={14} color={selectedDataType === "compost" ? activeColor : "#666"} style={{ marginRight: 6 }}/>
                  <Text className={`text-xs font-bold uppercase ${ selectedDataType === "compost" ? "text-white" : "text-gray-400" }`}>
                    Compost (C2)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDataTypeChange("teg")}
                   className={`flex-1 py-3 mx-2 rounded-xl items-center justify-center flex-row ${
                    selectedDataType === "teg" ? `${activeBgColor} ${activeBorderColor}` : "bg-[#2A2A2A]"
                  }`}
                >
                  <FontAwesome5 name="bolt" size={14} color={selectedDataType === "teg" ? activeColor : "#666"} style={{ marginRight: 6 }}/>
                  <Text className={`text-xs font-bold uppercase ${ selectedDataType === "teg" ? "text-white" : "text-gray-400" }`}>
                    TEG (T2)
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
                      deviceTime === time ? `${activeBgColor} ${activeBorderColor}` : "bg-[#2A2A2A]"
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
                   <ActivityIndicator color={activeColor} size={"large"} />
                   <Text className="text-gray-400 mt-4">Loading data...</Text>
                 </View>
               ) : error ? (
                 <View className="h-[350px] justify-center items-center p-4">
                   <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                   <Text className="text-red-500 mt-2 text-center">{error}</Text>
                   <TouchableOpacity
                     onPress={() => fetchChartData(deviceTime, deviceParameter, selectedDataType)}
                     className={`mt-4 px-6 py-2 rounded-full ${activeBgColor}`} >
                     <Text style={{ color: activeColor }}>Retry</Text>
                   </TouchableOpacity>
                 </View>
               ) : chartData.length > 0 ? (
                 <LineGraphDataVisual
                   deviceTime={deviceTime}
                   chartData={chartData}
                   isLoading={isLoading}
                   deviceType={selectedDataType === "teg" ? "energy" : "compost"}
                   deviceParameter={deviceParameter}
                   getMaxValue={getMaxValue}
                   getYAxisLabelSuffix={getYAxisLabelSuffix}
                   handleParameterChange={handleParameterChange}
                   title={`Admin ${selectedDataType === 'compost' ? 'Compost (C2)' : 'TEG (T2)'} Trends`}
                 />
               ) : (
                 <View className="h-[350px] justify-center items-center p-4">
                   <Ionicons name="bar-chart-outline" size={40} color="#666" />
                   <Text className="text-gray-400 mt-2">No Data Available</Text>
                   <Text className="text-gray-500 text-xs mt-1 max-w-[250px] text-center">
                     Check device selection or try refreshing.
                   </Text>
                   <TouchableOpacity
                     onPress={() => fetchChartData(deviceTime, deviceParameter, selectedDataType)}
                     className={`mt-4 px-6 py-2 rounded-full ${activeBgColor}`}>
                     <Text style={{ color: activeColor }}>Refresh</Text>
                   </TouchableOpacity>
                 </View>
               )}
            </View>

            {/* Parameter Buttons */}
            <View className="mb-2">
              <Text className="text-gray-400 text-sm mb-2 px-1">Parameters</Text>
              <View className="flex-row flex-wrap justify-between">
                {selectedDataType === "compost"
                  ? ["methane", "moisture", "temperatureIn", "temperatureOut"].map((param) => (
                      <TouchableOpacity
                        key={param}
                        onPress={() => handleParameterChange(param)}
                        className={`w-[49%] py-3 px-2 mb-2 rounded-xl flex-row items-center justify-center ${
                          deviceParameter === param ? "bg-[#EEC643]/20 border border-[#EEC643]" : "bg-[#2A2A2A]"
                        }`} >
                        <FontAwesome5 name={iconMapping[param]} size={14} color={deviceParameter === param ? "#EEC643" : "#666"} style={{ marginRight: 6 }}/>
                        <Text className={`text-xs font-medium ${ deviceParameter === param ? "text-white" : "text-gray-400"}`}>
                            {param === "temperatureIn" ? "Temp In" : param === "temperatureOut" ? "Temp Out" : param.charAt(0).toUpperCase() + param.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))
                  : ["voltage", "current", "wattage"].map((param) => (
                      <TouchableOpacity
                        key={param}
                        onPress={() => handleParameterChange(param)}
                        className={`w-[32%] py-3 px-1 mb-2 rounded-xl flex-row items-center justify-center ${
                          deviceParameter === param ? "bg-[#EEC643]/20 border border-[#EEC643]" : "bg-[#2A2A2A]"
                        }`}>
                        <FontAwesome5 name={iconMapping[param]} size={14} color={deviceParameter === param ? "#EEC643" : "#666"} style={{ marginRight: 6 }}/>
                        <Text className={`text-xs font-medium ${ deviceParameter === param ? "text-white" : "text-gray-400"}`}>
                            {param.charAt(0).toUpperCase() + param.slice(1)}
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
                  <Text className="text-white text-lg font-bold">{currentAvg}</Text>
                </View>
                <View className="bg-[#333] rounded-lg p-3 w-[48%]">
                  <Text className="text-gray-400 text-xs">Peak</Text>
                  <Text className="text-white text-lg font-bold">{currentPeak}</Text>
                </View>
              </View>
              <TouchableOpacity className={`py-3 rounded-xl items-center justify-center mt-2 ${activeBgColor}`}>
                <Text style={{ color: activeColor }} className="font-medium">Export Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminMixedStats;