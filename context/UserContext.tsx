import React, { createContext, useState, useContext } from 'react';
// types/user.ts or UserContext.js
export interface User {
    _id: string | undefined;
    username: string | undefined;
    email: string | undefined;
    devices: string[] | any; // Assuming devices is optional
    selectedDevice: string | null
    // Add other properties as needed
  }

interface UserContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  updateUser: (userData: User | null) => void;
  updateToken: (newToken: string | null) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const updateUser = (userData: User | null) => {
    setUser(userData);
    setIsLoggedIn(!!userData);
  };

  const updateToken = (newToken: string | null) => {
    setToken(newToken);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    // Optionally, clear any stored token from AsyncStorage here
  };

  return (
    <UserContext.Provider value={{ user, token, isLoggedIn, updateUser, updateToken, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};