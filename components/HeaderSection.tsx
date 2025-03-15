import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import CustomButton from './CustomButton'
import { Image } from 'react-native'
import React from 'react'
const CompostIotImage = require('@/assets/images/compostIot.png');
import { useUser } from '@/context/UserContext'
import { router } from 'expo-router'

interface HeaderProps {
    headerText: string
    title: string
}

const goToUserLog = () => {
  router.push("/userLog");
}

const HeaderSection = ({headerText, title}: HeaderProps) => {
  const { user, logoutUser } = useUser()

  return (
    <View className="flex max-h-[80px] flex-row justify-between items-center p-5 pl-2 bg-[#2F2C2C] border-b-[0.5px] border-[#d0cccc]">
      <View className="flex-row items-center">
        {/* <MaterialIcons name="compost" size={40} color="#efefef" /> */}
        <View className='w-[60px] h-[60px] justify-center '>
          <Image className='w-full h-full' resizeMode='contain' source={CompostIotImage} />
        </View>
        <Text className="text-lg font-extrabold color-[white]">{headerText}</Text>
      </View>

      <View className="flex-1 items-end ">
        <CustomButton
          title={user?.username ? user.username : "LOGIN"}
          onPress={!user ? goToUserLog : () => console.log("Punta profile page")}
          containerStyles="w-1/2 bg-[#] min-h-[40px] border-[0.5px] border-[#d0cccc]"
          textStyles="text-[12px] font-semibold color-[white]"
        ></CustomButton>
      </View>
    </View>
  )
}

export default HeaderSection