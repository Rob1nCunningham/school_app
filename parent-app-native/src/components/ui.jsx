import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { colors } from '../lib/theme.js'

export function Screen({ children, style }) {
  return <View style={[{ flex: 1, padding: 18, backgroundColor: colors.surface2 }, style]}>{children}</View>
}

export function ScreenTitle({ children, sub }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.title}>{children}</Text>
      {sub ? <Text style={styles.titleSub}>{sub}</Text> : null}
    </View>
  )
}

export function Card({ children, style, onPress }) {
  const Wrapper = onPress ? Pressable : View
  return (
    <Wrapper onPress={onPress} style={[styles.card, style]}>
      {children}
    </Wrapper>
  )
}

export function PrimaryButton({ title, onPress, disabled, busy, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={[styles.primaryButton, (disabled || busy) && { opacity: 0.6 }, style]}
    >
      {busy ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryButtonText}>{title}</Text>}
    </Pressable>
  )
}

export function GhostButton({ title, onPress, style, textStyle }) {
  return (
    <Pressable onPress={onPress} style={[styles.ghostButton, style]}>
      <Text style={[styles.ghostButtonText, textStyle]}>{title}</Text>
    </Pressable>
  )
}

export function DangerButton({ title, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.dangerButton, style]}>
      <Text style={styles.dangerButtonText}>{title}</Text>
    </Pressable>
  )
}

export function Badge({ children, tone = 'accent' }) {
  const tones = {
    accent: { bg: colors.bgAccent, text: colors.textAccent },
    success: { bg: colors.bgSuccess, text: colors.textSuccess },
    danger: { bg: colors.bgDanger, text: colors.textDanger }
  }
  const t = tones[tone] || tones.accent
  return (
    <View style={{ backgroundColor: t.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 11, color: t.text, fontWeight: '600' }}>{children}</Text>
    </View>
  )
}

export function EmptyState({ children }) {
  return <Text style={{ fontSize: 13, color: colors.textMuted }}>{children}</Text>
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  titleSub: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: colors.surface1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10
  },
  primaryButton: {
    backgroundColor: colors.fillPrimary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: { color: colors.onPrimary, fontSize: 14, fontWeight: '600' },
  ghostButton: { paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  ghostButtonText: { color: colors.textAccent, fontSize: 13, fontWeight: '500' },
  dangerButton: {
    backgroundColor: colors.bgDanger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  dangerButtonText: { color: colors.textDanger, fontSize: 14, fontWeight: '600' }
})
