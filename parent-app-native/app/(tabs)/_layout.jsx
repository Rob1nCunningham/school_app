import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../src/lib/AuthContext.jsx'
import { supabase } from '../../src/lib/supabaseClient.js'
import { colors } from '../../src/lib/theme.js'

function TabIcon({ name, color, size, badge }) {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
      {badge > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -3,
            right: -8,
            minWidth: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.fillDanger,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: '700', color: colors.onDanger }}>{badge}</Text>
        </View>
      )}
    </View>
  )
}

export default function TabsLayout() {
  const { activeChild } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!activeChild) return
    supabase
      .from('message_reads')
      .select('message_id', { count: 'exact', head: true })
      .eq('student_id', activeChild.id)
      .is('read_at', null)
      .then(({ count }) => setUnread(count || 0))
  }, [activeChild])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textAccent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface1, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11 }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <TabIcon name="home-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <TabIcon name="chatbubble-ellipses-outline" color={color} size={size} badge={unread} />
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: 'Calendar', tabBarIcon: ({ color, size }) => <TabIcon name="calendar-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <TabIcon name="person-circle-outline" color={color} size={size} /> }}
      />
    </Tabs>
  )
}
