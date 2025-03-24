import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from "@/context/UserContext";
import { useAdmin } from "@/context/AdminContext";

const TabsLayout = () => {
  const { user } = useUser();
  const { admin } = useAdmin();

  // Determine if user is logged in
  const isUserLoggedIn = user !== null && user !== undefined;
  
  // Determine if admin is logged in
  const isAdminLoggedIn = admin !== null && admin !== undefined;
  
  // Determine if no one is logged in
  const noOneLoggedIn = !isUserLoggedIn && !isAdminLoggedIn;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10B04B",
        tabBarInactiveTintColor: "lightgray",
        tabBarStyle: {
          backgroundColor: "#2F2C2C",
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
          href: (isAdminLoggedIn) ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="AdminDashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => {
            return <Entypo name="home" size={24} color={color} />;
          },
          href: (isUserLoggedIn || noOneLoggedIn) ? null : undefined,
        }}
      />
      
      {/* Device tab - available for users, disabled for admins and when no one is logged in */}
      <Tabs.Screen
        name="Device"
        options={{
          title: "Device",
          tabBarLabel: "Statistics",
          tabBarIcon: ({ color }) => {
            return (
              <MaterialCommunityIcons
                name="flower-tulip"
                size={24}
                color={color}
              />
            );
          },
          href: (isAdminLoggedIn || noOneLoggedIn) ? null : undefined,
        }}
      />

      {/* Manual tab - available for users, disabled for admins and when no one is logged in */}
      <Tabs.Screen
        name="Manual"
        options={{
          title: "Manual",
          tabBarLabel: "User Manual",
          tabBarIcon: ({ color }) => {
            return (
              <MaterialCommunityIcons
                name="flower-tulip"
                size={24}
                color={color}
              />
            );
          },
          href: (isAdminLoggedIn || noOneLoggedIn) ? null : undefined,
        }}
      />

      {/* ManageUsers tab - available for admins, disabled for users and when no one is logged in */}
      <Tabs.Screen
        name="ManageUsers"
        options={{
          title: "ManageUsers",
          tabBarLabel: "Users",
          tabBarIcon: ({ color }) => {
            return (
              <MaterialCommunityIcons
                name="flower-tulip"
                size={24}
                color={color}
              />
            );
          },
          href: (isUserLoggedIn || noOneLoggedIn) ? null : undefined,
        }}
      />

      {/* ManageDevices tab - available for admins, disabled for users and when no one is logged in */}
      <Tabs.Screen
        name="ManageDevices"
        options={{
          title: "ManageDevices",
          tabBarLabel: "Devices",
          tabBarIcon: ({ color }) => {
            return (
              <MaterialCommunityIcons
                name="flower-tulip"
                size={24}
                color={color}
              />
            );
          },
          href: (isUserLoggedIn || noOneLoggedIn) ? null : undefined,
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