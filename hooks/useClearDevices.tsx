import { useState } from 'react';
import { useUser } from '../context/UserContext'; // Adjust path if needed
import { API_URL_BASE } from '@/constants/API_URL';

const useClearDevices = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { updateUser, token, user } = useUser(); // Access user object to get userId  

  const clearDevices = async (userId: string | undefined) => {
    setLoading(true);
    setError(null);
    console.log("user before deleting", user?._id);
    const body = JSON.stringify({ userId: user?._id }); // Directly stringify the object
    console.log("body", body, "token", token);
    try {
        const response = await fetch(`${API_URL_BASE}/user/device`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json', // Make sure this is present
              'Authorization': `Bearer ${token}`,
            },
            body: body, // If you're sending a body
          });

      const data = await response.json();
      console.log("data after clear", data);
      

      if (response.ok) {
        // Assuming the server returns the updated user object (with empty devices array)
        updateUser(data.user);
        return true;
      } else {
        setError(data?.msg || 'Failed to clear devices. Please try again.');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred while clearing devices.');
      console.error('Clear devices error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { clearDevices, loading, error };
};

export default useClearDevices;