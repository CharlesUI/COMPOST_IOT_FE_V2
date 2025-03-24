import React, { createContext, useState, useContext } from 'react';
// types/admin.ts or AdminContext.js
export interface Admin {
    _id: string | undefined;
    username: string | undefined;
    email: string | undefined;
    title: string | undefined,
    managedUsers: any[] | []; // Assuming devices is optional
    managedDevices: any[] | []
    selectedDevice: string | null
    // Add other properties as needed
  }

interface AdminContextType {
  admin: Admin | null;
  token: string | null;
  isLoggedIn: boolean;
  updateAdmin: (adminData: Admin | null) => void;
  updateToken: (newToken: string | null) => void;
  logoutAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const updateAdmin = (adminData: Admin | null) => {
    setAdmin(adminData);
    setIsLoggedIn(!!adminData);
  };

  const updateToken = (newToken: string | null) => {
    setToken(newToken);
  };

  const logoutAdmin = () => {
    setAdmin(null);
    setToken(null);
    setIsLoggedIn(false);
    // Optionally, clear any stored token from AsyncStorage here
  };

  return (
    <AdminContext.Provider value={{ admin, token, isLoggedIn, updateAdmin, updateToken, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within a AdminProvider");
  }
  return context;
};