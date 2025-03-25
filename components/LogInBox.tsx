import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LogInDetails } from "@/app/(modal)/userLog";

interface LogData {
  email: string;
  password: string;
  setLogInDetails: React.Dispatch<React.SetStateAction<LogInDetails>>;
  handleLogInUser: () => void;
  loading: boolean;
  error: string | null;
}

const LogInBox = ({
  email,
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
        "Login Error",
        error,
        [
          {
            text: "OK",
            onPress: () => {},
          },
        ]
      );
    }
  }, [error]);

  return (
    <View className="w-[90%] bg-[#3A3A3A] p-6 rounded-xl shadow-md border border-[#4A4A4A]">
      <Text className="text-white text-xl font-bold mb-4 text-center">Log In</Text>
      <View className="mb-3">
        <Text className="text-gray-400 mb-1">Email</Text>
        <TextInput
          placeholder="**********@email.com"
          placeholderTextColor="#777"
          value={email}
          onChangeText={(text) => setLogInDetails((prevData) => ({ ...prevData, email: text }))}
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
            onChangeText={(text) => setLogInDetails((prevData) => ({ ...prevData, password: text }))}
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

export default LogInBox;