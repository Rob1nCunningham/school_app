import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../src/lib/AuthContext.jsx'
import { colors } from '../../src/lib/theme.js'
import { GhostButton, DangerButton } from '../../src/components/ui.jsx'

export default function Profile() {
  const { user, kids, activeChildId, setActiveChildId, signOut } = useAuth()

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface2 }} contentContainerStyle={{ padding: 18 }}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <Text style={styles.section}>Your children</Text>
      {(kids || []).map((k) => (
        <Pressable
          key={k.id}
          onPress={() => setActiveChildId(k.id)}
          style={[styles.childCard, k.id === activeChildId && styles.childCardActive]}
        >
          <Text style={styles.childName}>{k.name}</Text>
          <Text style={styles.childSub}>{k.school?.name} · {k.className}</Text>
        </Pressable>
      ))}

      <GhostButton title="Check for new invites" onPress={() => router.push('/add-child')} style={{ marginBottom: 10 }} />
      <DangerButton title="Sign out" onPress={signOut} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  email: { fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  section: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  childCard: {
    backgroundColor: colors.surface1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  childCardActive: { borderColor: colors.borderAccent },
  childName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  childSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 }
})
