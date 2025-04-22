import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, Animated, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
} from "date-fns";

import PointerLabelComponent from "./PointerLabelComponent";

interface LineGraphProps {
  deviceTime: string | undefined;
  chartData: any[]; // Simplified to just accept an array of data points
  isLoading: boolean;
  deviceType: 'solar' | 'energy' | 'compost'; // New prop to determine device type
  deviceParameter: string | undefined;
  getMaxValue: (deviceParameter: string) => 20 | 5 | 100 | 10000 | 80;
  getYAxisLabelSuffix: (deviceParameter: string) => "" | "V" | "A" | "W" | "ppm" | "%" | "°C";
  handleParameterChange?: (parameter: string) => void;
  title?: string; // Optional title for the chart
}

const LineGraphDataVisual = ({
  deviceTime,
  chartData,
  isLoading,
  deviceType,
  deviceParameter,
  getMaxValue,
  getYAxisLabelSuffix,
  handleParameterChange,
  title,
}: LineGraphProps) => {
  // Add state variables
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(50);
  const [indicatorColor, setIndicatorColor] = useState("#eec643");
  
  // Setup animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Reference for the scroll view
  const scrollViewRef = useRef<ScrollView>(null);

  // Determine if we have data to show
  const hasData = useMemo(() => {
    return Array.isArray(chartData) && chartData.length > 0;
  }, [chartData]);

  // Calculate total width for proper scrolling
  const chartWidth = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    // Initial spacing + (data points * spacing between points) + end spacing
    return 50 + (chartData.length * 50) + 10;
  }, [chartData]);

  // Handle chart scrolling - improved version
  const handleChartScroll = useCallback(
    (event: any) => {
      if (!chartData || chartData.length === 0) return;
      
      const scrollX = event.nativeEvent.contentOffset.x;
      const dataLength = chartData.length;
      const pointWidth = 50; // Spacing between points
      
      // Calculate visible indices based on scroll position
      const newStartIndex = Math.max(0, Math.floor(scrollX / pointWidth));
      const newEndIndex = Math.min(dataLength, newStartIndex + 70);
      
      setVisibleStartIndex(newStartIndex);
      setVisibleEndIndex(newEndIndex);
    },
    [chartData]
  );

  // Format the date label based on selected time frame
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
        return `${format(startDate, formatString)} - ${format(endDate, formatString)}`;
      case "month":
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        formatString = "MMMM";
        return `Month of ${format(startDate, formatString)}`;
      default:
        return "";
    }
  }, [deviceTime]);

  // Get the appropriate label and color based on device type
  const deviceLabel = useMemo(() => {
    switch (deviceType) {
      case 'solar':
        return "Solar";
      case 'energy':
        return "TEG";
      case 'compost':
        return "Compost";
      default:
        return "Data";
    }
  }, [deviceType]);

  // Set appropriate color based on device type
  useEffect(() => {
    switch (deviceType) {
      case 'solar':
        setIndicatorColor("#eec643"); // Yellowish for solar
        break;
      case 'energy':
        setIndicatorColor("#10B04B"); // Green for energy
        break;
      case 'compost':
        setIndicatorColor("#DE0F3F"); // Red for compost
        break;
      default:
        setIndicatorColor("#4e86f0"); // Default blue
    }
  }, [deviceType]);

  // Calculate adjusted max value with a buffer
  const adjustedMaxValue = useMemo(() => {
    const baseMax = deviceParameter ? getMaxValue(deviceParameter) : 0;
    return baseMax * 1.2; // 20% buffer
  }, [deviceParameter, getMaxValue]);

  // Fade in animation when data is loaded
  useEffect(() => {
    if (hasData && !isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [hasData, isLoading, fadeAnim]);

  // Define chart colors and styles
  const chartStyle = useMemo(() => {
    switch (deviceType) {
      case 'solar':
        return {
          lineColor: "#eec643",
          startFillColor: "rgba(238, 198, 67, 0.3)",
          endFillColor: "rgba(238, 198, 67, 0.01)"
        };
      case 'energy':
        return {
          lineColor: "#10B04B",
          startFillColor: "rgba(16, 176, 75, 0.3)", 
          endFillColor: "rgba(16, 176, 75, 0.01)"
        };
      case 'compost':
        return {
          lineColor: "#DE0F3F",
          startFillColor: "rgba(222, 15, 63, 0.3)",
          endFillColor: "rgba(222, 15, 63, 0.01)"
        };
      default:
        return {
          lineColor: "#4e86f0",
          startFillColor: "rgba(78, 134, 240, 0.3)",
          endFillColor: "rgba(78, 134, 240, 0.01)"
        };
    }
  }, [deviceType]);

  // Chart props configuration
  const chartProps = useMemo(
    () => ({
      data: chartData,
      noOfSections: 5,
      height: 300,
      showVerticalLines: true,
      verticalLinesColor: "rgba(128, 128, 128, 0.3)",
      thickness: 3,
      rulesThickness: 1,
      rulesType: "dashed",
      rulesColor: "rgba(128, 128, 128, 0.3)",
      initialSpacing: 40,
      endSpacing: 10,
      spacing: 40, // Distance between data points
      backgroundColor: "#2F2C2C",
      isAnimated: false,
      animateOnDataChange: false,
      animationDuration: 500,
      scrollAnimation: true,
      areaChart: true,
      curved: true,
      maxValue: adjustedMaxValue,
      xAxisLabelsHeight: 40,
      xAxisTextNumberOfLines: 2,
      yAxisLabelWidth: 40,
      xAxisThickness: 1,
      xAxisColor: "rgba(128, 128, 128, 0.5)",
      xAxisLabelTextStyle: {
        marginTop: 10,
        fontSize: 8,
        fontWeight: "bold",
        color: "rgba(255, 255, 255, 0.8)",
      },
      roundToDigits: 1,
      yAxisLabelSuffix: deviceParameter && getYAxisLabelSuffix(deviceParameter),
      yAxisTextStyle: { 
        fontSize: 8, 
        fontWeight: "bold", 
        color: "rgba(255, 255, 255, 0.8)" 
      },
      yAxisThickness: 0,
      startOpacity: 0.6,
      endOpacity: 0.1,
      color: chartStyle.lineColor,
      dataPointsColor: chartStyle.lineColor,
      startFillColor: chartStyle.startFillColor,
      endFillColor: chartStyle.endFillColor,
      focusEnabled: true,
      showTextOnFocus: true,
      hideDataPoints: false,
      showDataPointOnFocus: true,
      pointerConfig: {
        activatePointersOnLongPress: false,
        pointerStripUptoDataPoint: true,
        autoAdjustPointerLabelPosition: true,
        pointerStripColor: "rgba(255, 255, 255, 0.5)",
        pointerStripWidth: 2,
        strokeDashArray: [4, 5],
        pointerColor: chartStyle.lineColor,
        radius: 6,
        pointerLabelWidth: 120,
        pointerLabelHeight: 90,
        pointerStripHeight: 160,
        pointerLabelComponent: (items: any) => (
          <PointerLabelComponent
            items={items}
            deviceParameter={deviceParameter}
            readingTypeLabels={{ data1Label: deviceLabel, data2Label: "" }}
          />
        ),
      },
      // Don't include onScroll here - it will be handled by the ScrollView
      xAxisLabelExtractor: ({ item }: any) => item.label,
    }),
    [
      chartData,
      isLoading,
      adjustedMaxValue,
      deviceParameter,
      getYAxisLabelSuffix,
      chartStyle,
      deviceLabel,
    ]
  );

  return (
    <View className="flex-1 mt-4">
      <View className="pb-4 flex-1 bg-[#2F2C2C] rounded-lg">
        {deviceTime && hasData && !isLoading ? (
          <View>
            {/* Chart Header */}
            <View className="w-full px-4 pt-4 justify-between items-center bg-[#2F2C2C] mb-2">
              <View className="w-full flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-lg font-bold color-white">{title || 'Data Visualization'}</Text>
                  <Text className="text-xs text-gray-300">{chartDateLabel}</Text>
                </View>
                
                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold color-white pr-2">
                    {deviceLabel}
                  </Text>
                  <View 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: indicatorColor }}
                  />
                </View>
              </View>
            </View>

            {/* Chart View - Wrap in a ScrollView */}
            <View className="h-[350px] overflow-hidden bg-[#2F2C2C]">
              <Animated.View style={{ opacity: fadeAnim }}>
                {!isLoading && hasData ? (
                  <ScrollView
                    ref={scrollViewRef}
                    horizontal={true}
                    showsHorizontalScrollIndicator={true}
                    onScroll={handleChartScroll}
                    scrollEventThrottle={16} // Important for smooth scrolling
                    contentContainerStyle={{
                      width: chartWidth > 0 ? chartWidth : undefined,
                    }}
                  >
                    <LineChart {...chartProps} />
                  </ScrollView>
                ) : (
                  <View className="w-full h-[360px] rounded-md justify-center items-center">
                    <Text style={{ color: "white" }}>
                      {isLoading ? "Loading data..." : "No data available"}
                    </Text>
                    {isLoading && <ActivityIndicator color={indicatorColor} size="large" className="mt-4" />}
                  </View>
                )}
              </Animated.View>
            </View>
          </View>
        ) : (
          <View className="w-full h-[360px] rounded-md justify-center items-center">
            {isLoading ? (
              <>
                <ActivityIndicator color={chartStyle.lineColor} size="large" />
                <Text className="mt-4 text-white text-opacity-80">Loading chart data...</Text>
              </>
            ) : (
              <Text className="text-white text-opacity-80">Select a time period to view data</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// Memoize the component for better performance
export default React.memo(
  LineGraphDataVisual,
  (prevProps, nextProps) => {
    return (
      prevProps.deviceTime === nextProps.deviceTime &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.deviceType === nextProps.deviceType &&
      prevProps.deviceParameter === nextProps.deviceParameter &&
      prevProps.chartData === nextProps.chartData
    );
  }
);