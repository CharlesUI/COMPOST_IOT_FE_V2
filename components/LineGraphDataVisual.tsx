import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { View, Text, Animated, ActivityIndicator } from "react-native";
import { TouchableOpacity } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
} from "date-fns"; // Import date-fns functions - Keeping these as the logic is still here

import CustomButton from "./CustomButton";
import PointerLabelComponent from "./PointerLabelComponent";

interface LineGraphProps {
  deviceTime: string | undefined;
  chartData: any; // Use the combined chartData prop
  isLoading: boolean;
  isDeviceCompostSelected: boolean;
  isSolarSelected: boolean;
  isDeviceEnergySelected: boolean;
  deviceParameter: string | undefined;
  getMaxValue: (deviceParameter: string) => 20 | 5 | 100 | 10000 | 80;
  getYAxisLabelSuffix: (
    deviceParameter: string
  ) => "" | "V" | "A" | "W" | "ppm" | "%" | "°C";
  handleParameterChange: (parameter: string) => void;
}

const LineGraphDataVisual = ({
  deviceTime,
  chartData, // Using combined chartData prop
  isLoading,
  isDeviceCompostSelected,
  isSolarSelected,
  isDeviceEnergySelected,
  deviceParameter,
  getMaxValue,
  getYAxisLabelSuffix,
  handleParameterChange,
}: LineGraphProps) => {
  console.log("--------------------------------------------------");
  console.log(" LineGraphDataVisual - Props Received: ");
  console.log(
    " deviceTime:",
    deviceTime,
    "  deviceParameter:",
    deviceParameter,
    "  COMPOST:",
    isDeviceCompostSelected,
    "  ENERGY:",
    isDeviceEnergySelected,
    "  isLoading:",
    isLoading
  );
  console.log("--------------------------------------------------");

  // console.log(" CHART DATA: ", chartData);
  console.log(
    " SOLAR:",
    chartData?.solar?.length,
    " TEGONE:",
    chartData?.tegOne?.length,
    " TEGTWO:",
    chartData?.tegTwo?.length,
    " COMPOST1:",
    chartData?.compostContainerOne?.length,
    " COMPOST2:",
    chartData?.compostContainerTwo?.length
  );
  console.log("--------------------------------------------------");

  // Console log the length of solar data
  useEffect(() => {
    console.log("Solar Data Length:", chartData?.solar?.length);
  }, [chartData?.solar]);

  // Add these state variables before the return statement (around line 41)
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(50); // Show initial 50 points

  // Add this memoized data preparation before the return statement
  const visibleChartData1 = useMemo(() => {
    if (isSolarSelected) {
      return chartData?.solar ?? [];
    } else if (isDeviceEnergySelected) {
      return chartData?.tegOne ?? []; // Use tegOne for data1 when energy is selected
    } else {
      return chartData?.compostContainerOne ?? [];
    }
  }, [
    chartData,
    isDeviceEnergySelected,
    isSolarSelected,
    visibleStartIndex,
    visibleEndIndex,
  ]);

  const visibleChartData2 = useMemo(() => {
    return isDeviceEnergySelected
      ? chartData?.tegTwo ?? [] // Use tegTwo for data2 when energy is selected
      : chartData?.compostContainerTwo ?? [];
  }, [chartData, isDeviceEnergySelected, visibleStartIndex, visibleEndIndex]);

  // Add this function to handle data windowing during chart scroll
  const handleChartScroll = useCallback(
    (event: any) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      const dataLength = isSolarSelected
        ? (chartData?.solar ?? []).length
        : isDeviceEnergySelected
        ? Math.max(
            (chartData?.tegOne ?? []).length,
            (chartData?.tegTwo ?? []).length
          )
        : Math.max(
            (chartData?.compostContainerOne ?? []).length,
            (chartData?.compostContainerTwo ?? []).length
          );

      // Calculate new visible window (adjust these values based on your chart spacing)
      const pointWidth = 50; // This should match your chart 'spacing' prop
      const newStartIndex = Math.max(0, Math.floor(scrollX / pointWidth) - 10);
      const newEndIndex = Math.min(dataLength, newStartIndex + 70); // Show 70 points at a time

      setVisibleStartIndex(newStartIndex);
      setVisibleEndIndex(newEndIndex);
    },
    [chartData, isDeviceEnergySelected, isSolarSelected]
  );

  const [indicatorColor1, setIndicatorColor1] = useState("blue"); // State for indicator colors
  const [indicatorColor2, setIndicatorColor2] = useState("red");
  const chartDateLabel = useMemo(() => {
    if (!deviceTime) return "";
    const today = new Date();
    let startDate: Date = today;
    let endDate: Date = today;
    let formatString = "MM/dd/yyyy";

    switch (deviceTime) {
      case "day":
        startDate = startOfDay(today);
        endDate = endOfDay(today);
        formatString = "MM/dd/yyyy";
        return `Data from last 24 hours (as of ${format(today, formatString)})`;
      case "week":
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
        formatString = "MM/dd/yyyy";
        return `${format(startDate, formatString)} - ${format(
          endDate,
          formatString
        )}`;
      case "month":
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        formatString = "MMMM"; // Changed format for month display
        return `Month of ${format(startDate, formatString)}`;
      default:
        return "";
    }
  }, [
    deviceTime,
    isDeviceEnergySelected,
    isDeviceCompostSelected,
    isSolarSelected,
  ]);

  const getReadingType = () => {
    if (isSolarSelected) {
      return { data1Label: "Solar", data2Label: "" };
    } else if (isDeviceEnergySelected && !isDeviceCompostSelected) {
      return { data1Label: "TEG: COCO", data2Label: "TEG: MIXED" }; // Updated labels to reflect the change
    } else if (!isDeviceEnergySelected && isDeviceCompostSelected) {
      return { data1Label: "COCO", data2Label: "MIXED" };
    } else {
      return { data1Label: "Data 1", data2Label: "Data 2" }; // Default or handle error
    }
  };

  const readingTypeLabels = useMemo(
    () => getReadingType(),
    [isDeviceEnergySelected, isDeviceCompostSelected, isSolarSelected]
  );

  const adjustedMaxValue = useMemo(() => {
    const baseMax = deviceParameter ? getMaxValue(deviceParameter) : 0;
    return baseMax * 1.2;
  }, [deviceParameter, getMaxValue]); // Animation setup

  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0

  const lengthChecker = useMemo(() => {
    return (
      (chartData?.compostContainerOne?.length ?? 0) > 0 ||
      (chartData?.compostContainerTwo?.length ?? 0) > 0 ||
      (chartData?.tegOne?.length ?? 0) > 0 ||
      (chartData?.tegTwo?.length ?? 0) > 0 ||
      (chartData?.solar?.length ?? 0) > 0
    );
  }, [chartData]);

  useEffect(() => {
    if (lengthChecker && !isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [lengthChecker, isLoading, fadeAnim]);

  useEffect(() => {
    if (isSolarSelected) {
      setIndicatorColor1("#eec643"); // Solar color (yellowish)
      setIndicatorColor2("transparent"); // No second line for solar
    } else if (isDeviceEnergySelected) {
      setIndicatorColor1("#10B04B"); // TegOne color
      setIndicatorColor2("#8A2BE2"); // TegTwo color (complementary)
    } else if (isDeviceCompostSelected) {
      setIndicatorColor1("#eec643");
      setIndicatorColor2("#10B04B");
    }
  }, [isDeviceEnergySelected, isDeviceCompostSelected, isSolarSelected]);

  const lineChartColor = useMemo(() => {
    if (isSolarSelected) {
      return {
        lineColor1: "#eec643", // Solar - Yellowish
        lineColor2: "transparent",
        startFillColor1: "#fff763",
        endFillColor1: "rgba(20,85,81,0.01)",
        startFillColor2: "transparent",
        endFillColor2: "transparent",
      };
    } else if (isDeviceEnergySelected) {
      return {
        lineColor1: "#10B04B", // TEG One
        lineColor2: "#8A2BE2", // TEG Two - Complementary color
        startFillColor1: "rgba(20,105,81,0.3)",
        endFillColor1: "rgba(20,85,81,0.01)",
        startFillColor2: "rgba(138, 43, 226, 0.3)", // Complementary fill color
        endFillColor2: "rgba(138, 43, 226, 0.01)", // Complementary fill color
      };
    } else if (isDeviceCompostSelected) {
      return {
        lineColor1: "#eec643", // Compost 1
        lineColor2: "#10B04B", // Compost 2
        startFillColor1: "#fff763",
        endFillColor1: "rgba(20,85,81,0.01)",
        startFillColor2: "rgba(20,105,81,0.3)",
        endFillColor2: "rgba(20,85,81,0.01)",
      };
    } else {
      return {
        lineColor1: "#eec643", // Default
        lineColor2: "#10B04B", // Default
        startFillColor1: "#fff763",
        endFillColor1: "rgba(20,85,81,0.01)",
        startFillColor2: "rgba(20,105,81,0.3)",
        endFillColor2: "rgba(20,85,81,0.01)",
      };
    }
  }, [isDeviceEnergySelected, isDeviceCompostSelected, isSolarSelected]);

  const chartProps = useMemo(
    () => ({
      data: visibleChartData1,
      data2: isSolarSelected ? undefined : visibleChartData2, // Conditionally render data2
      noOfSections: 5,
      height: 300,
      showVerticalLines: true,
      verticalLinesColor: "gray",
      thickness: 3,
      rulesThickness: 1,
      rulesType: "solid",
      rulesColor: "gray",
      initialSpacing: 50,
      endSpacing: 10,
      spacing: 50,
      backgroundColor: "#2F2C2C",
      // Optimize animations based on state
      isAnimated: !isLoading,
      animateOnDataChange: false, // Disable for performance
      animationDuration: 500, // Shorter duration for better performance
      scrollAnimation: true,
      areaChart: true,
      // curved: true,
      maxValue: adjustedMaxValue,
      xAxisLabelsHeight: 40,
      xAxisTextNumberOfLines: 2,
      yAxisLabelWidth: 30,
      xAxisThickness: 1,
      xAxisColor: "gray",
      xAxisLabelTextStyle: {
        marginTop: 10,
        fontSize: 6,
        fontWeight: "bold",
        color: "white",
      },
      roundToDigits: 0,
      yAxisLabelSuffix: deviceParameter && getYAxisLabelSuffix(deviceParameter),
      yAxisTextStyle: { fontSize: 6, fontWeight: "bold", color: "white" },
      yAxisThickness: 0,
      startOpacity: 0.4,
      endOpacity: 0.1,
      color: lineChartColor.lineColor1,
      color2: lineChartColor.lineColor2,
      dataPointsColor1: lineChartColor.lineColor1,
      dataPointsColor2: lineChartColor.lineColor2,
      startFillColor1: lineChartColor.startFillColor1,
      startFillColor2: lineChartColor.startFillColor2,
      // endFillColor1: lineChartColor.endFillColor1,
      // endFillColor2: lineChartColor.endFillColor2,
      focusEnabled: true,
      showTextOnFocus: true,
      pointerConfig: {
        activatePointersOnLongPress: true,
        pointerStripUptoDataPoint: true,
        autoAdjustPointerLabelPosition: false,
        pointerStripColor: "gray",
        pointerStripWidth: 2,
        strokeDashArray: [4, 5],
        pointerColor: "black",
        radius: 4,
        pointerLabelWidth: 90,
        pointerLabelHeight: 1000,
        pointerStripHeight: 160,
        pointerLabelComponent: (items: any) => (
          <PointerLabelComponent
            items={items}
            deviceParameter={deviceParameter}
            readingTypeLabels={readingTypeLabels}
          />
        ),
      },
      onScroll: handleChartScroll,
      xAxisLabelExtractor: ({ item }: any) => item.label,
    }),
    [
      visibleChartData1,
      visibleChartData2,
      isLoading,
      adjustedMaxValue,
      deviceParameter,
      getYAxisLabelSuffix,
      lineChartColor,
      readingTypeLabels,
      handleChartScroll,
      isSolarSelected,
    ]
  );

  return (
    <View className="flex-1 mt-4">
      <View className="pb-4 flex-1 bg-[#2F2C2C]">
        {deviceTime && lengthChecker && !isLoading && (
          <View>
            <View className="w-full justify-center items-center bg-[#2F2C2C] mb-2">
              <View className="w-[72.5%] flex-row justify-center items-center">
                <Text className="flex-1 text-start font-semibold text-[12px] py-2 color-white">
                  {chartDateLabel}
                </Text>

                <View className="flex-1 flex-col items-center justify-center ">
                  <View className="w-full flex-row justify-end items-center">
                    <Text className="text-[12px] font-semibold color-white">
                      {readingTypeLabels.data1Label}
                    </Text>

                    <View
                      className="w-4 h-4 rounded-full ml-4"
                      style={{ backgroundColor: indicatorColor1 }}
                    />
                  </View>

                  {readingTypeLabels.data2Label !== "" && (
                    <View className="w-full flex-row justify-end items-center">
                      <Text className="text-[12px] font-semibold color-white">
                        {readingTypeLabels.data2Label}
                      </Text>

                      <View
                        className="w-4 h-4 rounded-full ml-4" // Added margin
                        style={{ backgroundColor: indicatorColor2 }}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View className="h-[350px] min-h-[350px] overflow-hidden bg-[#2F2C2C]">
              <Animated.View style={{ opacity: fadeAnim }}>
                {!isLoading && lengthChecker ? (
                  visibleChartData1 && visibleChartData1.length > 0 ? (
                    <LineChart
                      {...chartProps}
                      // hideDataPoints1
                      // hideDataPoints2
                    />
                  ) : (
                    <View className="w-full h-[360px] min-h-[360px] rounded-md justify-center items-center">
                      <Text style={{ color: "white" }}>
                        No Chart Data Available
                      </Text>
                    </View>
                  )
                ) : (
                  isLoading && (
                    <View className="w-full h-[360px] min-h-[360px] rounded-md justify-center items-center">
                      <ActivityIndicator color={"#DE0F3F"} size={"small"} />
                    </View>
                  )
                )}
              </Animated.View>
            </View>
            {/* Energy and Compost Parameter Buttons */}
            {(isDeviceEnergySelected || isDeviceCompostSelected) && (
              <View className="w-full justify-center items-center bg-[#1E1E1E] py-4">
                <View className="w-[90%] gap-3 flex-row justify-between items-center">
                  {(isDeviceEnergySelected
                    ? ["voltage", "current", "wattage"]
                    : ["methane", "moisture", "temperatureIn", "temperatureOut"]
                  ).map((param) => (
                    <TouchableOpacity
                      key={param}
                      onPress={() => handleParameterChange(param)}
                      className={`flex-1 p-3 rounded-xl items-center justify-center ${
                        deviceParameter === param
                          ? "bg-[#10B04B]/30 border-2 border-[#10B04B]"
                          : "bg-[#2A2A2A]"
                      }`}
                    >
                      <Text
                        className={`text-[7px] font-bold uppercase ${
                          deviceParameter === param
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {param === "temperatureIn"
                          ? "Temp In"
                          : param === "temperatureOut"
                          ? "Temp Out"
                          : param.charAt(0).toUpperCase() + param.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Solar Parameter Buttons */}
            {isSolarSelected && (
              <View className="w-full justify-center items-center bg-[#1E1E1E] py-4">
                <View className="w-[90%] gap-3 flex-row justify-between items-center">
                  {["voltage", "current", "wattage"].map((param) => (
                    <TouchableOpacity
                      key={param}
                      onPress={() => handleParameterChange(param)}
                      className={`flex-1 p-3 rounded-xl items-center justify-center ${
                        deviceParameter === param
                          ? "bg-[#EEC643]/30 border-2 border-[#EEC643]"
                          : "bg-[#2A2A2A]"
                      }`}
                    >
                      <Text
                        className={`text-[7px] font-bold uppercase ${
                          deviceParameter === param
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {param.charAt(0).toUpperCase() + param.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// Add to LineGraphDataVisual.tsx
export default React.memo(LineGraphDataVisual, (prevProps, nextProps) => {
  return (
    prevProps.deviceTime === nextProps.deviceTime &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isDeviceCompostSelected === nextProps.isDeviceCompostSelected &&
    prevProps.isSolarSelected === nextProps.isSolarSelected &&
    prevProps.isDeviceEnergySelected === nextProps.isDeviceEnergySelected &&
    prevProps.deviceParameter === nextProps.deviceParameter &&
    prevProps.chartData === nextProps.chartData
  );
});
