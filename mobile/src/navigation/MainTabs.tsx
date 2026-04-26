import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import DashboardScreen from '../screens/DashboardScreen'
import GateScreen from '../screens/GateScreen'
import SocialScreen from '../screens/SocialScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(6, 9, 19, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(59, 130, 246, 0.2)', // Neo-blue border
          height: 65, // Generous height for thumb zone
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute', // For glassmorphism feel
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: '#3b82f6', // Neon blue active
        tabBarInactiveTintColor: 'rgba(231, 237, 246, 0.4)',
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
          } else if (route.name === 'Gates') {
            iconName = focused ? 'skull' : 'skull-outline'
          } else if (route.name === 'Social') {
            iconName = focused ? 'people' : 'people-outline'
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
      <Tab.Screen name="Gates" component={GateScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
