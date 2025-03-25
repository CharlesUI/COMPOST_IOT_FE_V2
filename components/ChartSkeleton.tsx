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
          <View className="w-full justify-center items-center bg-[#1E1E1E] px-4">
            <View className="w-full bg-[#2A2A2A] rounded-2xl p-6 shadow-lg">
              <Text className="text-gray-400 text-center text-lg mb-4">
                {chartDescription}
              </Text>
              <View className="w-full h-[200px] bg-[#3A3A3A] rounded-xl animate-pulse" />
            </View>
          </View>
        </View>
    </View>
  );
};

export default ChartSkeleton;
