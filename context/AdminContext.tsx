import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
// types/admin.ts or AdminContext.js
export interface Admin {
  _id: string | undefined;
  username: string | undefined;
  email: string | undefined;
  title: string | undefined;
  managedUsers: any[] | [];
  managedDevices: any[] | [];
  selectedDevice: string | null;
}

interface AdminContextType {
  admin: Admin | null;
  token: string | null;
  isLoggedIn: boolean;
  updateAdmin: (adminData: Admin | null) => void;
  updateToken: (newToken: string | null) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  abortController: AbortController;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const abortControllerRef = useRef(new AbortController());

  // Load token from AsyncStorage on initial render
  useEffect(() => {
    const loadStoredToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('adminToken');
        if (storedToken) {
          setToken(storedToken);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error loading admin token:', error);
      }
    };

    loadStoredToken();

    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const updateAdmin = (adminData: Admin | null) => {
    setAdmin(adminData);
    setIsLoggedIn(!!adminData);
  };

  const updateToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem('adminToken', newToken);
      } else {
        await AsyncStorage.removeItem('adminToken');
      }
      setToken(newToken);
    } catch (error) {
      console.error('Error updating admin token:', error);
    }
  };

  const logoutAdmin = async () => {
    try {
      // Cancel all ongoing requests
      abortControllerRef.current.abort();

      // Create new controller for future requests
      abortControllerRef.current = new AbortController();

      // Clear all stored data
      await AsyncStorage.removeItem('adminToken');
      setAdmin(null);
      setToken(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out admin:', error);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        isLoggedIn,
        updateAdmin,
        updateToken,
        logoutAdmin,
        abortController: abortControllerRef.current,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};