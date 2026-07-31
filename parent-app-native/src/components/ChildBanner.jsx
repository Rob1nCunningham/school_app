import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '../lib/AuthContext.jsx'
import { colors } from '../lib/theme.js'

// Mirrors AppShell's top bar on the web app — shown on every tab except Home,
// where the ChildStack card already makes it clear whose data you're on.
export default function ChildBanner() {
  const { activeChild } = useAuth()
  const school = activeChild?.school
  const initials = activeChild ? activeChild.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : ''

  return (
    <View style={[styles.wrap, { backgroundColor: school?.brand_color || colors.fillPrimary }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View>
        <Text style={styles.school}>{school?.name}</Text>
        <Text style={styles.name}>{activeChild ? activeChild.name : ''}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 14 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  school: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  name: { fontSize: 15, fontWeight: '600', color: '#fff', marginTop: 2 }
})
