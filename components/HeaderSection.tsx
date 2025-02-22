import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import CustomButton from './CustomButton'
import React from 'react'

interface HeaderProps {
    headerText: string
    title: string
    onPressToggle: () => void
}

const HeaderSection = ({headerText, title, onPressToggle}: HeaderProps) => {
  return (
    <View className="flex flex-row justify-between items-center p-5">
      {/* Icon and Text aligned horizontally */}
      <View className="flex-row items-center">
        <MaterialIcons name="compost" size={40} color="black" />
        <Text className="ml-1 text-md font-extrabold">{headerText}</Text>
        {/* Added margin for spacing */}
      </View>

      <View className="flex-1 items-end ">
        <CustomButton
          containerStyles="w-1/2 border-[0.5px] border-gray-400 min-h-[40px]"
          textStyles="text-[12px] font-extralight"
          title={title}
          onPress={onPressToggle}
        ></CustomButton>
      </View>
    </View>
  )
}

export default HeaderSection