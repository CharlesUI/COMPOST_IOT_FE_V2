import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface CustomButtonProps {
  onPress: (title?: string | undefined) => void;
  title: string;
  textStyles?: string; // Accept Tailwind class strings for text styling
  containerStyles?: string; // Accept Tailwind class strings for container styling
  disabled?: boolean | undefined;
}

const CustomButton = ({
  onPress,
  title = "", // Default to empty string
  textStyles = "",
  containerStyles = "",
  disabled,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={1}
      onPress={() => onPress(title)}
      className={`justify-center items-center rounded-md border-none ${containerStyles}`}
    >
      {title ? ( // Render Text only if `title` is valid
        <Text className={`text-black font-regular ${textStyles}`}>{title}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

// Export with styled for nativewind integration
export default CustomButton;
