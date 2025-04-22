import React, { useState, useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { Platform, Dimensions, View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useUser } from "@/context/UserContext";
import { useAdmin } from "@/context/AdminContext";
import NetInfo from "@react-native-community/netinfo";

const TabsLayout = () => {
  const { user } = useUser();
  const { admin } = useAdmin();
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  
  // Network connectivity states
  const [isConnected, setIsConnected] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Check connection when component mounts
    checkConnection();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected === true);
    });

    return () => {
      // Unsubscribe when component unmounts
      unsubscribe();
    };
  }, []);

  // Function to manually check connection
  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected === true);
    setInitialCheckDone(true);
  };

  // No Connection Screen
  const NoConnectionScreen = () => (
    <View style={styles.centeredContainer}>
      <View style={styles.contentContainer}>
        <MaterialCommunityIcons name="wifi-off" size={100} color="#10B04B" />
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.message}>
          Please connect to WiFi or mobile data to continue using the app.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={checkConnection}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <MaterialCommunityIcons name="signal-off" size={24} color="#444" style={styles.smallIcon} />
        <MaterialCommunityIcons name="wifi-strength-off" size={24} color="#444" style={styles.smallIcon} />
        <MaterialCommunityIcons name="connection" size={24} color="#444" style={styles.smallIcon} />
      </View>
    </View>
  );

  // Loading Screen
  const LoadingScreen = () => (
    <View style={styles.centeredContainer}>
      <MaterialCommunityIcons name="loading" size={60} color="#10B04B" />
      <Text style={styles.loadingText}>Checking connection...</Text>
    </View>
  );

  // Calculate appropriate font size based on screen width
  const getTabLabelFontSize = () => {
    if (screenWidth <= 320) return 10; // Smaller devices
    if (screenWidth <= 375) return 11; // Medium devices
    return 12; // Larger devices
  };

  // Determine if user is logged in
  const isUserLoggedIn = user !== null && user !== undefined;

  // Determine if admin is logged in
  const isAdminLoggedIn = admin !== null && admin !== undefined;

  // Determine if no one is logged in
  const noOneLoggedIn = !isUserLoggedIn && !isAdminLoggedIn;

  // Show loading until we've checked connection status
  if (!initialCheckDone) {
    return <LoadingScreen />;
  }

  // If no connection, show the no connection screen
  if (!isConnected) {
    return <NoConnectionScreen />;
  }

  // If connected, render normal tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10B04B",
        tabBarInactiveTintColor: "lightgray",
        tabBarStyle: {
          backgroundColor: "#2F2C2C",
          minHeight: 60,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 20 : 6,
        },
        tabBarLabelStyle: {
          fontSize: getTabLabelFontSize(),
          marginBottom: 4,
          fontWeight: "500",
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarAllowFontScaling: false,
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
          // Make Home screen accessible if user is logged in or no one is logged in
          href: isUserLoggedIn || noOneLoggedIn ? undefined : null,
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
          // Only accessible if admin is logged in
          href: isAdminLoggedIn ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="Statistics"
        options={{
          title: "Statistics",
          tabBarLabel: "Stats",
          tabBarIcon: ({ color }) => {
            return <Entypo name="area-graph" size={24} color={color} />;
          },
          // Only accessible if admin is logged in
          href: isUserLoggedIn ? undefined : null,
        }}
      />

      {/* ManageUsers tab - available for admins */}
      <Tabs.Screen
        name="ManageUsers"
        options={{
          title: "ManageUsers",
          tabBarLabel: "Users",
          tabBarIcon: ({ color }) => {
            return <Feather name="users" size={24} color={color} />;
          },
          // Only accessible if admin is logged in
          href: isAdminLoggedIn ? undefined : null,
        }}
      />

      {/* ManageDevices tab - available for admins */}
      <Tabs.Screen
        name="ManageDevices"
        options={{
          title: "ManageDevices",
          tabBarLabel: "Devices",
          tabBarIcon: ({ color }) => {
            return (
              <MaterialCommunityIcons name="devices" size={24} color={color} />
            );
          },
          // Only accessible if admin is logged in
          href: isAdminLoggedIn ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="Manual"
        options={{
          title: "Manual",
          tabBarLabel: "Manual",
          tabBarIcon: ({ color }) => {
            return <Entypo name="open-book" size={24} color={color} />;
          },
          // Accessible to both users and admins (or no one logged in)
          href: undefined,
        }}
      />

      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => {
            return <Ionicons name="settings" size={24} color={color} />;
          },
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242424', // Dark background as requested
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 350,
    paddingVertical: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#AAAAAA',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#10B04B',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 10,
    shadowColor: '#10B04B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 18,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  smallIcon: {
    marginHorizontal: 15,
    opacity: 0.6,
  }
});

export default TabsLayout;