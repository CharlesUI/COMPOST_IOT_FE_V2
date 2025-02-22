import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import React from "react";
import HeaderSection from "@/components/HeaderSection";

const Manual = () => {
  return (
    <SafeAreaView className="flex-1">
      <HeaderSection headerText="Manual" title="User" onPressToggle={() => console.log("Manual")} />
    </SafeAreaView>
  );
};

export default Manual;
