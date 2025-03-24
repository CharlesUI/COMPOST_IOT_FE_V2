// hooks/useNotifications.ts (TypeScript)
import { useState, useEffect } from "react";
import { API_URL_BASE } from "@/constants/API_URL";
import { useUser } from "@/context/UserContext"; // Import useUser to access user ID

interface NotificationItemType {
  _id: string;
  deviceId?: string; // Make optional to accommodate user notifications
  userId?: string; // Make optional
  level: "good" | "warning" | "danger" | "info"; // Include 'info'
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
  createdAt?: string;
  updatedAt?: string;
}

const useNotifications = () => {
  const [deviceNotifications, setDeviceNotifications] = useState<
    NotificationItemType[] | []
  >([]);
  const [userNotifications, setUserNotifications] = useState<
    NotificationItemType[] | []
  >([]);
  const [loadingDevice, setLoadingDevice] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorDevice, setErrorDevice] = useState<string | null>(null);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  const fetchDeviceNotifications = async (deviceNumber: string | null) => {
    setLoadingDevice(true);
    setErrorDevice(null);

    if (!deviceNumber) {
      setDeviceNotifications([]);
      setLoadingDevice(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL_BASE}/notification/${deviceNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include your authentication token here if required
          },
        }
      );

      if (!response.ok) {
        const message = `An error occurred: ${response.status}`;
        throw new Error(message);
      }

      const data: NotificationItemType[] = await response.json();
      setDeviceNotifications(data);
      setLoadingDevice(false);
    } catch (err: any) {
      setErrorDevice(err.message);
      setLoadingDevice(false);
      console.error("Error fetching device notifications in hook:", err);
    }
  };

  const fetchUserNotifications = async (userId: string | undefined) => {
    setLoadingUser(true);
    setErrorUser(null);

    if (!userId) {
      setUserNotifications([]);
      setLoadingUser(false);
      return;
    }

    console.log('FETCHING USER NOTIF', userId);
    

    try {
      const response = await fetch(
        `${API_URL_BASE}/notification/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include your authentication token here if required
          },
        }
      );

      if (!response.ok) {
        const message = `An error occurred: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      if (response.ok) {
        setUserNotifications(data);
      } else {
        setErrorUser("Failed to fetch user notifications");
      }

      console.log("data from fetch user", data)
      setLoadingUser(false);
    } catch (err: any) {
      setErrorUser(err.message);
      setLoadingUser(false);
      console.error("Error fetching user notifications in hook:", err);
    }
  };

  const deleteNotification = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL_BASE}/notification/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Authentication headers
        },
      });

      if (response.ok) {
        // Update both device and user notifications state
        setDeviceNotifications((prev: any) =>
          prev.filter((notification: any) => notification._id !== userId)
        );
        setUserNotifications((prev: any) =>
          prev.filter((notification: any) => notification._id !== userId)
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  };

  return {
    fetchDeviceNotifications,
    fetchUserNotifications,
    deviceNotifications,
    userNotifications,
    loadingDevice,
    loadingUser,
    errorDevice,
    errorUser,
    deleteNotification,
  };
};

export default useNotifications;
