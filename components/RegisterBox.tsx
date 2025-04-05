import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RegisterDetails } from "@/app/(modal)/userLog";

interface RegisterData {
  email: string;
  username: string;
  title: string;
  password: string;
  confirmPass: string;
  setRegisterDetails: React.Dispatch<React.SetStateAction<RegisterDetails>>;
  handleRegisterUser: () => void;
  loading: boolean;
  error: string | null;
}

const RegisterBox = ({
  email,
  username,
  title,
  password,
  confirmPass,
  setRegisterDetails,
  handleRegisterUser,
  loading,
  error,
}: RegisterData) => {
  const [togglePass, setTogglePass] = useState<boolean>(false);
  const [toggleConfirmPass, setToggleConfirmPass] = useState<boolean>(false);

  useEffect(() => {
    if (error) {
      console.log("Login hook error:", error);
      Alert.alert(
        "Registration Error",
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
      <Text className="text-white text-xl font-bold mb-4 text-center">Register</Text>
      <View className="mb-3">
        <Text className="text-gray-400 mb-1">Username</Text>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#777"
          value={username}
          onChangeText={(text) => setRegisterDetails((prev) => ({ ...prev, username: text }))}
          className="bg-[#2A2A2A] text-white rounded-lg py-3 px-4 border border-[#4A4A4A]"
        />
      </View>
      <View className="mb-3">
        <Text className="text-gray-400 mb-1">Email</Text>
        <TextInput
          placeholder="**********@email.com"
          placeholderTextColor="#777"
          value={email}
          onChangeText={(text) => setRegisterDetails((prev) => ({ ...prev, email: text }))}
          className="bg-[#2A2A2A] text-white rounded-lg py-3 px-4 border border-[#4A4A4A]"
        />
      </View>
      <View className="mb-3">
        <Text className="text-gray-400 mb-1">Role</Text>
        <TextInput
          placeholder="role"
          placeholderTextColor="#777"
          value={"Device Manager"}
          onChangeText={(text) => setRegisterDetails((prev) => ({ ...prev, title: "Device Manager" }))}
          className="bg-[#2A2A2A] text-white rounded-lg py-3 px-4 border border-[#4A4A4A]"
        />
      </View>
      <View className="mb-3">
        <Text className="text-gray-400 mb-1">Password</Text>
        <View className="relative w-full">
          <TextInput
            secureTextEntry={!togglePass}
            placeholder="Password"
            placeholderTextColor="#777"
            value={password}
            onChangeText={(text) => setRegisterDetails((prev) => ({ ...prev, password: text }))}
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
      <View className="mb-4">
        <Text className="text-gray-400 mb-1">Confirm Password</Text>
        <View className="relative w-full">
          <TextInput
            secureTextEntry={!toggleConfirmPass}
            placeholder="Confirm Password"
            placeholderTextColor="#777"
            value={confirmPass}
            onChangeText={(text) => setRegisterDetails((prev) => ({ ...prev, confirmPass: text }))}
            className="bg-[#2A2A2A] text-white rounded-lg py-3 px-4 border border-[#4A4A4A]"
          />
          <TouchableOpacity
            onPress={() => setToggleConfirmPass(!toggleConfirmPass)}
            className="absolute right-3 top-3"
          >
            <Ionicons name={!toggleConfirmPass ? "eye-off-outline" : "eye-outline"} size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleRegisterUser}
        className={`bg-indigo-500 py-3 rounded-lg items-center justify-center ${loading ? 'opacity-70' : ''}`}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Register</Text>
        )}
      </TouchableOpacity>
      {error && <Text className="text-red-500 mt-3 text-center">{error}</Text>}
    </View>
  );
};

export default RegisterBox;