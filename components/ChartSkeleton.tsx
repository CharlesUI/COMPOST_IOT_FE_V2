import { View, Text } from "react-native";
import { useState } from "react";
import React from "react";

interface ChartProps {
  description: String | null;
}

const ChartSkeleton = ({ description }: ChartProps) => {
  const [chartDescription, setChartDescription] = useState(description);

  return (
    <View className="flex-1 justify-center items-center">
      <View className="w-full h-[350px] flex justify-center items-center">
        <View className="w-[90%] h-[250px] bg-gray-200 rounded-md">
          <Text className="color-gray-400 p-4 text-center">{chartDescription}</Text>
          <View className="w-full h-6 bg-gray-300 mb-2 rounded-sm" />
          <View className="w-full flex-1 flex-row">
            <View className="w-[10%] h-full bg-gray-300 rounded-sm" />
            <View className="flex-1 flex justify-end">
              <View className="w-full h-[40%] bg-gray-300 rounded-sm" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ChartSkeleton;
