import { useState, useEffect } from 'react';
import { API_URL_BASE } from '@/constants/API_URL';
import { useUser } from '@/context/UserContext'; // Assuming you have user context for the token

interface DeviceType {
  _id: string;
  deviceNumber: string;
  realTimeData: any; // Adjust type as needed
  savedTimeFrameData: any[]; // Adjust type as needed
  __v: number;
}

const useManageDevices = () => {
  const [devices, setDevices] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingDevice, setAddingDevice] = useState(false);
  const [addingError, setAddingError] = useState<string | null>(null);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [deletingError, setDeletingError] = useState<string | null>(null);
  const { user, token } = useUser(); // To get the authentication token

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL_BASE}/admin/devices`, {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with your actual token retrieval
        },
      });
      if (!response.ok) {
        const message = `Error fetching devices: ${response.status}`;
        throw new Error(message);
      }
      const data = await response.json();
      setDevices(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const addDevice = async (deviceNumber: string) => {
    setAddingDevice(true);
    setAddingError(null);
    try {
      const response = await fetch(`${API_URL_BASE}/admin/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Replace with your actual token retrieval
        },
        body: JSON.stringify({ deviceNumber }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || `Error adding device: ${response.status}`);
      }
      fetchDevices(); // Refresh the device list after adding
      setAddingDevice(false);
    } catch (err: any) {
      setAddingError(err.message);
      setAddingDevice(false);
    }
  };

  const deleteDevice = async (deviceId: string) => {
    console.log("DEVICE ID TO DELETE", deviceId)
    setDeletingDeviceId(deviceId);
    setDeletingError(null);
    try {
      const response = await fetch(`${API_URL_BASE}/admin/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`, // Replace with your actual token retrieval
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || `Error deleting device: ${response.status}`);
      }
      fetchDevices(); // Refresh the device list after deleting
      setDeletingDeviceId(null);
    } catch (err: any) {
      setDeletingError(err.message);
      setDeletingDeviceId(null);
    }
  };

  return {
    devices,
    loading,
    error,
    addingDevice,
    addingError,
    addDevice,
    deletingDeviceId,
    deletingError,
    deleteDevice,
    refetchDevices: fetchDevices,
  };
};

export default useManageDevices;