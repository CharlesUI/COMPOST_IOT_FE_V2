import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import CustomButton from "./CustomButton";
import { RegisterDetails } from "@/app/(modal)/userLog";

interface RegisterData {
  email: string;
  username: string;
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
      // Optionally, you might want to reset the error state in the useLogin hook after showing the alert
      // This would require passing the setError function from useLogin to UserLog
    }
  }, [error]);

  return (
    <View className="w-[90%] bg-slate-200 p-4 m-2 rounded-md">
      <View className="">
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={(text) =>
            setRegisterDetails((prev) => ({ ...prev, username: text }))
          }
          className=" border-[0.5px] mb-4 rounded-md p-3"
        />
        <TextInput
          placeholder="**********@email.com"
          value={email}
          onChangeText={(text) =>
            setRegisterDetails((prev) => ({ ...prev, email: text }))
          }
          className=" border-[0.5px] mb-4 rounded-md p-3"
        />
        <View className="relative w-full">
          <TextInput
            secureTextEntry={!togglePass}
            placeholder="Password"
            value={password}
            onChangeText={(text) =>
              setRegisterDetails((prev) => ({ ...prev, password: text }))
            }
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
        <View className="relative w-full">
          <TextInput
            secureTextEntry={!toggleConfirmPass}
            placeholder="Confirm Password"
            value={confirmPass}
            onChangeText={(text) =>
              setRegisterDetails((prev) => ({ ...prev, confirmPass: text }))
            }
            className=" border-[0.5px] mb-4 rounded-md p-3"
          />
          <View className="absolute right-3 top-3">
            <Pressable onPress={() => setToggleConfirmPass(!toggleConfirmPass)}>
              <Feather
                name={!toggleConfirmPass ? "eye-off" : "eye"}
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
          title={loading ? "Registering..." : "Register"}
          onPress={handleRegisterUser}
          disabled={loading}
        ></CustomButton>
      </View>
    </View>
  );
};

export default RegisterBox;