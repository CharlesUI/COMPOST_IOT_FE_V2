import { View, Text, Animated, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import React, { useState } from "react";
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
      fadeAnim.setValue(0);
    }
  }, [lengthChecker, isLoading, fadeAnim]);

  useEffect(() => {
    if (isDeviceEnergySelected) {
      setIndicatorColor1("blue");
      setIndicatorColor2("red");
    } else if (isDeviceCompostSelected) {
      setIndicatorColor1("blue");
      setIndicatorColor2("red");
    }
  }, [isDeviceEnergySelected, isDeviceCompostSelected]); // Update on selection change

  const lineChartColor = useMemo(() => {
    // Memoize the color object
    if (isDeviceEnergySelected) {
      return {
        lineColor1: "blue", // Solar
        lineColor2: "green", // TEG
        startFillColor1: "skyblue", // Solar
        startFillColor2: "lightgreen", // TEG
        // endFillColor1: "skyblue", // Solar
        // endFillColor2: "lightgreen", // TEG
      };
    } else if (isDeviceCompostSelected) {
      return {
        lineColor1: "blue", // Compost 1
        lineColor2: "green", // Compost 2
        startFillColor1: "skyblue", // Compost 1
        startFillColor2: "lightgreen", // Compost 2
        // endFillColor1: "skyblue", // Compost 1
        // endFillColor2: "lightgreen", // Compost 2
      };
    } else {
      return {
        lineColor1: "#07BAD1",
        lineColor2: "orange",
        startFillColor1: "#8a56ce",
        startFillColor2: "#56acce",
        // endFillColor1: "#8a56ce",
        // endFillColor2: "#56acce",
      };
    }
  }, [isDeviceEnergySelected, isDeviceCompostSelected]);

  return (
    <View className="flex-1 ">
      <View className="pb-4 flex-1">
        {selectedTime && lengthChecker && !isLoading && (
          <View>
            <View className="w-full justify-center items-center">
              <View className="w-[72.5%] flex-row justify-center items-center ">
                <Text className="flex-1 text-start font-semibold text-[12px] py-2">
                  {chartDateLabel}
                </Text>

                <View className="flex-1 flex-col items-center justify-center ">
                  <View className="w-full flex-row justify-end items-center">
                    <Text className="text-[12px] font-semibold">
                      {readingTypeLabels.data1Label}
                    </Text>

                    <View
                      className="w-4 h-4 rounded-full ml-4"
                      style={{ backgroundColor: indicatorColor1 }}
                    />
                  </View>

                  <View className="w-full flex-row justify-end items-center">
                    <Text className="text-[12px] font-semibold">
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

            <View className="h-[350px] min-h-[350px] overflow-hidden">
              {/* overflow-hidden to clip during fade */}

              <Animated.View style={{ opacity: fadeAnim }}>
                {/* Animated.View for fade */}
                {!isLoading && lengthChecker ? ( // Conditionally render LineChart when data is ready and not loading
                  <LineChart
                    data={
                      isDeviceEnergySelected && !isDeviceCompostSelected
                        ? chartDataSolar
                        : chartDataCompost1
                    }
                    data2={
                      isDeviceEnergySelected && !isDeviceCompostSelected
                        ? chartDataTeg
                        : chartDataCompost2
                    }
                    noOfSections={5}
                    height={300}
                    showVerticalLines
                    verticalLinesThickness={0}
                    thickness={1}
                    rulesThickness={0}
                    initialSpacing={20}
                    endSpacing={-10}
                    spacing={50}
                    backgroundColor="transparent"
                    rulesType="solid"
                    rulesColor="gray"
                    // animation
                    isAnimated
                    animateOnDataChange
                    animationDuration={1000}
                    onDataChangeAnimationDuration={1000}
                    scrollAnimation
                    areaChart
                    curved
                    maxValue={adjustedMaxValue}
                    xAxisLabelsHeight={40}
                    xAxisTextNumberOfLines={2}
                    // scrollEventThrottle={16}
                    yAxisLabelWidth={30}
                    xAxisThickness={0}
                    xAxisLabelTextStyle={{
                      // marginLeft: 25,
                      marginTop: 10,
                      fontSize: 6,
                      fontWeight: "bold",
                    }}
                    roundToDigits={0}
                    yAxisLabelSuffix={
                      selectedParameter &&
                      getYAxisLabelSuffix(selectedParameter)
                    }
                    yAxisTextStyle={{ fontSize: 6, fontWeight: "bold" }}
                    yAxisThickness={0}
                    hideDataPoints
                    startOpacity={0.8}
                    endOpacity={0.3} // color
                    color={lineChartColor.lineColor1} // Use memoized color
                    color2={lineChartColor.lineColor2} // Use memoized color
                    dataPointsColor1={lineChartColor.lineColor1}
                    dataPointsColor2={lineChartColor.lineColor2}
                    startFillColor1={lineChartColor.startFillColor1}
                    startFillColor2={lineChartColor.startFillColor2}
                    // endFillColor1={lineChartColor.endFillColor1}
                    // endFillColor2={lineChartColor.endFillColor2}
                    focusEnabled
                    showTextOnFocus
                    pointerConfig={{
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
                    }}
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
              <View className="w-full justify-center items-center ">
                <View className="w-[72.5%] pt-2 flex-row flex justify-between items-center">
                  {(isDeviceEnergySelected
                    ? ["voltage", "current", "wattage"]
                    : ["methane", "moisture", "temperature"]
                  ).map((param) => (
                    <CustomButton
                      key={param}
                      onPress={() => handleParameterChange(param)}
                      title={param.charAt(0).toUpperCase() + param.slice(1)}
                      textStyles="text-[8px] font-bold"
                      containerStyles={`w-1/4 py-2 align-center border-2 ${
                        selectedParameter === param
                          ? "border-green-600 bg-green-100"
                          : "border-gray-400 bg-white"
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

export default LineGraphDataVisual;
