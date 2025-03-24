import React, { useState, useRef } from "react";
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated,
  StatusBar,
  useWindowDimensions,
  Modal,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeaderSection from "@/components/HeaderSection";

const Step1 = require('@/assets/images/1.png');
const Step2 = require('@/assets/images/2.png');
const Step3 = require('@/assets/images/3.png');

// If you don't have react-native-pinch-zoom-view, you can use this basic implementation
const ZoomableImage = ({ source }: { source: any }) => {
  const { width, height } = useWindowDimensions();
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const distanceRef = useRef(0);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      // For pinch-to-zoom gesture
      onPanResponderMove: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // For pinch gesture
        if (e.nativeEvent.touches.length === 2) {
          const touch1 = e.nativeEvent.touches[0];
          const touch2 = e.nativeEvent.touches[1];
          
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distanceRef.current === 0) {
            distanceRef.current = distance;
            return;
          }
          
          let newScale = (distance / distanceRef.current) * lastScale.current;
          newScale = Math.min(Math.max(newScale, 0.5), 3); // Limit scale between 0.5 and 3
          
          scale.setValue(newScale);
          
        } 
        // For panning gesture (when zoomed in)
        else if (e.nativeEvent.touches.length === 1 && lastScale.current > 1) {
          translateX.setValue(lastTranslateX.current + gestureState.dx);
          translateY.setValue(lastTranslateY.current + gestureState.dy);
        }
      },
      
      onPanResponderRelease: () => {
        lastScale.current = (scale as any)._value;
        lastTranslateX.current = (translateX as any)._value;
        lastTranslateY.current = (translateY as any)._value;
        distanceRef.current = 0;
        
        // Reset position if scale is back to normal
        if ((scale as any)._value <= 1) {
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start(() => {
            lastScale.current = 1;
            lastTranslateX.current = 0;
            lastTranslateY.current = 0;
          });
        }
      },
      
      onPanResponderGrant: () => {
        lastScale.current = (scale as any)._value;
        lastTranslateX.current = (translateX as any)._value;
        lastTranslateY.current = (translateY as any)._value;
      },
    })
  ).current;
  
  // Double tap to zoom
  const lastTap = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if ((scale as any)._value > 1) {
        // Zoom out
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        ]).start(() => {
          lastScale.current = 1;
          lastTranslateX.current = 0;
          lastTranslateY.current = 0;
        });
      } else {
        // Zoom in
        Animated.spring(scale, { 
          toValue: 2, 
          useNativeDriver: true 
        }).start(() => {
          lastScale.current = 2;
        });
      }
    }
    lastTap.current = now;
  };
  
  return (
    <View 
      style={{ width: '100%', height: height * 0.75, alignItems: 'center', justifyContent: 'center' }}
      {...panResponder.panHandlers}
      onTouchEnd={handleDoubleTap}
    >
      <Animated.Image
        source={source}
        style={{
          width: width * 0.9,
          height: height * 0.75,
          transform: [
            { scale },
            { translateX },
            { translateY }
          ],
          borderRadius: 16,
        }}
        resizeMode="contain"
      />
      <View className="absolute bottom-4 left-0 right-0 items-center">
        <View className="bg-black/50 px-4 py-2 rounded-full">
          <Text className="text-white text-xs">Double tap to zoom • Pinch to zoom in/out</Text>
        </View>
      </View>
    </View>
  );
};

const Manual = () => {
  const [activeStep, setActiveStep] = useState(1);
  const { width, height } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  
  const handleStepChange = (step: number) => {
    // First fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true
    }).start(() => {
      // Then change the step
      setActiveStep(step);
      // Then fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Scroll to top when changing sections
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    });
  };

  // Initialize the fade-in animation on first render
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);
  
  const steps = [
    { id: 1, title: "Composting Process", icon: "leaf" },
    { id: 2, title: "Things to Consider", icon: "information-circle" },
    { id: 3, title: "Problems", icon: "warning" }
  ];

  const getCurrentImage = () => {
    switch (activeStep) {
      case 1: return Step1;
      case 2: return Step2;
      case 3: return Step3;
      default: return Step1;
    }
  };

  const renderImageContent = () => {
    let source = getCurrentImage();
    let title = "";
    let description = "";
    
    switch (activeStep) {
      case 1:
        title = "Composting Process";
        description = "Learn the essential steps to create high-quality compost for your garden.";
        break;
      case 2:
        title = "Things to Consider";
        description = "Important factors that affect your composting success.";
        break;
      case 3:
        title = "Common Problems";
        description = "Troubleshooting guide for your composting journey.";
        break;
    }

    return (
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <View className="px-4 pb-2">
          <View className="bg-[#1E1C1C] rounded-xl p-4 mb-4 border border-[#3A3A3A]">
            <Text className="text-xl font-bold text-white mb-1">{title}</Text>
            <Text className="text-gray-400">{description}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          className="items-center px-2 mb-8"
          onPress={() => setImageModalVisible(true)}
          activeOpacity={0.9}
        >
          <View className="relative">
            <Image 
              source={source} 
              style={{ 
                width: width * 0.9, 
                height: height * 0.6,
                borderRadius: 16,
              }} 
              resizeMode="contain"
            />
            <View className="absolute bottom-4 right-4 bg-black/60 p-2 rounded-full">
              <Ionicons name="resize" size={24} color="white" />
            </View>
          </View>
          <Text className="text-gray-400 mt-2 text-center">Tap image to zoom</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#242424]">
      <StatusBar barStyle="light-content" />
      <HeaderSection headerText="User Manual" title="User" />
      
      {/* Step Indicators */}
      <View className="px-4 py-3">
        <View className="bg-[#1E1C1C] rounded-2xl p-2 shadow-md">
          <View className="flex-row justify-between">
            {steps.map((step) => (
              <TouchableOpacity 
                key={step.id}
                className={`flex-1 py-3 px-2 items-center justify-center rounded-xl mx-1 ${
                  activeStep === step.id 
                    ? 'bg-[#10B04B]' 
                    : 'bg-[#333333]'
                }`}
                onPress={() => handleStepChange(step.id)}
                style={{
                  shadowColor: activeStep === step.id ? '#10B04B' : 'transparent',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: activeStep === step.id ? 4 : 0
                }}
              >
                <Ionicons 
                  name={step.icon as any} 
                  size={20} 
                  color="white" 
                  style={{ marginBottom: 4 }}
                />
                <Text className="text-white font-medium text-center text-sm">
                  {step.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Progress Indicator */}
      <View className="px-6 mb-2">
        <View className="h-1 bg-[#333333] rounded-full overflow-hidden">
          <View 
            className="h-1 bg-[#10B04B] rounded-full"
            style={{ width: `${(activeStep / steps.length) * 100}%` }}
          />
        </View>
      </View>
      
      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {renderImageContent()}
        
        {/* Navigation Controls */}
        <View className="flex-row justify-between px-6 mb-8">
          <TouchableOpacity 
            className={`py-3 px-5 rounded-lg ${activeStep === 1 ? 'bg-gray-700/50' : 'bg-gray-700'}`}
            onPress={() => activeStep > 1 && handleStepChange(activeStep - 1)}
            disabled={activeStep === 1}
          >
            <View className="flex-row items-center">
              <Ionicons name="chevron-back" size={18} color="white" />
              <Text className="text-white font-medium ml-1">Previous</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`py-3 px-5 rounded-lg ${activeStep === steps.length ? 'bg-gray-700/50' : 'bg-green-700'}`}
            onPress={() => activeStep < steps.length && handleStepChange(activeStep + 1)}
            disabled={activeStep === steps.length}
          >
            <View className="flex-row items-center">
              <Text className="text-white font-medium mr-1">Next</Text>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Fullscreen Image Modal with Zoom */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity 
            className="absolute top-10 right-6 z-10 bg-black/40 p-2 rounded-full"
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <ZoomableImage source={getCurrentImage()} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Manual;