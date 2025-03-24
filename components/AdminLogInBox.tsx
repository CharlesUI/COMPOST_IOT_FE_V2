import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import CustomButton from "./CustomButton";
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
              // Optionally, you can reset the error state here if you want
              // (though the useLogin hook currently clears it on the next attempt)
              // setError(null); // This would require passing the setError function down
            },
          },
        ]
      );

    }
  }, [error]);

  return (
    <View className="w-[90%] bg-slate-200 p-5 m-2 rounded-md">
      <View className="">
        <TextInput
          placeholder="admin"
          value={username}
          onChangeText={(text) => {
            setLogInDetails((prevData) => {
              return { ...prevData, username: text };
            });
          }}
          className=" border-[0.5px] mb-4 rounded-md p-3"
        />
        <View className="relative w-full">
          <TextInput
            secureTextEntry={!togglePass}
            placeholder="password"
            value={password}
            onChangeText={(text) => {
              setLogInDetails((prevData) => {
                return { ...prevData, password: text };
              });
            }}
            className=" border-[0.5px] mb-4 rounded-md p-3"
          />
          <View className="absolute right-3 top-3">
            <Pressable onPress={() => setTogglePass(!togglePass)}>
              <Feather
                name={!togglePass ? "eye-off" : "eye"}
                size={24}
                color="black"
              />
            </Pressable>
          </View>
        </View>
        {/* {error && (
          <Text className="text-red-500 mb-2">{error}</Text>
        )} */}
        <CustomButton
          containerStyles="min-h-[50px] rounded-md bg-gray-800"
          textStyles="text-white"
          title={loading ? "Logging In..." : "Log In"}
          onPress={handleLogInUser}
          disabled={loading}
        ></CustomButton>
      </View>
    </View>
  );
};

export default AdminLogInBox;