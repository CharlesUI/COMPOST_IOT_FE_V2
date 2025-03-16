import { View, Text } from "react-native";
import CustomButton from "./CustomButton";
import { Image } from "react-native";
import React from "react";
import { useUser } from "@/context/UserContext";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";

interface HeaderProps {
  headerText: string;
  title: string;
}

const COMPOST_IMAGE = require("@/assets/images/COMPOST_IOT.png");

const goToUserLog = () => {
  router.push("/userLog");
};

const goToUserNotification = () => {
  router.push("/Notification");
};

const HeaderSection = ({ headerText, title }: HeaderProps) => {
  const { user, logoutUser } = useUser();

  return (
    <View className="flex max-h-[80px] flex-row justify-between items-center p-5 pl-2 bg-[#2F2C2C] border-b-[0.5px] border-[#d0cccc]">
      <View className="flex-row items-center">
        {/* <MaterialIcons name="compost" size={40} color="#efefef" /> */}
        <View className="w-[45px] h-[45px] justify-center ">
          <Image
            className="w-full h-full"
            resizeMode="contain"
            source={COMPOST_IMAGE}
          />
        </View>
        <Text className="text-[14px] font-extrabold color-[white] p-2">
          {headerText}
        </Text>
      </View>

      <View className="flex-1 flex-row items-center gap-2 justify-end">
        {user && (
          <TouchableOpacity
            onPress={goToUserNotification}
            className="flex-row items-center justify-center p-2"
          >
            <MaterialIcons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        )}
        <CustomButton
          title={user?.username ? user.username : "LOGIN"}
          onPress={
            !user ? goToUserLog : () => console.log("Punta profile page")
          }
          containerStyles="min-w-[65px] min-h-[40px] border-[0.5px] border-[#d0cccc]"
          textStyles="text-[10px] font-semibold color-[white] p-2"
        ></CustomButton>
      </View>
    </View>
  );
};

export default HeaderSection;
