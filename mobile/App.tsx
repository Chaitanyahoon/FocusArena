import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RootNavigator from './src/navigation/RootNavigator'
import { useAppStore } from './src/stores/appStore'
import { signalRService } from './src/services/signalr'
import { notificationService } from './src/services/notifications'

export default function App() {
  const { init, booting, auth } = useAppStore()

  useEffect(() => {
    init()
    notificationService.initialize()
  }, [init])

  // Connect/disconnect SignalR based on auth state
  useEffect(() => {
    if (auth) {
      signalRService.connect()
    } else {
      signalRService.disconnect()
    }

    return () => {
      signalRService.disconnect()
    }
  }, [auth])

  if (booting) {
    return (
      <View style={styles.bootScreen}>
        <ActivityIndicator color="#3b82f6" size="large" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    backgroundColor: '#060913',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
