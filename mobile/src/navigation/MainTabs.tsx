import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import DashboardScreen from '../screens/DashboardScreen'
import QuestsScreen from '../screens/QuestsScreen'
import GateScreen from '../screens/GateScreen'
import SocialScreen from '../screens/SocialScreen'
import GuildScreen from '../screens/GuildScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { mobileTheme } from '../theme'

const Tab = createBottomTabNavigator()

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(5, 7, 13, 0.98)',
          borderTopWidth: 1,
          borderTopColor: mobileTheme.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: mobileTheme.accent,
        tabBarInactiveTintColor: mobileTheme.textDim,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Dashboard') {
            iconName = focused ? 'compass' : 'compass-outline'
          } else if (route.name === 'Quests') {
            iconName = focused ? 'list' : 'list-outline'
          } else if (route.name === 'Gates') {
            iconName = focused ? 'skull' : 'skull-outline'
          } else if (route.name === 'Social') {
            iconName = focused ? 'people' : 'people-outline'
          } else if (route.name === 'Guilds') {
            iconName = focused ? 'shield' : 'shield-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          } else {
            iconName = 'help'
          }

          return <Ionicons name={iconName} size={24} color={color} />
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Quests" component={QuestsScreen} />
      <Tab.Screen name="Gates" component={GateScreen} />
      <Tab.Screen name="Guilds" component={GuildScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
