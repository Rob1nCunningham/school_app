import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../src/lib/AuthContext.jsx'
import { colors } from '../src/lib/theme.js'
import { PrimaryButton, GhostButton } from '../src/components/ui.jsx'

export default function AddChild() {
  const { user, kids, refreshKids, signOut } = useAuth()
  const [checking, setChecking] = useState(false)

  async function checkAgain() {
    setChecking(true)
    await refreshKids()
    setChecking(false)
  }

  useEffect(() => {
    checkAgain()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const linked = kids && kids.length > 0

  return (
    <View style={styles.wrap}>
      <View style={{ width: '100%', maxWidth: 340 }}>
        <Text style={styles.title}>{linked ? "You're all set" : 'Waiting to be linked'}</Text>
        <Text style={styles.sub}>
          {linked
            ? `${kids.length === 1 ? 'A new child has' : 'New children have'} been linked to your account.`
            : `Signed in as ${user?.email}. Your child's school needs to link your account before you can see anything — ask the school office to add you as a parent contact, then check again here.`}
        </Text>

        {linked ? (
          <PrimaryButton title="Continue" onPress={() => router.replace('/(tabs)/home')} />
        ) : (
          <PrimaryButton title={checking ? 'Checking…' : 'Check again'} onPress={checkAgain} busy={checking} />
        )}

        <GhostButton title="Sign out" onPress={signOut} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 20, textAlign: 'center' }
})
