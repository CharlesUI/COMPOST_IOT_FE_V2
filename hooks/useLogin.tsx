import { useState } from "react";
import { useUser } from "../context/UserContext"; // Adjust the path if needed
import { API_URL_BASE } from "@/constants/API_URL";

const useLogin = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser, updateToken } = useUser();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    console.log("Login attempt with:", email, password);

    try {
      const response = await fetch(`${API_URL_BASE}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        updateToken(data.token);
        updateUser({
          _id: data._id,
          username: data.username,
          email: data.email,
          devices: data.devices,
        });
        return true; // Indicate successful login
      } else {
        setError(data?.message || "Login failed. Please try again."); // Use server message or fallback
        return false;
      }
    } catch (err: string | any) {
      setError(
        err.message || "An unexpected error occurred during registration."
      );
      console.error("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
