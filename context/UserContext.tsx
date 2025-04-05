// UserContext.tsx
import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// User Context
export interface User {
  _id: string | undefined;
  username: string | undefined;
  email: string | undefined;
  title: string | undefined;
  devices?: string[] | any;
  selectedDevice?: string | null;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  updateUser: (userData: User | null) => void;
  updateToken: (newToken: string | null) => Promise<void>;
  logoutUser: () => Promise<void>;
  abortController: AbortController;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const abortControllerRef = useRef(new AbortController());

  // Load token from AsyncStorage on initial render
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userData'),
        ]);
        
        if (storedToken) {
          setToken(storedToken);
          setIsLoggedIn(true);
        }
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadStoredData();

    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const updateUser = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem('userData');
      }
      setUser(userData);
      setIsLoggedIn(!!userData);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const updateToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem('userToken', newToken);
      } else {
        await AsyncStorage.removeItem('userToken');
      }
      setToken(newToken);
      setIsLoggedIn(!!newToken);
    } catch (error) {
      console.error('Error updating user token:', error);
    }
  };

  const logoutUser = async () => {
    try {
      // Cancel all ongoing requests
      abortControllerRef.current.abort();
      
      // Create new controller for future requests
      abortControllerRef.current = new AbortController();
      
      // Clear all stored data
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      
      // Reset state
      setUser(null);
      setToken(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{ 
        user, 
        token, 
        isLoggedIn, 
        updateUser, 
        updateToken, 
        logoutUser,
        abortController: abortControllerRef.current
      }}
    >
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