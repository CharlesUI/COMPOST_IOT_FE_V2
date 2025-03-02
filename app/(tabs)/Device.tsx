import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import HeaderSection from "@/components/HeaderSection";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import CustomButton from "@/components/CustomButton";
import { getYAxisLabelSuffix, getMaxValue } from "@/hooks/deviceFunctions";
import RealTimeReading from "@/components/RealTimeReading";
import { RTC } from "@/components/RealTimeReading";
import LineGraphDataVisual from "@/components/LineGraphDataVisual";
import {
  parseISO,
  differenceInMinutes,
  isSameDay,
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
} from "date-fns";
import data from "@/assets/data.json";
const { debounce } = require("lodash");
import {
  APIDataProp,
  EnergyData,
  CompostData,
  AllSavedDataProp,
} from "@/hooks/APICallTypes";
import { SafeAreaView } from "react-native-safe-area-context";

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

const TIME_INTERVALS = {
  Day: 15, // 15 minutes interval for day view
  Week: 180, // 3 hours interval for week view
  Month: 240, // 4 hours interval for month view
};

const Device = () => {
  // Main state for device data
  const [deviceData, setDeviceData] = useState<APIDataProp | null>(null);
  const [deviceNumber, setDeviceNumber] = useState<string>("");
  const [realTimeData, setRealTimeData] = useState<RTC>();

  // Cached processed data - we'll process once and store in different formats
  const [processedAllData, setProcessedAllData] = useState<{
    [key: string]: AllSavedDataProp;
  }>({
    Day: { solar: [], teg: [], compostOne: [], compostTwo: [] },
    Week: { solar: [], teg: [], compostOne: [], compostTwo: [] },
    Month: { solar: [], teg: [], compostOne: [], compostTwo: [] },
  });

  // UI state
  const [isDeviceEnergySelected, setDeviceEnergySelected] = useState(true);
  const [isDeviceCompostSelected, setDeviceCompostSelected] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("Day");
  const [selectedParameter, setSelectedParameter] = useState<string>("voltage");
  const [selectedReading, setSelectedReading] = useState<string>("Battery");

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [isChartDataLoaded, setIsChartDataLoaded] = useState(false);

  // Data processing functions
  const downsampleData = useCallback((data: any[], intervalMins: number) => {
    if (!data || data.length === 0) return [];

    // Sort data by timestamp to ensure correct downsampling
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const downsampled: any[] = [];
    let lastTimestamp: Date | null = null;

    sortedData.forEach((item: any) => {
      const currentTimestamp = parseISO(item.timestamp);

      if (
        !lastTimestamp ||
        differenceInMinutes(currentTimestamp, lastTimestamp) >= intervalMins
      ) {
        downsampled.push(item);
        lastTimestamp = currentTimestamp;
      }
    });

    return downsampled;
  }, []);

  const filterAndFormatAllData = useCallback(
    (data: any[], intervalMins: number): AllSavedDataProp => {
      if (!data || data.length === 0) {
        return { solar: [], teg: [], compostOne: [], compostTwo: [] };
      }

      const downsampledData = downsampleData(data, intervalMins);

      const result = {
        solar: [] as EnergyData[],
        teg: [] as EnergyData[],
        compostOne: [] as CompostData[],
        compostTwo: [] as CompostData[],
      };

      downsampledData.forEach((item: any) => {
        if (item.solar) {
          result.solar.push({
            timestamp: item.timestamp,
            ...item.solar,
          });
        }
        if (item.teg) {
          result.teg.push({
            timestamp: item.timestamp,
            ...item.teg,
          });
        }
        if (item.compostContainerOne) {
          result.compostOne.push({
            timestamp: item.timestamp,
            ...item.compostContainerOne,
          });
        }
        if (item.compostContainerTwo) {
          result.compostTwo.push({
            timestamp: item.timestamp,
            ...item.compostContainerTwo,
          });
        }
      });

      return result;
    },
    [downsampleData]
  );

  const processAllTimeframes = useCallback(
    (rawData: any[]) => {
      if (!rawData || rawData.length === 0) return;

      setIsLoading(true);

      // Use setTimeout to prevent UI blocking during heavy processing
      setTimeout(() => {
        const processed = {
          Day: filterAndFormatAllData(rawData, TIME_INTERVALS.Day),
          Week: filterAndFormatAllData(rawData, TIME_INTERVALS.Week),
          Month: filterAndFormatAllData(rawData, TIME_INTERVALS.Month),
        };

        setProcessedAllData(processed);
        setIsChartDataLoaded(true);
        setIsLoading(false);
      }, 0);
    },
    [filterAndFormatAllData]
  );

  // Format data for charts with proper date filtering
  const formatChartData = useCallback(
    (data: any[], dataType: string, selectedTimeframe: string) => {
      if (!data || data.length === 0) return [];

      let startDate: Date;
      let endDate: Date;
      const today = new Date();

      switch (selectedTimeframe) {
        case "Day":
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
        case "Week":
          startDate = startOfWeek(today);
          endDate = endOfWeek(today);
          break;
        case "Month":
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
        default:
          startDate = startOfDay(today);
          endDate = endOfDay(today);
      }

      const filteredData = data.filter((item) => {
        const itemDate = parseISO(item.timestamp);
        return itemDate >= startDate && itemDate <= endDate;
      });

      let lastDay: Date | null = null;

      return filteredData.map((item: any) => {
        const itemDate = parseISO(item.timestamp);
        let labelFormat = "HH:mm";
        let label = format(itemDate, labelFormat);

        if (selectedTimeframe === "Week" || selectedTimeframe === "Month") {
          if (!lastDay || !isSameDay(itemDate, lastDay)) {
            label = `${format(itemDate, "dd/MM")} \n ${format(
              itemDate,
              "HH:mm"
            )}`;
            lastDay = itemDate;
          }
        }

        return {
          label,
          value: item[dataType],
          timeStamp: itemDate,
          dataType: dataType,
        };
      });
    },
    []
  );

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Using setTimeout to simulate API fetch from mock data
        const response = await new Promise((resolve) => {
          setTimeout(() => resolve(data), 300);
        });
        setDeviceData(response as APIDataProp);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process fetched data once
  useEffect(() => {
    if (deviceData && !isInitialDataLoaded) {
      setDeviceNumber(deviceData.deviceNumber);
      setRealTimeData(deviceData.realTimeData);

      // Process data for all timeframes once
      processAllTimeframes(deviceData.savedTimeFrameData);
      setIsInitialDataLoaded(true);
    }
  }, [deviceData, isInitialDataLoaded, processAllTimeframes]);

  // Memoized chart data to prevent recalculation on every render
  const chartData = useMemo(() => {
    if (!isChartDataLoaded)
      return { solar: [], teg: [], compost1: [], compost2: [] };

    const currentData = processedAllData[selectedTime];

    return {
      solar: formatChartData(
        currentData.solar,
        selectedParameter,
        selectedTime
      ),
      teg: formatChartData(currentData.teg, selectedParameter, selectedTime),
      compost1: formatChartData(
        currentData.compostOne,
        selectedParameter,
        selectedTime
      ),
      compost2: formatChartData(
        currentData.compostTwo,
        selectedParameter,
        selectedTime
      ),
    };
  }, [
    processedAllData,
    selectedTime,
    selectedParameter,
    formatChartData,
    isChartDataLoaded,
  ]);

  // Debounced handlers to prevent multiple rapid state updates
  const debouncedSetParameter = useRef(
    debounce((parameter: string) => {
      setIsLoading(true);
      setSelectedParameter(parameter);

      // Short timeout to allow UI to update with loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }, 200)
  ).current;

  const debouncedSetTime = useRef(
    debounce((time: string) => {
      setIsLoading(true);
      setSelectedTime(time);

      // Short timeout to allow UI to update with loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }, 200)
  ).current;

  // Event handlers
  const handleTimeClick = (time: string) => {
    debouncedSetTime(time);
  };

  const handleParameterChange = (parameter: string) => {
    debouncedSetParameter(parameter);
  };

  const handleDeviceEnergyClick = () => {
    setIsLoading(true);
    if (isDeviceCompostSelected) {
      setDeviceCompostSelected(false);
    }
    setDeviceEnergySelected(!isDeviceEnergySelected);
    setSelectedParameter("voltage");

    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  const handleDeviceCompostClick = () => {
    setIsLoading(true);
    if (isDeviceEnergySelected) {
      setDeviceEnergySelected(false);
    }
    setDeviceCompostSelected(!isDeviceCompostSelected);
    setSelectedParameter("methane");

    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  const selectReading = (title: string) => {
    setSelectedReading(title);
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <HeaderSection
          headerText="Device"
          title="User"
          onPressToggle={() => console.log("Device")}
        />

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
                    isDeviceEnergySelected
                      ? "border-[#10B04B] border-2"
                      : "border-gray-100 border-[0.5px]"
                  }`}
                />

                <CustomButton
                  onPress={handleDeviceCompostClick}
                  title="Compost Data"
                  textStyles="text-[8px] font-bold color-white"
                  containerStyles={`w-[40%] p-2 align-center bg-gray-800 ${
                    isDeviceCompostSelected
                      ? "border-[#10B04B] border-2"
                      : "border-gray-100 border-[0.5px]"
                  }`}
                />
              </View>

              {/* Time Period Buttons */}
              <View className="w-[72.5%] pb-3 flex-row flex justify-between items-center">
                {["Day", "Week", "Month"].map((time) => (
                  <CustomButton
                    key={time}
                    onPress={() => handleTimeClick(time)}
                    title={time}
                    textStyles="text-[8px] font-bold color-white"
                    containerStyles={`w-1/4 align-center p-2 bg-gray-800 ${
                      selectedTime === time
                        ? "border-[#10B04B] border-2"
                        : "border-gray-100 border-[0.5px]"
                    } ${
                      !(isDeviceEnergySelected || isDeviceCompostSelected) &&
                      "opacity-50 border-green-4 bg-transparent"
                    }`}
                    disabled={
                      !(isDeviceEnergySelected || isDeviceCompostSelected)
                    }
                  />
                ))}
              </View>
            </View>

            {/* Line Chart with Parameter Selection for Energy and Compost*/}
            <View className="w-full flex-col">
              {!isDeviceCompostSelected && !isDeviceEnergySelected && (
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
              {(isDeviceCompostSelected || isDeviceEnergySelected) &&
                isInitialDataLoaded && (
                  <>
                    {isLoading ? (
                      <ChartSkeleton />
                    ) : (
                      <LineGraphDataVisual
                        selectedTime={selectedTime}
                        lengthChecker={
                          chartData.compost1.length > 0 ||
                          chartData.compost2.length > 0 ||
                          chartData.solar.length > 0 ||
                          chartData.teg.length > 0
                        }
                        isLoading={isLoading}
                        isDeviceCompostSelected={isDeviceCompostSelected}
                        isDeviceEnergySelected={isDeviceEnergySelected}
                        chartDataSolar={chartData.solar}
                        chartDataTeg={chartData.teg}
                        chartDataCompost1={chartData.compost1}
                        chartDataCompost2={chartData.compost2}
                        selectedParameter={selectedParameter}
                        getMaxValue={getMaxValue}
                        getYAxisLabelSuffix={getYAxisLabelSuffix}
                        handleParameterChange={handleParameterChange}
                      />
                    )}
                  </>
                )}
            </View>

            {/* Reading for Power*/}
            <View className="w-full justify-center items-center p-5 border-gray-100 border-t-[0.5px]">
              <View className="w-full flex-row justify-center items-center pt-2 bg-[#2F2C2C]">
                <View className="w-full flex-row justify-between items-center  gap-[1px] bg-[#2F2C2C]">
                  {["Solar", "TEG", "Battery", "Compost1", "Compost2"].map(
                    (itemTitle) => (
                      <CustomButton
                        key={itemTitle}
                        onPress={() => selectReading(itemTitle)}
                        title={itemTitle}
                        textStyles="text-[8px] font-bold color-white"
                        containerStyles={`flex-1 py-5 align-center bg-gray-800 ${
                          selectedReading === itemTitle
                            ? "border-[#10B04B] border-2"
                            : "border-gray-100 border-[0.5px]"
                        }`}
                      />
                    )
                  )}
                </View>
              </View>

              {/* Power and Compost Reading */}
              <View className="w-full mt-[2px] py-2 justify-center items-center bg-[#2F2C2C]">
                <View className="w-full flex-col rounded-md">
                  <View className="flex-1 flex-row border-white border-b-[0.5px] p-4">
                    <MaterialIcons name="devices" size={24} color="white" />
                    <Text className="ml-2 text-center font-bold color-white">
                      Device Reading / 30min:
                    </Text>
                  </View>
                  <RealTimeReading
                    selectedReading={selectedReading}
                    realTimeData={realTimeData}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Device;
