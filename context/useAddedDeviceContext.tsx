import React, { createContext, useState, useContext } from 'react';
import { DeviceTextProp } from '../app/(tabs)';

const DeviceContext = createContext<{
  addedDevices: DeviceTextProp[] | null;
  setAddedDevices: React.Dispatch<React.SetStateAction<DeviceTextProp[] | null>>;
} | null>(null);

const AddedDeviceProvider = ({ children }: any) => {
  const [addedDevices, setAddedDevices] = useState<DeviceTextProp[] | null>(null);

  return (
    <DeviceContext.Provider value={{ addedDevices, setAddedDevices }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useAddedDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
};

export default AddedDeviceProvider;