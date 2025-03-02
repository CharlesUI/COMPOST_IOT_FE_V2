import { View, Text, TextInput, Pressable } from "react-native";
import React from "react";
import CustomButton from "./CustomButton";
import { RegisterDetails } from "@/app/(modal)/userLog";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";

interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPass: string;
  setRegisterDetails: React.Dispatch<React.SetStateAction<RegisterDetails>>;
}

const RegisterBox = ({
  email,
  username,
  password,
  confirmPass,
  setRegisterDetails,
}: RegisterData) => {
  const [togglePass, setTogglePass] = useState<boolean>(false);
  const [toggleConfirmPass, setToggleConfirmPass] = useState<boolean>(false);

  return (
    <View className="bg-slate-200 p-5 m-2 rounded-md">
      <View className="">
        <TextInput
          placeholder="username"
          value={username}
          onChangeText={(text) => {
            setRegisterDetails((prevData) => {
              return { ...prevData, username: text };
            });
          }}
          className=" border-[1.5px] mb-4 rounded-md p-3"
        />
        <TextInput
          placeholder="**********@email.com"
          value={email}
          onChangeText={(text) => {
            setRegisterDetails((prevData) => {
              return { ...prevData, email: text };
            });
          }}
          className=" border-[0.5px] mb-4 rounded-md p-3"
        />
        <View className="w-full relative">
          <TextInput
            secureTextEntry={!togglePass}
            placeholder="password"
            value={password}
            onChangeText={(text) => {
              setRegisterDetails((prevData) => {
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
        <View className="relative">
          <TextInput
            secureTextEntry={!toggleConfirmPass}
            placeholder="confirm password"
            value={confirmPass}
            onChangeText={(text) => {
              setRegisterDetails((prevData) => {
                return { ...prevData, confirmPass: text };
              });
            }}
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
        <CustomButton
          containerStyles="min-h-[50px] rounded-md bg-gray-800"
          textStyles="text-white"
          title="Register"
          onPress={() =>
            console.log({ email, username, password, confirmPass })
          }
        ></CustomButton>
      </View>
    </View>
  );
};

export default RegisterBox;
