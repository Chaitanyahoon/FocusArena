import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import MainTabs from './MainTabs'
import ChatScreen from '../screens/ChatScreen'
import ShopScreen from '../screens/ShopScreen'
import DailyQuestsScreen from '../screens/DailyQuestsScreen'
import FriendsScreen from '../screens/FriendsScreen'
import GuildChatScreen from '../screens/GuildChatScreen'
import { useAppStore } from '../stores/appStore'

const Stack = createNativeStackNavigator()

const ArenaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#060913',
  },
}

export default function RootNavigator() {
  const { auth } = useAppStore()

  return (
    <NavigationContainer theme={ArenaTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {auth ? (
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Shop" component={ShopScreen} />
            <Stack.Screen name="DailyQuests" component={DailyQuestsScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="GuildChat" component={GuildChatScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
