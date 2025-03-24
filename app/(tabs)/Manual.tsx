import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import HeaderSection from "@/components/HeaderSection";

const Step1 = require('@/assets/images/1.png');
const Step2 = require('@/assets/images/2.png');
const Step3 = require('@/assets/images/3.png');

const Manual = () => {
  const [activeStep, setActiveStep] = useState(1);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  
  const renderImage = () => {
    switch (activeStep) {
      case 1:
        return (
          <Image 
            source={Step1} 
            style={{ width: windowWidth * 0.9, alignSelf: 'center', height: windowHeight * 1.025, borderRadius: 12.5, marginBottom: 5, padding: 3 }} 
            resizeMode="contain" 
          />
        );
      case 2:
        return (
          <Image 
            source={Step2} 
            style={{ width: windowWidth * 0.9, alignSelf: 'center', height: windowHeight * 1.025, borderRadius: 12.5, marginBottom: 5, padding: 3 }} 
            resizeMode="contain" 
          />
        );
      case 3:
        return (
          <Image 
            source={Step3} 
            style={{ width: windowWidth * 0.9, alignSelf: 'center', height: windowHeight * 1.025, borderRadius: 12.5, marginBottom: 5, padding: 3 }} 
            resizeMode="contain" 
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#2F2C2C]">
      <HeaderSection headerText="User Manual" title="User" />
      
      <View className="flex-row justify-between px-4 py-4">
        <TouchableOpacity 
          className={`flex-1 py-3 items-center justify-center rounded-lg mx-1 ${activeStep === 1 ? 'bg-[#10B04B]' : 'bg-gray-700'}`}
          onPress={() => setActiveStep(1)}
        >
          <Text className="text-white font-semibold text-center">Composting Process</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 items-center justify-center rounded-lg mx-1 ${activeStep === 2 ? 'bg-[#10B04B]' : 'bg-gray-700'}`}
          onPress={() => setActiveStep(2)}
        >
          <Text className="text-white font-semibold text-center">Things to Consider</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 items-center justify-center rounded-lg mx-1 ${activeStep === 3 ? 'bg-[#10B04B]' : 'bg-gray-700'}`}
          onPress={() => setActiveStep(3)}
        >
          <Text className="text-white font-semibold text-center">Problems</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={true}
      >
        {renderImage()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Manual;