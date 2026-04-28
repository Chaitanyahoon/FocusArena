import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import DashboardScreen from '../screens/DashboardScreen'
import QuestsScreen from '../screens/QuestsScreen'
import GateScreen from '../screens/GateScreen'
import SocialScreen from '../screens/SocialScreen'
import GuildScreen from '../screens/GuildScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { mobileTheme } from '../theme'

const Tab = createBottomTabNavigator()

const TABS: { name: string; icon: keyof typeof Ionicons.glyphMap; iconFocused: keyof typeof Ionicons.glyphMap; component: React.ComponentType<any> }[] = [
  { name: 'Dashboard', icon: 'compass-outline', iconFocused: 'compass', component: DashboardScreen },
  { name: 'Quests', icon: 'list-outline', iconFocused: 'list', component: QuestsScreen },
  { name: 'Gates', icon: 'skull-outline', iconFocused: 'skull', component: GateScreen },
  { name: 'Guilds', icon: 'shield-outline', iconFocused: 'shield', component: GuildScreen },
  { name: 'Social', icon: 'people-outline', iconFocused: 'people', component: SocialScreen },
  { name: 'Profile', icon: 'person-outline', iconFocused: 'person', component: ProfileScreen },
]

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(5, 7, 13, 0.92)',
          borderTopWidth: 1,
          borderTopColor: mobileTheme.border,
          height: 72,
          paddingBottom: 14,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: mobileTheme.accent,
        tabBarInactiveTintColor: mobileTheme.textDim,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '800',
          letterSpacing: 0.8,
          marginTop: 2,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ focused, color }) => {
          const tab = TABS.find(t => t.name === route.name)
          const iconName = focused ? (tab?.iconFocused || 'help') : (tab?.icon || 'help-outline')
          return (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons name={iconName} size={22} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          )
        },
      })}
    >
      {TABS.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  activeIconWrap: {
    alignItems: 'center',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: mobileTheme.accent,
    marginTop: 3,
  },
})
