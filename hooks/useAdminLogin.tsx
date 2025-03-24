import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { API_URL_BASE } from "@/constants/API_URL";

const useAdminLogin = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { updateAdmin, updateToken } = useAdmin();

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    console.log("Login attempt with:", username, password);

    try {
      const response = await fetch(`${API_URL_BASE}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        updateToken(data.token);
        console.log("Response ok", data.admin)
        updateAdmin({
          _id: data.admin._id,
          username: data.admin.username,
          title: data.admin.title,
          email: data.admin.email,
          managedDevices: data.admin.managedDevices,
          managedUsers: data.admin.managedUsers,
          selectedDevice: data.admin.selectedDevice || null // Add selectedDevice with a fallback
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

export default useAdminLogin;
