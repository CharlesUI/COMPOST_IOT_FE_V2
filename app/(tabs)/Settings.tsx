import React, { useRef, useEffect, useState } from "react";
import { View, Text, Animated, Easing, ScrollView, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";

import CustomButton from "@/components/CustomButton";
import HeaderSection from "@/components/HeaderSection";
import { useUser } from "@/context/UserContext";
import { useAdmin } from "@/context/AdminContext";

const Settings = () => {
  const { user, logoutUser } = useUser();
  const { admin, logoutAdmin } = useAdmin();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [adminClickCount, setAdminClickCount] = useState(0);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleLogout = () => {
    console.log("Logging out with animation...");

    // Animated.timing(slideAnim, {
    //   toValue: -500,
    //   duration: 150,
    //   easing: Easing.linear,
    //   useNativeDriver: true,
    // }).start(() => {
      logoutUser();
      logoutAdmin();
      setAdminClickCount(0);
      router.push("/(tabs)");
    // });
  };

  const openAdminPanel = () => {
    setAdminClickCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    if (adminClickCount === 5) {
      Alert.alert("Admin Panel", "You are now opening the admin panel");
      setTimeout(() => {
        router.push("/adminLog");
        setAdminClickCount(0);
      }, 500);
    } else if (adminClickCount > 5) {
      setAdminClickCount(0);
    }
  }, [adminClickCount, router]);

  const animatedStyle = {
    transform: [{ translateX: slideAnim }],
  };

  // Function to render section header
  const renderSectionHeader = (title: any, icon: any) => (
    <View className="flex-row items-center mb-3">
      {icon}
      <Text className="text-white text-lg font-bold ml-2">{title}</Text>
    </View>
  );

  // Function to render info row
  const renderInfoRow = (label: any, value: any, isButton = false) => (
    <View className="flex-row justify-between items-center py-3 border-b border-[#4B4747]">
      <Text className="text-gray-300">{label}</Text>
      {isButton ? (
        <Pressable onPress={openAdminPanel} className="bg-[#4B4747] px-3 py-1 rounded-lg">
          <Text className="text-white">{value}</Text>
        </Pressable>
      ) : (
        <Text className="text-white">{value}</Text>
      )}
    </View>
  );

  // Function to render team member
  const renderTeamMember = (name: any, role: any | null) => (
    <View className="flex-row items-center mb-2">
      <View className="w-2 h-2 rounded-full bg-[#10B04B] mr-2" />
      <Text className="text-white">{name}</Text>
      {role && <Text className="text-gray-400 text-xs ml-2">({role})</Text>}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#2F2C2C]">
      <HeaderSection headerText="Settings" title="Account" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View style={animatedStyle} className="flex-1 p-4 space-y-6">
          {/* Profile Section */}
          {(user || admin) && (
            <View className="bg-[#3E3A3A] rounded-lg p-4 shadow-md">
              {renderSectionHeader(
                "Profile Information",
                <Ionicons name="person-circle" size={24} color="#3B82F6" />
              )}
              
              <View className="bg-[#2F2C2C] rounded-lg p-4">
                {admin ? (
                  <>
                    {renderInfoRow("Role", "Administrator")}
                    {renderInfoRow("Title", admin.title)}
                    {renderInfoRow("Username", admin.username)}
                    {renderInfoRow("Email", admin.email)}
                  </>
                ) : user ? (
                  <>
                    {renderInfoRow("Role", "User")}
                    {renderInfoRow("Username", user.username)}
                    {renderInfoRow("Email", user.email)}
                  </>
                ) : null}
              </View>
            </View>
          )}

          {/* App Information Section */}
          <View className="bg-[#3E3A3A] rounded-lg p-4 shadow-md">
            {renderSectionHeader(
              "App Information",
              <Ionicons name="information-circle" size={24} color="#10B04B" />
            )}
            
            <View className="bg-[#2F2C2C] rounded-lg p-4">
              {renderInfoRow("Application ID", "CompostSenseV1.0", true)}
              
              <View className="py-4 border-b border-[#4B4747]">
                <Text className="text-gray-300 mb-2">Capstone Project</Text>
                <Text className="text-white">
                  Design and Development of an IoT-Based System for Solar and
                  Thermal Energy Conversion to Electricity from Composting of
                  Food and Agricultural Waste
                </Text>
              </View>
              
              <View className="py-4">
                <Text className="text-gray-300 mb-3">Team Thermo</Text>
                {renderTeamMember("Bernardo, Cedric Levy F.", "")}
                {renderTeamMember("Laurente, Russel Carlou P.", "")}
                {renderTeamMember("Padua, Nathan John A.", "")}
                {renderTeamMember("Verano, Gia Jenica G.", "")}
                {renderTeamMember("Vivas, Charles David B.", "Developer")}
              </View>
            </View>
          </View>

          {/* System Information */}
          <View className="bg-[#3E3A3A] rounded-lg p-4 shadow-md">
            {renderSectionHeader(
              "System",
              <Ionicons name="settings-outline" size={24} color="#EF4444" />
            )}
            
            <View className="bg-[#2F2C2C] rounded-lg p-4">
              {renderInfoRow("Version", "1.0.0")}
              {renderInfoRow("Last Updated", "March 2025")}
              {renderInfoRow("Copyright", `© ${new Date().getFullYear()} Team Thermo`)}
            </View>
          </View>

          {/* Support & Help */}
          <View className="bg-[#3E3A3A] rounded-lg p-4 shadow-md">
            {renderSectionHeader(
              "Support",
              <Ionicons name="help-circle" size={24} color="#A855F7" />
            )}
            
            <View className="bg-[#2F2C2C] rounded-lg overflow-hidden">
              <Pressable className="flex-row justify-between items-center p-4 border-b border-[#4B4747]">
                <View className="flex-row items-center">
                  <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                  <Text className="text-white ml-3">Documentation</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </Pressable>
              
              <Pressable className="flex-row justify-between items-center p-4 border-b border-[#4B4747]">
                <View className="flex-row items-center">
                  <Ionicons name="help-buoy-outline" size={20} color="#10B04B" />
                  <Text className="text-white ml-3">Get Help</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </Pressable>
              
              <Pressable className="flex-row justify-between items-center p-4">
                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={20} color="#EF4444" />
                  <Text className="text-white ml-3">Contact Developer</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          {(user || admin) && (
            <Pressable 
              onPress={handleLogout}
              className="bg-[#3E3A3A] rounded-lg overflow-hidden"
            >
              <View className="flex-row items-center justify-center p-4 border-l-4 border-l-red-500">
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text className="text-red-500 font-bold ml-2">LOGOUT</Text>
              </View>
            </Pressable>
          )}
          
          {/* Developer Credit */}
          <View className="items-center pt-4 pb-8">
            <View className="flex-row items-center">
              <Ionicons name="code-slash-outline" size={14} color="#6B7280" />
              <Text className="text-gray-500 text-xs ml-1">
                Developed with ❤️ by Team Thermo
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;