import React from "react";
import { Tabs, useRouter } from "expo-router"; // Import useRouter
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from "@/context/UserContext";
import { useAdmin } from "@/context/AdminContext";
import Feather from '@expo/vector-icons/Feather';

const TabsLayout = () => {
    const { user } = useUser();
    const { admin } = useAdmin();
    const router = useRouter(); // Use the useRouter hook

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
                    // Make Home screen accessible if user is logged in or no one is logged in
                    href: (isUserLoggedIn || noOneLoggedIn) ? undefined : null,
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
                    tabBarLabel: "Statistics",
                    tabBarIcon: ({ color }) => {
                        return (
                            <Entypo name="area-graph" size={24} color={color} />
                        );
                    },
                    // Only accessible if admin is logged in
                    href: isUserLoggedIn ? undefined : null,
                }}
            />

            <Tabs.Screen
                name="Manual"
                options={{
                    title: "Manual",
                    tabBarLabel: "User Manual",
                    tabBarIcon: ({ color }) => {
                        return (
                            <Entypo name="open-book" size={24} color={color} />
                        );
                    },
                    // Accessible to both users and admins (or no one logged in)
                    href: undefined,
                }}
            />

            {/* ManageUsers tab - available for admins */}
            <Tabs.Screen
                name="ManageUsers"
                options={{
                    title: "ManageUsers",
                    tabBarLabel: "Users",
                    tabBarIcon: ({ color }) => {
                        return (
                            <Feather name="users" size={24} color={color} />
                        );
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