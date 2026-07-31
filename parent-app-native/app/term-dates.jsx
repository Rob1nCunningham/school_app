import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { supabase } from '../src/lib/supabaseClient.js'
import { useAuth } from '../src/lib/AuthContext.jsx'
import { colors } from '../src/lib/theme.js'
import { Card, EmptyState } from '../src/components/ui.jsx'

function formatRange(startsAt, endsAt) {
  const opts = { weekday: 'short', day: 'numeric', month: 'short' }
  const start = new Date(startsAt).toLocaleDateString(undefined, opts)
  if (!endsAt) return start
  const end = new Date(endsAt).toLocaleDateString(undefined, opts)
  return `${start} – ${end}`
}

export default function TermDates() {
  const { activeChild } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!activeChild?.school) return
    supabase
      .from('events')
      .select('*')
      .eq('school_id', activeChild.school.id)
      .eq('category', 'term_date')
      .order('starts_at', { ascending: true })
      .then(({ data }) => setItems(data || []))
  }, [activeChild])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isPast = (item) => new Date(item.ends_at || item.starts_at) < today

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Term dates' }} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sub}>
          {activeChild?.school?.name} — a quick summary. These also sync to your calendar.
        </Text>
        {items.map((item) => (
          <Card key={item.id} style={isPast(item) ? { opacity: 0.5 } : null}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDate}>{formatRange(item.starts_at, item.ends_at)}</Text>
          </Card>
        ))}
        {items.length === 0 && <EmptyState>No term dates published yet.</EmptyState>}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, color: colors.textSecondary, marginBottom: 14 },
  itemTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  itemDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 }
})
