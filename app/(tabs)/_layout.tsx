import React from "react";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from "@/context/UserContext";


const TabsLayout = () => {
  const { user } = useUser();

  const disabler = {
    href: null
  }

  const userLoggedIn = user ? false : true;

  const userTab = userLoggedIn && disabler;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10B04B",
        tabBarInactiveTintColor: "lightgray", // Define the inactive tint color
        tabBarStyle: {
          backgroundColor: "#2F2C2C", // Replace "lightblue" with your desired color
          minHeight: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => {
            return <Entypo name="home" size={24} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="Device"
        options={{
          // href: null, // disable the tab
          ...
          userTab,
          title: "Device",
          tabBarLabel: "Device",
          tabBarIcon: ({ color }) => {
            return (
              <MaterialCommunityIcons
                name="flower-tulip"
                size={24}
                color={color}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="Manual"
        options={{
          title: "Manual",
          tabBarLabel: "Manual",
          tabBarIcon: ({ color }) => {
            return (
              <MaterialCommunityIcons
                name="flower-tulip"
                size={24}
                color={color}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => {
            return <Ionicons name="settings" size={24} color={color} />
          },
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
