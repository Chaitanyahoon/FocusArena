import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

class NotificationService {
  private expoPushToken: string | null = null

  async initialize() {
    if (!Device.isDevice) {
      console.log('[Notifications] Must use physical device for push notifications.')
      return null
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted.')
      return null
    }

    // Get Expo push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync()
      this.expoPushToken = tokenData.data
      console.log('[Notifications] Expo Push Token:', this.expoPushToken)
    } catch (err) {
      console.error('[Notifications] Failed to get push token:', err)
    }

    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
      })

      await Notifications.setNotificationChannelAsync('gate-alerts', {
        name: 'Gate Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#ef4444',
      })
    }

    return this.expoPushToken
  }

  // Schedule a local notification for an expiring gate
  async scheduleGateExpiry(gateName: string, expiresAt: string) {
    const expiryDate = new Date(expiresAt)
    const warningTime = new Date(expiryDate.getTime() - 60 * 60 * 1000) // 1 hour before

    if (warningTime <= new Date()) {
      // Already past warning time, send immediately
      await this.sendLocalNotification(
        '⚠️ Gate Expiring Soon!',
        `${gateName} will close in less than 1 hour. Clear it now!`,
        'gate-alerts',
      )
      return
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Gate Expiring Soon!',
        body: `${gateName} will close in 1 hour. Clear it now!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: warningTime,
      },
    })

    console.log(`[Notifications] Scheduled gate expiry alert for ${warningTime.toISOString()}`)
  }

  async sendLocalNotification(title: string, body: string, channelId = 'default') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger: null, // Immediately
    })
  }

  // Listen for incoming notifications
  addNotificationListener(handler: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(handler)
  }

  // Listen for notification interactions (taps)
  addResponseListener(handler: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(handler)
  }

  get token() {
    return this.expoPushToken
  }
}

export const notificationService = new NotificationService()
