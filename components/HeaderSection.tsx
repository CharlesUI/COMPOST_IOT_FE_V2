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
    <View className="flex flex-row justify-between items-center p-5 bg-white">
      {/* Icon and Text aligned horizontally */}
      <View className="flex-row items-center">
        <MaterialIcons name="compost" size={40} color="black" />
        <Text className="ml-1 text-md font-extrabold">{headerText}</Text>
      </View>

      <View className="flex-1 items-end ">
        <CustomButton
          title={title}
          onPress={onPressToggle}
          containerStyles="w-1/2 bg-red min-h-[40px] border-2"
          textStyles="text-[16px] font-semibold"
        ></CustomButton>
      </View>
    </View>
  )
}

export default HeaderSection