import { useState } from 'react';
import { useUser } from '../context/UserContext'; // Adjust path if needed
import { API_URL_BASE } from '@/constants/API_URL';


const useAddDevice = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser, token } = useUser();

  const addDevice = async (deviceNumber: any, userId: string | undefined) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL_BASE}/user/device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Assuming you're using Bearer token
        },
        body: JSON.stringify({ userId, deviceNumber }),
      });

      const data = await response.json();
      console.log("Data for adding device:", data);
      

      if (response.ok) {
        // Assuming the server returns the updated user object
        updateUser(data.user);
        return true;
      } else {
        setError(data?.msg || 'Failed to add device. Please try again.');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred while adding the device.');
      console.error('Add device error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addDevice, loading, error };
};

export default useAddDevice;