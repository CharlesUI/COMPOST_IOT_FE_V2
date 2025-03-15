import { useState } from 'react';
import { useUser } from '../context/UserContext'; // Adjust the path if needed
import { API_URL_BASE } from '@/constants/API_URL';


const useRegister = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false); // New state for registration success
  const { updateUser, updateToken } = useUser();

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false); // Reset success state on new attempt

    try {
      const response = await fetch(`${API_URL_BASE}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        updateToken(data.token);
        updateUser({
          _id: data._id,
          username: data.username,
          email: data.email,
        });
        setSuccess(true); // Set success to true
        return true; // Indicate successful registration
      } else {
        setError(data?.message || 'Registration failed. Please try again.'); // Use server message or fallback
        setSuccess(false);
        return false;
      }
    } catch (err: string | any) {
      setError(err.message || 'An unexpected error occurred during registration.');
      console.error('Registration error:', err);
      setSuccess(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, success }; // Return the success state
};

export default useRegister;