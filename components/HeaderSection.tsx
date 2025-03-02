import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import CustomButton from './CustomButton'
import { Image } from 'react-native'
import React from 'react'
import CompostIotImage from '@/assets/images/compostIot.png'

interface HeaderProps {
    headerText: string
    title: string
    onPressToggle: () => void
}

const HeaderSection = ({headerText, title, onPressToggle}: HeaderProps) => {
  return (
    <View className="flex max-h-[80px] flex-row justify-between items-center p-5 pl-2 bg-[white]">
      <View className="flex-row items-center">
        {/* <MaterialIcons name="compost" size={40} color="#efefef" /> */}
        <View className='w-[60px] h-[60px] justify-center '>
          <Image className='w-full h-full' resizeMode='contain' source={CompostIotImage} />
        </View>
        <Text className="text-lg font-extrabold color-[black]">{headerText}</Text>
      </View>

      <View className="flex-1 items-end ">
        <CustomButton
          title={title}
          onPress={onPressToggle}
          containerStyles="w-1/2 bg-red min-h-[40px] border-[0.5px] border-[#d0cccc]"
          textStyles="text-[14px] font-semibold color-[black]"
        ></CustomButton>
      </View>
    </View>
  )
}

export default HeaderSection