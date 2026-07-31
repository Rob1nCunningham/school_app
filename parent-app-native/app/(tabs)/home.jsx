import { View, Text, Pressable, ScrollView, Linking, StyleSheet } from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ChildStack from '../../src/components/ChildStack.jsx'
import { colors } from '../../src/lib/theme.js'
import { GhostButton } from '../../src/components/ui.jsx'

const TILES = [
  ['/consent', 'Consent & absence', 'shield-checkmark-outline', '#2F6FE0'],
  ['/calendar', 'Calendar', 'calendar-outline', '#1d9e75'],
  ['/newsletters', 'Newsletters', 'newspaper-outline', '#d85a30'],
  ['/letters', 'Letters home', 'mail-outline', '#8a5cf6'],
  ['/class-page', 'Class page', 'people-outline', '#e0872f'],
  ['/surveys', 'Surveys', 'clipboard-outline', '#2f9ce0']
]

export default function Home() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface2 }} contentContainerStyle={{ padding: 18 }}>
      <ChildStack />

      <View style={styles.grid}>
        {TILES.map(([href, label, icon, color]) => (
          <Link key={href} href={href} asChild>
            <Pressable style={styles.tile}>
              <Ionicons name={icon} size={22} color={color} style={{ marginBottom: 10 }} />
              <Text style={styles.tileLabel}>{label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      <View style={styles.grid}>
        <Pressable style={[styles.tile, styles.dashed]} onPress={() => Linking.openURL('https://www.parentpay.com')}>
          <Ionicons name="restaurant-outline" size={22} color={colors.textMuted} style={{ marginBottom: 10 }} />
          <Text style={styles.tileLabel}>Meals menu</Text>
          <Text style={styles.tileSub}>via ParentPay ↗</Text>
        </Pressable>
        <Pressable style={[styles.tile, styles.dashed]} onPress={() => Linking.openURL('https://www.parentpay.com')}>
          <Ionicons name="card-outline" size={22} color={colors.textMuted} style={{ marginBottom: 10 }} />
          <Text style={styles.tileLabel}>Pay online</Text>
          <Text style={styles.tileSub}>via ParentPay ↗</Text>
        </Pressable>
      </View>

      <GhostButton title="Check for new invites" onPress={() => router.push('/add-child')} style={{ marginTop: 8 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  tile: {
    width: '48%',
    backgroundColor: colors.surface1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10
  },
  dashed: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong },
  tileLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  tileSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 }
})
