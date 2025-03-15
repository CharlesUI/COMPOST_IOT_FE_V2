import { SafeAreaView } from "react-native-safe-area-context";

import React from "react";
import HeaderSection from "@/components/HeaderSection";

const Manual = () => {
  return (
    <SafeAreaView className="flex-1">
      <HeaderSection headerText="Manual" title="User" />
    </SafeAreaView>
  );
};

export default Manual;
