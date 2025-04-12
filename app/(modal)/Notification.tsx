import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  FlatList,
  PanResponder,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useUser } from "@/context/UserContext";
import useNotifications from "@/hooks/useNotifications";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";


// Define the TypeScript interface for the Notification object
interface NotificationItemType {
  _id: string;
  deviceId?: string;
  userId?: string;
  level: "good" | "warning" | "danger" | "info";
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
  createdAt?: string;
  updatedAt?: string;
}

const Notification = () => {
  const { user, updateUser } = useUser();
  const [allNotifications, setAllNotifications] = useState<NotificationItemType[]>([]);
  const [previousNotificationIds, setPreviousNotificationIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const {
    fetchDeviceNotifications,
    fetchUserNotifications,
    deviceNotifications,
    userNotifications,
    loadingDevice,
    loadingUser,
    errorDevice,
    errorUser,
    deleteViaBody,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, [user?.selectedDevice, user?._id]);

  const loadNotifications = () => {
    console.log("User Device and ID", user?.selectedDevice, user?._id);
    if (user?.selectedDevice) {
      fetchDeviceNotifications(user?.selectedDevice);
      
      // Fetch user notifications only if user ID exists
      if (user?._id) {
        fetchUserNotifications(user?._id);
      }
    } else if (user?._id) {
      // If no selected device but user ID exists, only fetch user notifications
      fetchUserNotifications(user?._id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    // Combine device and user notifications and sort by timestamp
    const combined = [...(deviceNotifications || []), ...(userNotifications || [])];
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAllNotifications(combined);

    // Update previous notification IDs for toast logic
    setPreviousNotificationIds(combined.map(n => n._id));
  }, [deviceNotifications, userNotifications]);

  const handleClearAllNotifications = async () => {
    try {
      // Check if we have the required user ID
      if (!user?._id) {
        console.error("User ID is required to clear notifications");
        return;
      }

      // Get the device ID (if selected)
      const deviceId = user?.selectedDevice || "";

      // Confirm deletion with user
      Alert.alert(
        "Clear All Notifications",
        "Are you sure you want to delete all notifications?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Clear All",
            style: "destructive",
            onPress: async () => {
              // Call the deleteViaBody function
              console.log("Deleting all notifications for device:", deviceId, "and user:", user._id);
              const success = await deleteViaBody(deviceId, user._id!);

              if (success) {
                // Clear the notifications from state to provide immediate feedback
                setAllNotifications([]);

                // Optional: show success toast or feedback
                console.log("All notifications cleared successfully");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const handleRemoveNotification = async (id: string) => {
    await deleteNotification(id);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMillis = now.getTime() - notifTime.getTime();
    const diffInMinutes = Math.floor(diffInMillis / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  interface NotificationItemProps {
    item: NotificationItemType;
    onRemove: (id: string) => void;
  }

  const NotificationItem: React.FC<NotificationItemProps> = ({
    item,
    onRemove,
  }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 5;
        },
        onPanResponderGrant: () => {
          Animated.spring(scale, {
            toValue: 0.98,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
          
          if (gestureState.dx < -100) {
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: -500,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              })
            ]).start(() => onRemove(item._id));
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        },
      })
    ).current;

    let iconComponent;
    let gradientColors: readonly [string, string];
    let iconBgColor;
    
    switch (item.level) {
      case "good":
        iconComponent = (
          <MaterialCommunityIcons name="hand-okay" size={20} color="#FFFFFF" />
        );
        gradientColors = ["#0A3622", "#0A3622CC"] as const
        iconBgColor = "#10B04B";
        break;
      case "warning":
        iconComponent = <AntDesign name="warning" size={20} color="#FFFFFF" />;
        gradientColors = ["#47340A", "#47340ACC"]; 
        iconBgColor = "#FFB020";
        break;
      case "danger":
        iconComponent = (
          <MaterialIcons name="dangerous" size={20} color="#FFFFFF" />
        );
        gradientColors = ["#441616", "#441616CC"];
        iconBgColor = "#F44336";
        break;
      case "info":
      default:
        iconComponent = (
          <MaterialIcons name="info-outline" size={20} color="#FFFFFF" />
        );
        gradientColors = ["#142D4C", "#142D4CCC"];
        iconBgColor = "#2196F3";
        break;
    }

    const deviceName = item.deviceId || "System";
    const timeAgo = getTimeAgo(item.timestamp);
    const message = item.level === "info" ? item.message : 
      item.message.includes(": ") ? item.message.split(": ")[1] : item.message;

    return (
      <Animated.View
        style={[
          styles.notificationContainer,
          { 
            transform: [{ translateX }, { scale }],
            opacity 
          }
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.notificationGradient}
        >
          <View style={styles.notificationContent}>
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
              {iconComponent}
            </View>
            
            <View style={styles.textContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.deviceName}>{deviceName}</Text>
                <Text style={styles.timeAgo}>{timeAgo}</Text>
              </View>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.swipeHint}>
          <Text style={styles.swipeText}>Swipe left to dismiss</Text>
        </View>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: NotificationItemType }) => (
    <NotificationItem item={item} onRemove={handleRemoveNotification} />
  );

  const loadingAll = loadingDevice || loadingUser;
  const errorAll = errorDevice || errorUser;

  // Custom empty component for when no device is selected
  const NoDeviceSelectedComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="devices" size={80} color="#666666" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No device selected</Text>
      <Text style={styles.emptySubtitle}>
        Please select a device first to view its notifications.
      </Text>
      <Pressable 
        style={styles.selectDeviceButton}
        onPress={() => router.push("/")} // Adjust this route to wherever your device selection is
      >
        <Text style={styles.selectDeviceText}>Select a Device</Text>
      </Pressable>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        When you receive notifications, they'll appear here.
      </Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>Recent</Text>
      {allNotifications.length > 0 && (
        <Pressable 
          style={styles.clearAllButton}
          onPress={handleClearAllNotifications}
        >
          <Text style={styles.clearAllText}>Clear All</Text>
        </Pressable>
      )}
    </View>
  );

  // Determine what to render in the main content area
  const renderContent = () => {
    // If no device is selected (and we're not just showing user notifications)
    if (!user?.selectedDevice) {
      return <NoDeviceSelectedComponent />;
    }
    
    // If loading and no notifications to show yet
    if (loadingAll && allNotifications.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B04B" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      );
    }
    
    // Otherwise show the notification list
    return (
      <FlatList
        data={allNotifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={allNotifications.length > 0 ? ListHeaderComponent : null}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2F2C2C', '#242121']}
        style={styles.header}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerText}>Notifications</Text>
        <Pressable style={styles.settingsButton}>
          <Feather name="settings" size={22} color="white" />
        </Pressable>
      </LinearGradient>

      {/* Main Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242121',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 120,
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#AAAAAA',
  },
  notificationContainer: {
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationGradient: {
    borderRadius: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  timeAgo: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  message: {
    fontSize: 14,
    color: '#DDDDDD',
    lineHeight: 20,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 6,
    right: 12,
  },
  swipeText: {
    fontSize: 10,
    color: '#999999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 0, // Changed from 12 to 0 since we're using headerRow
  },
  clearAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(16, 176, 75, 0.1)',
    borderRadius: 8,
  },
  clearAllText: {
    fontSize: 14,
    color: '#10B04B',
    fontWeight: '500',
  },
  selectDeviceButton: {
    backgroundColor: '#10B04B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  selectDeviceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default Notification;