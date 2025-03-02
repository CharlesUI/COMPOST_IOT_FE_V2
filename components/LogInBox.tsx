import { View, Text, TextInput, Pressable } from "react-native";
import React from "react";
import { useState } from "react";
import CustomButton from "./CustomButton";

import { LogInDetails } from "@/app/(modal)/userLog";
import Feather from "@expo/vector-icons/Feather";

interface LogData {
  email: string;
  password: string;
  setLogInDetails: React.Dispatch<React.SetStateAction<LogInDetails>>;
}

const LogInBox = ({ email, password, setLogInDetails }: LogData) => {
  const [togglePass, setTogglePass] = useState<boolean>(false);

  return (
    <View className=" bg-slate-200 p-5 m-2 rounded-md">
      <View className="">
        <TextInput
          placeholder="**********@email.com"
          value={email}
          onChangeText={(text) => {
            setLogInDetails((prevData) => {
              return { ...prevData, email: text };
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
        <CustomButton
          containerStyles="min-h-[50px] rounded-md bg-gray-800"
          textStyles="text-white"
          title="Log In"
          onPress={() => console.log({ email, password })}
        ></CustomButton>
      </View>
    </View>
  );
};

export default LogInBox;
