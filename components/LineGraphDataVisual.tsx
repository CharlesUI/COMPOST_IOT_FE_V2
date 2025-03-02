import { View, Text, Animated, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import React, { useState, useCallback } from "react";
import CustomButton from "./CustomButton";
import { useMemo, useRef, useEffect } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
} from "date-fns"; // Import date-fns functions
import PointerLabelComponent from "./PointerLabelComponent";

interface LineGraphProps {
  selectedTime: string | undefined;
  lengthChecker: boolean;
  isLoading: boolean;
  isDeviceCompostSelected: boolean;
  isDeviceEnergySelected: boolean;
  chartDataSolar: any[];
  chartDataTeg: any[];
  chartDataCompost1: any[];
  chartDataCompost2: any[];
  selectedParameter: string | undefined;
  getMaxValue: (selectedParameter: string) => 20 | 5 | 100 | 15 | 80;
  getYAxisLabelSuffix: (
    selectedParameter: string
  ) => "" | "V" | "A" | "W" | "ppm" | "%" | "°C";
  handleParameterChange: (parameter: string) => void;
}

const LineGraphDataVisual = ({
  selectedTime,
  lengthChecker,
  isLoading,
  isDeviceCompostSelected,
  isDeviceEnergySelected,
  chartDataSolar,
  chartDataTeg,
  chartDataCompost1,
  chartDataCompost2,
  selectedParameter,
  getMaxValue,
  getYAxisLabelSuffix,
  handleParameterChange,
}: LineGraphProps) => {

// Add these state variables before the return statement (around line 41)
const [visibleStartIndex, setVisibleStartIndex] = useState(0);
const [visibleEndIndex, setVisibleEndIndex] = useState(50); // Show initial 50 points

// Add this memoized data preparation before the return statement
const visibleChartData1 = useMemo(() => {
  const data = isDeviceEnergySelected ? chartDataSolar : chartDataCompost1;
  // Ensure we don't exceed array bounds
  return data
}, [
  chartDataSolar, 
  chartDataCompost1, 
  isDeviceEnergySelected, 
  visibleStartIndex, 
  visibleEndIndex
]);

const visibleChartData2 = useMemo(() => {
  const data = isDeviceEnergySelected ? chartDataTeg : chartDataCompost2;
  return data
}, [
  chartDataTeg, 
  chartDataCompost2, 
  isDeviceEnergySelected, 
  visibleStartIndex, 
  visibleEndIndex
]);

// Add this function to handle data windowing during chart scroll
const handleChartScroll = useCallback((event: any) => {
  const scrollX = event.nativeEvent.contentOffset.x;
  const dataLength = isDeviceEnergySelected ? 
    Math.max(chartDataSolar.length, chartDataTeg.length) : 
    Math.max(chartDataCompost1.length, chartDataCompost2.length);
  
  // Calculate new visible window (adjust these values based on your chart spacing)
  const pointWidth = 50; // This should match your chart 'spacing' prop
  const newStartIndex = Math.max(0, Math.floor(scrollX / pointWidth) - 10);
  const newEndIndex = Math.min(dataLength, newStartIndex + 70); // Show 70 points at a time
  
  setVisibleStartIndex(newStartIndex);
  setVisibleEndIndex(newEndIndex);
}, [chartDataSolar, chartDataTeg, chartDataCompost1, chartDataCompost2, isDeviceEnergySelected]);

  
  const [indicatorColor1, setIndicatorColor1] = useState("blue"); // State for indicator colors
  const [indicatorColor2, setIndicatorColor2] = useState("red");
  const chartDateLabel = useMemo(() => {
    if (!selectedTime) return "";
    const today = new Date();
    let startDate: Date = today;
    let endDate: Date = today;
    let formatString = "MM/dd/yyyy";

    switch (selectedTime) {
      case "Day":
        startDate = startOfDay(today);
        endDate = endOfDay(today);
        formatString = "MM/dd/yyyy";
        return `Data as of ${format(today, formatString)}`;
      case "Week":
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
        formatString = "MM/dd/yyyy";
        return `${format(startDate, formatString)} - ${format(
          endDate,
          formatString
        )}`;
      case "Month":
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        formatString = "MMMM"; // Changed format for month display
        return `Month of ${format(startDate, formatString)}`;
      default:
        return "";
    }
  }, [selectedTime, isDeviceEnergySelected, isDeviceCompostSelected]);

  const getReadingType = () => {
    if (isDeviceEnergySelected && !isDeviceCompostSelected) {
      return { data1Label: "Solar", data2Label: "TEG" };
    } else if (!isDeviceEnergySelected && isDeviceCompostSelected) {
      return { data1Label: "Compost 1", data2Label: "Compost 2" };
    } else {
      return { data1Label: "Data 1", data2Label: "Data 2" }; // Default or handle error
    }
  };

  const readingTypeLabels = useMemo(
    () => getReadingType(),
    [isDeviceEnergySelected, isDeviceCompostSelected]
  );

  const adjustedMaxValue = useMemo(() => {
    const baseMax = selectedParameter ? getMaxValue(selectedParameter) : 0;
    return baseMax * 1.2;
  }, [selectedParameter, getMaxValue]); // Animation setup

  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0
  
  useEffect(() => {
    if (lengthChecker && !isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset the animation value to 0
      fadeAnim.setValue(0);
    }
  }, [lengthChecker, isLoading, fadeAnim]);

  useEffect(() => {
    if (isDeviceEnergySelected) {
      setIndicatorColor1("#eec643");
      setIndicatorColor2("#10B04B");
    } else if (isDeviceCompostSelected) {
      setIndicatorColor1("#eec643");
      setIndicatorColor2("#10B04B");
    }
  }, [isDeviceEnergySelected, isDeviceCompostSelected]); // Update on selection change
  
  const lineChartColor = useMemo(() => {
    // Memoize the color object
    if (isDeviceEnergySelected) {
      return {
        lineColor1: "#eec643", // Solar
        lineColor2: "#10B04B", // TEG
        startFillColor1:"#fff763",
          endFillColor1:"rgba(20,85,81,0.01)",
          startFillColor2:"rgba(20,105,81,0.3)",
          endFillColor2:"rgba(20,85,81,0.01)",
      };
    } else if (isDeviceCompostSelected) {
      return {
        lineColor1: "#eec643", // Solar
        lineColor2: "#10B04B", // TEG
        startFillColor1:"#fff763",
          endFillColor1:"rgba(20,85,81,0.01)",
          startFillColor2:"rgba(20,105,81,0.3)",
          endFillColor2:"rgba(20,85,81,0.01)",};
    } else {
      return {
        lineColor1: "#eec643", // Solar
        lineColor2: "#10B04B", // TEG
        startFillColor1:"#fff763",
          endFillColor1:"rgba(20,85,81,0.01)",
          startFillColor2:"rgba(20,105,81,0.3)",
          endFillColor2:"rgba(20,85,81,0.01)",};
    }
  }, [isDeviceEnergySelected, isDeviceCompostSelected]);

  // Add useMemo for chart props to avoid recreation on every render
// Add this before the return statement
const chartProps = useMemo(() => ({
  data: visibleChartData1,
  data2: visibleChartData2,
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
  yAxisLabelSuffix: selectedParameter && getYAxisLabelSuffix(selectedParameter),
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
        selectedParameter={selectedParameter}
        readingTypeLabels={readingTypeLabels}
      />
    ),
  },
  onScroll: handleChartScroll,
}), [
  visibleChartData1,
  visibleChartData2,
  isLoading,
  adjustedMaxValue,
  selectedParameter,
  getYAxisLabelSuffix,
  lineChartColor,
  readingTypeLabels,
  handleChartScroll
]);
  return (
    <View className="flex-1 mt-6">
      <View className="pb-4 flex-1 bg-[#2F2C2C]">
        {selectedTime && lengthChecker && !isLoading && (
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

                  <View className="w-full flex-row justify-end items-center">
                    <Text className="text-[12px] font-semibold color-white">
                      {readingTypeLabels.data2Label}
                    </Text>

                    <View
                      className="w-4 h-4 rounded-full ml-4" // Added margin
                      style={{ backgroundColor: indicatorColor2 }}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View className="h-[350px] min-h-[350px] overflow-hidden bg-[#2F2C2C]">
              {/* overflow-hidden to clip during fade */}

              <Animated.View style={{ opacity: fadeAnim }}>
                {/* Animated.View for fade */}
                {!isLoading && lengthChecker ? ( // Conditionally render LineChart when data is ready and not loading
                  <LineChart
                    
                    {...chartProps}
                    hideDataPoints1
                    hideDataPoints2
                  />
                ) : (
                  isLoading && (
                    <View className="w-full h-[360px] min-h-[360px] rounded-md justify-center items-center">
                      <ActivityIndicator color={"#DE0F3F"} size={"small"} />
                    </View>
                  )
                )}
              </Animated.View>
            </View>
            {/* Parameter Selection for Energy and Compost */}

            {(isDeviceEnergySelected || isDeviceCompostSelected) && (
              <View className="w-full justify-center items-center bg-[#2F2C2C]">
                <View className="w-[72.5%] pt-2 flex-row flex justify-between items-center">
                  {(isDeviceEnergySelected
                    ? ["voltage", "current", "wattage"]
                    : ["methane", "moisture", "temperature"]
                  ).map((param) => (
                    <CustomButton
                      key={param}
                      onPress={() => handleParameterChange(param)}
                      title={param.charAt(0).toUpperCase() + param.slice(1)}
                      textStyles="text-[8px] font-bold color-white"
                      containerStyles={`w-1/4 py-2 align-center border-2 bg-gray-800 ${
                        selectedParameter === param
                          ? "border-[#10B04B] border-2"
                      : "border-gray-100 border-[0.5px]"
                      }`}
                    />
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
  // Only re-render on necessary changes
  return (
    prevProps.selectedTime === nextProps.selectedTime &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isDeviceCompostSelected === nextProps.isDeviceCompostSelected &&
    prevProps.isDeviceEnergySelected === nextProps.isDeviceEnergySelected &&
    prevProps.selectedParameter === nextProps.selectedParameter &&
    // Check array lengths for dataset changes
    prevProps.chartDataSolar.length === nextProps.chartDataSolar.length &&
    prevProps.chartDataTeg.length === nextProps.chartDataTeg.length &&
    prevProps.chartDataCompost1.length === nextProps.chartDataCompost1.length &&
    prevProps.chartDataCompost2.length === nextProps.chartDataCompost2.length
  );
});
