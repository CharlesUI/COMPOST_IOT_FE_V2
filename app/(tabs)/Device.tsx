import React, { useEffect, useState } from "react";
import HeaderSection from "@/components/HeaderSection";
import { MaterialIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
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
  startOfToday,
  endOfWeek,
  endOfMonth,
} from "date-fns"; // Import date-fns functions
import { useMemo, useCallback, useRef } from "react";
import data from "@/assets/data.json";

const { debounce } = require("lodash"); // Import debounce from lodash - install if needed: npm install lodash.debounce
import {
  TimeDataProp,
  APIDataProp,
  EnergyData,
  CompostData,
  AllSavedDataProp,
} from "@/hooks/APICallTypes";
import { SafeAreaView } from "react-native-safe-area-context";

const Device = () => {
  const [deviceData, setDeviceData] = useState<APIDataProp | null>(null);
  const [deviceNumber, setDeviceNumber] = useState<string>();
  const [realTimeData, setRealTimeData] = useState<RTC>();
  const [savedTimeFrameData, setSavedTimeFrameData] = useState<any[]>([]);
  const [allSavedData, setAllSavedData] = useState<AllSavedDataProp>({
    solar: [],
    teg: [],
    compostOne: [],
    compostTwo: [],
  });
  const [isDeviceEnergySelected, setDeviceEnergySelected] = useState(true);
  const [isDeviceCompostSelected, setDeviceCompostSelected] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | undefined>("Day");
  const [downsampleInterval, setDownsampleInterval] = useState<number>(10); // Default 10 mins for Day

  const [selectedParameter, setSelectedParameter] = useState<
    string | undefined
  >("voltage");
  const [selectedReading, setSelectedReading] = useState<string | null>(
    "Battery"
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataProcessed, setDataProcessed] = useState(false); // Track data processing

  console.log("_________________START___________________");
  console.log("Device: ", isDeviceEnergySelected);
  console.log("Compost: ", isDeviceCompostSelected);
  console.log("Time: ", selectedTime);
  console.log("Parameter: ", selectedParameter);
  console.log("reading", selectedReading);
  console.log("Loading: ", isLoading);
  console.log("________________________________________");
  console.log("Device Number: ", deviceNumber);
  console.log("RealTimeData Time: ", realTimeData?.timestamp);
  console.log("saved time", savedTimeFrameData.length);
  console.log("solar data: ", allSavedData.solar.length);
  console.log("teg data: ", allSavedData.teg.length);
  console.log("compost1: ", allSavedData.compostOne.length);
  console.log("compost2: ", allSavedData.compostTwo.length);
  console.log("________________END____________________");

  const filterAndFormatAllData = useCallback(
    (data: any[]): AllSavedDataProp => {
      const solar: EnergyData[] = [];
      const teg: EnergyData[] = [];
      const compostOne: CompostData[] = [];
      const compostTwo: CompostData[] = [];

      if (!data) {
        return { solar, teg, compostOne, compostTwo };
      }

      const downsampledData = downsampleData(data, downsampleInterval);

      downsampledData.forEach((item: any) => {
        if (item.solar) {
          solar.push({
            timestamp: item.timestamp,
            ...item.solar,
          });
        }
        if (item.teg) {
          teg.push({
            timestamp: item.timestamp,
            ...item.teg,
          });
        }
        if (item.compostContainerOne) {
          compostOne.push({
            timestamp: item.timestamp,
            ...item.compostContainerOne,
          });
        }
        if (item.compostContainerTwo) {
          compostTwo.push({
            timestamp: item.timestamp,
            ...item.compostContainerTwo,
          });
        }
      });

      return { solar, teg, compostOne, compostTwo };
    },
    [downsampleInterval]
  );

  const downsampleData = (data: any[], intervalMins: number) => {
    if (!data || data.length === 0) return [];

    const downsampled: any[] = [];
    let lastTimestamp: Date | null = null;

    data.forEach((item: any) => {
      const currentTimestamp = parseISO(item.timestamp);

      if (!lastTimestamp) {
        lastTimestamp = currentTimestamp;
        downsampled.push(item);
        return;
      }

      const timeDiff = differenceInMinutes(currentTimestamp, lastTimestamp);

      if (timeDiff >= intervalMins) {
        downsampled.push(item);
        lastTimestamp = currentTimestamp;
      }
    });

    return downsampled;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Set loading to true when fetching starts
      try {
        const response: any = await new Promise((resolve) => {
          setTimeout(() => resolve(data), 500);
        });
        setDeviceData(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Ensure loading is set to false after fetch attempt
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (deviceData) {
      setDeviceNumber(deviceData.deviceNumber);
      setRealTimeData(deviceData.realTimeData);
      setSavedTimeFrameData(deviceData.savedTimeFrameData);
      const allData = filterAndFormatAllData(deviceData.savedTimeFrameData);
      setAllSavedData(allData);
      setDataProcessed(true); // Data processing complete
    }
  }, [deviceData, filterAndFormatAllData]);

  useEffect(() => {
    // *** KEY CHANGE: Filter from pre-processed allSavedData ***
    if (selectedTime && savedTimeFrameData && dataProcessed) {
      // Ensure data is processed
      setIsLoading(true); // Set loading to true when filtering starts

      // No need to call filterAndFormatAllData again!
      setIsLoading(false); // End loading after data is processed and set
    }
  }, [selectedTime, savedTimeFrameData, dataProcessed]);

  const debouncedFilterData = useRef(
    debounce((time: string) => {
      setIsLoading(true); // Start loading before data processing
      setSelectedTime(time); // Set selectedTime immediately for UI update

      switch (time) {
        case "Day":
          setDownsampleInterval(10);
          break;
        case "Week":
          setDownsampleInterval(180);
          break;
        case "Month":
          setDownsampleInterval(240);
          break;
        default:
          setDownsampleInterval(10);
      }
      // Data filtering and setting allSavedData will happen in the useEffect below
    }, 300)
  ); // 300ms debounce delay

  useEffect(() => {
    if (selectedTime) {
      if (savedTimeFrameData) {
        const allData = filterAndFormatAllData(savedTimeFrameData);
        setAllSavedData(allData);
      }
      setIsLoading(false); // End loading after data is processed and set
    }
  }, [selectedTime, savedTimeFrameData, filterAndFormatAllData]);

  const handleTimeClick = (time: string) => {
    debouncedFilterData.current(time); // Call debounced function
  };

  const formatChartData = useCallback(
    (data: any[], dataType: string, selectedTime: string) => {
      if (!data || data.length === 0) return [];

      let startDate: Date;
      let endDate: Date;

      switch (selectedTime) {
        case "Day":
          startDate = startOfDay(new Date());
          endDate = endOfDay(new Date());
          break;
        case "Week":
          startDate = startOfWeek(new Date());
          endDate = endOfWeek(new Date());
          break;
        case "Month":
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          break;
        default:
          startDate = startOfDay(new Date());
          endDate = endOfDay(new Date());
      }

      const filteredData = data.filter((item) => {
        const itemDate = parseISO(item.timestamp);
        return itemDate >= startDate && itemDate <= endDate;
      });

      let lastDay: Date | null = null; // Track the last day processed for separators

      return filteredData.map((item: any, index: number) => {
        const itemDate = parseISO(item.timestamp);
        let labelFormat = "HH:mm";
        let label = format(itemDate, labelFormat);
        if (selectedTime === "Week" || selectedTime === "Month") {
          if (!lastDay || !isSameDay(itemDate, lastDay)) {
            label = `${format(itemDate, "dd/MM")} \n ${format(
              itemDate,
              "HH:mm"
            )}`; // Add day separator
            lastDay = itemDate; // Update lastDay
          } else {
            label = format(itemDate, labelFormat); // Just time if same day
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

  const chartDataSolarMemo = useMemo(() => {
    return formatChartData(
      allSavedData.solar,
      selectedParameter!,
      selectedTime!
    );
  }, [allSavedData.solar, selectedParameter, selectedTime, formatChartData]);

  const chartDataTegMemo = useMemo(() => {
    return formatChartData(allSavedData.teg, selectedParameter!, selectedTime!);
  }, [allSavedData.teg, selectedParameter, selectedTime, formatChartData]);

  const chartDataCompost1Memo = useMemo(() => {
    return formatChartData(
      allSavedData.compostOne,
      selectedParameter!,
      selectedTime!
    );
  }, [
    allSavedData.compostOne,
    selectedParameter,
    selectedTime,
    formatChartData,
  ]);

  const chartDataCompost2Memo = useMemo(() => {
    return formatChartData(
      allSavedData.compostTwo,
      selectedParameter!,
      selectedTime!
    );
  }, [
    allSavedData.compostTwo,
    selectedParameter,
    selectedTime,
    formatChartData,
  ]);

  const lengthChecker = useMemo(() => {
    return (
      chartDataSolarMemo.length > 0 ||
      chartDataTegMemo.length > 0 ||
      (chartDataCompost1Memo.length > 0 && chartDataCompost2Memo.length > 0)
    );
  }, [
    chartDataSolarMemo,
    chartDataTegMemo,
    chartDataCompost1Memo,
    chartDataCompost2Memo,
  ]);

  const handleDeviceEnergyClick = () => {
    if (isDeviceCompostSelected) {
      setDeviceCompostSelected(false);
      setSelectedTime("Day");
    }
    setDeviceEnergySelected(!isDeviceEnergySelected);
    setSelectedParameter("voltage");
  };

  const handleDeviceCompostClick = () => {
    if (isDeviceEnergySelected) {
      setDeviceEnergySelected(false);
      setSelectedTime("Day");
    }
    setDeviceCompostSelected(!isDeviceCompostSelected);
    setSelectedParameter("methane");
  };

  const debouncedSetParameter = useRef(
    debounce((parameter: string) => {
      setSelectedParameter(parameter);
      setIsLoading(true); // Start loading when parameter changes

      setTimeout(() => {
        setIsLoading(false); // End loading after short delay - simulate processing if needed
      }, 300);
    }, 300)
  ).current;

  const handleParameterChange = (parameter: string) => {
    debouncedSetParameter(parameter);
  };

  const selectReading = (title: string) => {
    setSelectedReading(title);
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1">
        <HeaderSection
          headerText="Device"
          title="User"
          onPressToggle={() => console.log("Device")}
        />
        <ScrollView className="flex-1">
          <View className="w-full flex justify-center items-center">
            {/* Device Number */}
            <View className="w-[92.5%] py-3 flex-row border-b-2 flex justify-between items-center mt-4">
              <View className="flex flex-row gap-4">
                <MaterialIcons name="devices" size={24} color="black" />
                <Text>{deviceNumber}</Text>
              </View>
              <CustomButton onPress={() => console.log("HELP")} title="HELP" />
            </View>

            {/* Device Data Buttons */}
            <View>
              <View className="w-[72.5%] py-2 flex-row flex justify-between items-center mt-2 gap-2">
                <CustomButton
                  onPress={handleDeviceEnergyClick}
                  title="Energy Data"
                  textStyles="text-[8px] font-bold"
                  containerStyles={`w-[40%] p-2 align-center border-[0.5px] ${
                    isDeviceEnergySelected
                      ? "border-green-600 bg-green-100"
                      : "border-gray-400"
                  }`}
                />
                <CustomButton
                  onPress={handleDeviceCompostClick}
                  title="Compost Data"
                  textStyles="text-[8px] font-bold"
                  containerStyles={`w-[40%] p-2 align-center border-[0.5px] ${
                    isDeviceCompostSelected
                      ? "border-green-600 bg-green-100"
                      : "border-gray-400"
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
                    textStyles="text-[8px] font-bold"
                    containerStyles={`w-1/4 align-center p-2 border-[0.5px] ${
                      selectedTime === time
                        ? "border-green-600 bg-green-100"
                        : "border-gray-400"
                    } ${
                      !(isDeviceEnergySelected || isDeviceCompostSelected) &&
                      "opacity-50 border-green-[0] bg-transparent"
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
                <View className="w-full h-[350px] justify-center items-center ">
                  <Text className="font-semibold">Select A Parameter</Text>
                </View>
              )}

              {!dataProcessed && (
                <View className="w-full flex-col ">
                  <View className="w-full h-[475px] min-h-[475px] rounded-md justify-center items-center">
                    <Text>Processing...</Text>
                    <ActivityIndicator color={"#DE0F3F"} size={"small"} />
                  </View>
                </View>
              )}

              {isLoading && (
                <View className="w-full flex-col ">
                  <View className="w-full h-[475px] min-h-[475px] rounded-md justify-center items-center">
                    <ActivityIndicator color={"#DE0F3F"} size={"small"} />
                  </View>
                </View>
              )}

              {/* For The LineGraph */}
              {(isDeviceCompostSelected || isDeviceEnergySelected) &&
                dataProcessed && (
                  <LineGraphDataVisual
                    selectedTime={selectedTime}
                    lengthChecker={lengthChecker}
                    isLoading={isLoading}
                    isDeviceCompostSelected={isDeviceCompostSelected}
                    isDeviceEnergySelected={isDeviceEnergySelected}
                    chartDataSolar={chartDataSolarMemo}
                    chartDataTeg={chartDataTegMemo}
                    chartDataCompost1={chartDataCompost1Memo}
                    chartDataCompost2={chartDataCompost2Memo}
                    selectedParameter={selectedParameter}
                    getMaxValue={getMaxValue}
                    getYAxisLabelSuffix={getYAxisLabelSuffix}
                    handleParameterChange={handleParameterChange}
                  />
                )}
            </View>

            {/* Reading for Power*/}
            <View className="w-full justify-center items-center">
              <View className="w-[92.5%] flex-row  justify-between items-center">
                <View className="flex-1 flex-row justify-between items-center">
                  <CustomButton
                    onPress={(title) => {
                      if (!title) return;
                      selectReading(title);
                    }}
                    title="Solar"
                    textStyles="text-[8px] font-bold"
                    containerStyles={`flex-1 py-4 align-center border-x-2 rounded-none`}
                  />
                  <CustomButton
                    onPress={(title) => {
                      if (!title) return;
                      selectReading(title);
                    }}
                    title="TEG"
                    textStyles="text-[8px] font-bold"
                    containerStyles={`flex-1 py-4 align-center border-r-2 rounded-none`}
                  />
                  <CustomButton
                    onPress={(title) => {
                      if (!title) return;
                      selectReading(title);
                    }}
                    title="Battery"
                    textStyles="text-[8px] font-bold"
                    containerStyles={`flex-1 py-4 align-center border-r-2 rounded-none`}
                  />
                  <CustomButton
                    onPress={(title) => {
                      if (!title) return;
                      selectReading(title);
                    }}
                    title="Compost1"
                    textStyles="text-[8px] font-bold"
                    containerStyles={`flex-1 py-4 align-center border-r-2 rounded-none`}
                  />
                  <CustomButton
                    onPress={(title) => {
                      if (!title) return;
                      selectReading(title);
                    }}
                    title="Compost2"
                    textStyles="text-[8px] font-bold"
                    containerStyles={`flex-1 py-4 align-center border-r-2 rounded-none`}
                  />
                </View>
              </View>
              {/* Power and Compost Reading */}
              <View className="w-[92.5%] flex-col mt-2 border-2 rounded-md">
                <View className="flex-1 flex-row border-b-2  p-4">
                  <MaterialIcons name="devices" size={24} color="black" />
                  <Text className="text-center font-bold">
                    {" "}
                    Device Reading / 10min:{" "}
                  </Text>
                  {/* <View className="flex-row gap-2">
                  <Text> 20W</Text>
                </View> */}
                </View>
                <RealTimeReading
                  selectedReading={selectedReading}
                  realTimeData={realTimeData}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Device;
