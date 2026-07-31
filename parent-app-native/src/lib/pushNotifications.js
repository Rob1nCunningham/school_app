import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { supabase } from './supabaseClient.js'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

// Registers this device for push and saves the Expo push token against the
// signed-in parent, so the school's Edge Functions can send them a real
// notification when a message/event/consent form is published.
export async function registerForPushNotifications(userId) {
  if (!userId) return { ok: false, reason: 'not-signed-in' }
  if (!Device.isDevice) return { ok: false, reason: 'simulator' }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#2F6FE0'
    })
  }

  const existing = await Notifications.getPermissionsAsync()
  let status = existing.status
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync()
    status = requested.status
  }
  if (status !== 'granted') return { ok: false, reason: 'permission-denied' }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId
  if (!projectId) return { ok: false, reason: 'no-project-id' }

  try {
    const { data: tokenData } = await Notifications.getExpoPushTokenAsync({ projectId })
    const token = tokenData.data
    await supabase.from('push_tokens').upsert(
      { parent_id: userId, token, platform: Platform.OS, updated_at: new Date().toISOString() },
      { onConflict: 'token' }
    )
    return { ok: true, token }
  } catch (err) {
    // Expected in Expo Go on SDK 53+, where remote push was removed —
    // this becomes real once running inside a development/production build.
    return { ok: false, reason: err.message }
  }
}
