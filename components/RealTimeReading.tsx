import { View, Text } from "react-native";
import React from "react";

export interface RTC {
    batteryStatus: number;
    solar: {
      voltage: number;
      current: number;
      wattage: number;
    };
    teg: {
      voltage: number;
      current: number;
      wattage: number;
    };
    compostContainerOne: {
      methane: number;
      temperature: number;
      moisture: number;
    };
    compostContainerTwo: {
      methane: number;
      temperature: number;
      moisture: number;
    };
    timestamp: Date;
}

interface Props {
  selectedReading: string | null
  realTimeData: RTC | undefined
}

const RealTimeReading = ({ selectedReading, realTimeData }: Props) => {
  return (
    <View className="flex-1">
      {selectedReading === "Battery" && (
        <View className="flex-1 p-4">
          <Text className="mb-2 font-bold">Battery Status </Text>
          <Text>{realTimeData?.batteryStatus} %</Text>
        </View>
      )}
      {selectedReading === "Solar" && (
        <View className="flex-1 p-4">
          <Text className="mb-2 font-bold">Solar </Text>
          <Text>Voltage: {realTimeData?.solar.voltage} V</Text>
          <Text>Current: {realTimeData?.solar.current} A</Text>
          <Text>Wattage: {realTimeData?.solar.wattage} W</Text>
        </View>
      )}
      {selectedReading === "TEG" && (
        <View className="flex-1 p-4">
          <Text className="mb-2 font-bold">TEG </Text>
          <Text>Voltage: {realTimeData?.teg.voltage} V</Text>
          <Text>Current: {realTimeData?.teg.current} A</Text>
          <Text>Wattage: {realTimeData?.teg.wattage} W</Text>
        </View>
      )}
      {selectedReading === "Compost1" && (
        <View className="flex-1 p-4">
          <Text className="mb-2 font-bold">Compost Storage 1 </Text>
          <Text>Temperature: {realTimeData?.compostContainerOne.temperature} C</Text>
          <Text>Moisture: {realTimeData?.compostContainerOne.moisture} %</Text>
          <Text>Methane: {realTimeData?.compostContainerOne.methane} ppm</Text>
        </View>
      )}
      {selectedReading === "Compost2" && (
        <View className="flex-1 p-4">
          <Text className="mb-2 font-bold">Compost Storage 2 </Text>
          <Text>Temperature: {realTimeData?.compostContainerTwo.temperature} C</Text>
          <Text>Moisture: {realTimeData?.compostContainerTwo.moisture} %</Text>
          <Text>Methane: {realTimeData?.compostContainerTwo.methane} ppm</Text>
        </View>
      )}
    </View>
  );
};

// In RealTimeReading.tsx and other components
export default React.memo(RealTimeReading, (prevProps, nextProps) => {
  return prevProps.selectedReading === nextProps.selectedReading &&
         JSON.stringify(prevProps.realTimeData) === JSON.stringify(nextProps.realTimeData);
});
