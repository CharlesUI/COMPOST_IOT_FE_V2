import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  FlatList,
  PanResponder,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useUser } from "@/context/UserContext";
import { API_URL_BASE } from "@/constants/API_URL";
import useNotifications from "@/hooks/useNotifications";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications";
import { BlurView } from "expo-blur";

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
    deleteNotification,
  } = useNotifications();

  const toast = useToast();

  useEffect(() => {
    if (user?.devices) {
      updateUser({ ...user, selectedDevice: user.devices[0] });
    }
    loadNotifications();
  }, [user?.selectedDevice, user?._id]);

  const loadNotifications = () => {
    if (user?.selectedDevice) {
      fetchDeviceNotifications(user?.selectedDevice);
      fetchUserNotifications(user?._id);
    } else if (user?._id) {
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

  useEffect(() => {
    // Show toast notifications for new notifications
    if (allNotifications && previousNotificationIds) {
      const newNotifications = allNotifications.filter(notif => !previousNotificationIds.includes(notif._id));

      newNotifications.forEach((notif) => {
        let type = "default";
        if (notif.level === "good") {
          type = "success";
        } else if (notif.level === "warning") {
          type = "warning";
        } else if (notif.level === "danger") {
          type = "danger";
        } else if (notif.level === "info") {
          type = "info";
        }
        
        const message = notif.message.includes(": ") ? notif.message.split(": ")[1] : notif.message;
        
        toast.show(message, {
          type: type,
          placement: "bottom",
          duration: 3000,
          animationType: "slide-in",
        });
      });
    }
  }, [allNotifications, previousNotificationIds, toast]);

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

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {/* <Image 
        source={require('@/assets/images/empty-notifications.png')} 
        style={styles.emptyImage}
      /> */}
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        When you receive notifications, they'll appear here.
      </Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Recent</Text>
      {/* {allNotifications.length > 0 && (
        <Pressable style={styles.clearAllButton} onPress={() => console.log("Clear all")}>
          <Text style={styles.clearAllText}>Clear all</Text>
        </Pressable>
      )} */}
    </View>
  );

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

      {/* Notification List */}
      {loadingAll && allNotifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B04B" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
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
      )}
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
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 24,
    opacity: 0.8,
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
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 12,
    marginLeft: 16,
  },
  clearAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearAllText: {
    fontSize: 14,
    color: '#10B04B',
    fontWeight: '500',
  },
});

export default Notification;