import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for consistency
import { AdminLogInDetails } from "@/app/(modal)/adminLog";

interface LogData {
  username: string;
  password: string;
  setLogInDetails: React.Dispatch<React.SetStateAction<AdminLogInDetails>>;
  handleLogInUser: () => void;
  loading: boolean;
  error: string | null;
}

const AdminLogInBox = ({
  username,
  password,
  setLogInDetails,
  handleLogInUser,
  loading,
  error,
}: LogData) => {
  const [togglePass, setTogglePass] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      console.log("Login hook error:", error);
      Alert.alert(
        "Login Error", // Title of the alert
        error, // Message to display
        [
          {
            text: "OK",
            onPress: () => {
              // Optionally, you can reset the error state here if needed
              // (though the useLogin hook currently clears it on the next attempt)
              // setError(null); // This would require passing the setError function down
            },
          },
        ]
      );
    }
  }, [error]);

  return (
    <View className="w-[90%] bg-[#3A3A3A] p-6 rounded-xl shadow-md border border-[#4A4A4A]">
      <Text className="text-white text-xl font-bold mb-4 text-center">Admin Login</Text>
      <View className="mb-3">
        <Text className="text-gray-400 mb-1">Username</Text>
        <TextInput
          placeholder="admin"
          placeholderTextColor="#777"
          value={username}
          onChangeText={(text) => {
            setLogInDetails((prevData) => {
              return { ...prevData, username: text };
            });
          }}
          className="bg-[#2A2A2A] text-white rounded-lg py-3 px-4 border border-[#4A4A4A]"
        />
      </View>
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Password</Text>
        <View className="relative w-full">
          <TextInput
            secureTextEntry={!togglePass}
            placeholder="password"
            placeholderTextColor="#777"
            value={password}
            onChangeText={(text) => {
              setLogInDetails((prevData) => {
                return { ...prevData, password: text };
              });
            }}
            className="bg-[#2A2A2A] text-white rounded-lg py-3 px-4 border border-[#4A4A4A]"
          />
          <TouchableOpacity
            onPress={() => setTogglePass(!togglePass)}
            className="absolute right-3 top-3"
          >
            <Ionicons name={!togglePass ? "eye-off-outline" : "eye-outline"} size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleLogInUser}
        className={`bg-indigo-500 py-3 rounded-lg items-center justify-center ${loading ? 'opacity-70' : ''}`}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Log In</Text>
        )}
      </TouchableOpacity>
      {error && <Text className="text-red-500 mt-3 text-center">{error}</Text>}
    </View>
  );
};

export default AdminLogInBox;