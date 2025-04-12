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

    console.log("FETCHING USER NOTIF", userId);

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

      console.log("data from fetch user", data.length);
      setLoadingUser(false);
    } catch (err: any) {
      setErrorUser(err.message);
      setLoadingUser(false);
      console.error("Error fetching user notifications in hook:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    // Renamed parameter for clarity
    try {
      const response = await fetch(`${API_URL_BASE}/notification/${id}`, {
        // Use the passed id
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Authentication headers
        },
      });

      if (response.ok) {
        // Update both device and user notifications state
        // --- THIS IS THE CORRECT APPROACH ---
        setDeviceNotifications(
          (prev) => prev.filter((notification) => notification._id !== id) // Use the correct id variable
        );
        setUserNotifications(
          (prev) => prev.filter((notification) => notification._id !== id) // Use the correct id variable
        );
        // ------------------------------------
        return true;
      }
      // Consider throwing an error or returning more specific info on failure
      console.error(
        "Failed to delete notification on server:",
        response.status
      );
      return false;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  };

  const deleteViaBody = async (deviceNumber: string, userId: string) => {
    // Renamed parameter for clarity
    try {
      const response = await fetch(
        `${API_URL_BASE}/notification/deleteAll/${deviceNumber}/${userId}`,
        {
          // Use the passed id
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Authentication headers
          },
          // body: JSON.stringify({
          //   deviceNumber: deviceNumber,
          //   userId: userId,
          // }),
        }
      );

      console.log("DELETE ALL SELECTED DEVICE NOTIF", deviceNumber);
      console.log("DELETE ALL SELECTED DEVICE NOTIF", userId);

      if (response.ok) {
        // Clear the notifications from state
        // setDeviceNotifications([]);
        // setUserNotifications([]);
        return true;
      }
      // Consider throwing an error or returning more specific info on failure
      console.error(
        "Failed to delete notification on server:",
        response.status
      );
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
    deleteViaBody,
  };
};

export default useNotifications;
