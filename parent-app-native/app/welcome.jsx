import { View, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../src/lib/theme.js'
import { PrimaryButton, GhostButton } from '../src/components/ui.jsx'

const BUBBLES = [
  { icon: 'business-outline', bg: colors.bgAccent, fg: colors.textAccent, style: { top: 0, left: '50%', marginLeft: -38, width: 76, height: 76, borderRadius: 22 }, iconSize: 34 },
  { icon: 'chatbubble-ellipses-outline', bg: colors.bgSuccess, fg: colors.textSuccess, style: { top: 60, left: 12, width: 58, height: 58, borderRadius: 18 }, iconSize: 26 },
  { icon: 'calendar-outline', bg: '#FAECE7', fg: '#993C1D', style: { top: 44, right: 6, width: 58, height: 58, borderRadius: 18 }, iconSize: 26 },
  { icon: 'shield-checkmark-outline', bg: colors.bgWarning, fg: colors.textWarning, style: { bottom: 34, left: 0, width: 52, height: 52, borderRadius: 16 }, iconSize: 24 },
  { icon: 'newspaper-outline', bg: '#FBEAF0', fg: '#993556', style: { bottom: 20, right: 8, width: 52, height: 52, borderRadius: 16 }, iconSize: 24 }
]

export default function Welcome() {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.bubbleArea}>
          {BUBBLES.map((b, i) => (
            <View key={i} style={[styles.bubble, { backgroundColor: b.bg }, b.style]}>
              <Ionicons name={b.icon} size={b.iconSize} color={b.fg} />
            </View>
          ))}
          <View style={styles.mascot}>
            <Ionicons name="happy-outline" size={76} color={colors.onPrimary} />
          </View>
        </View>

        <Text style={styles.wordmark}>School App</Text>
        <Text style={styles.tagline}>Everything from school, in one place.</Text>

        <PrimaryButton title="Sign in" onPress={() => router.push('/login?mode=signin')} style={{ borderRadius: 26 }} />
        <GhostButton
          title="I've been invited — create account"
          onPress={() => router.push('/login?mode=signup')}
          style={styles.secondaryButton}
          textStyle={{ color: colors.textPrimary, fontWeight: '600' }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 360, backgroundColor: colors.surface1, borderRadius: 28, padding: 24, paddingTop: 36 },
  bubbleArea: { height: 280, position: 'relative' },
  bubble: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  mascot: {
    position: 'absolute', bottom: 0, left: '50%', marginLeft: -75,
    width: 150, height: 150, borderRadius: 75, backgroundColor: colors.fillPrimary,
    alignItems: 'center', justifyContent: 'center'
  },
  wordmark: { textAlign: 'center', fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 20, marginBottom: 6 },
  tagline: { textAlign: 'center', fontSize: 13, color: colors.textSecondary, marginBottom: 28 },
  secondaryButton: {
    marginTop: 10, borderRadius: 26, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface1
  }
})
