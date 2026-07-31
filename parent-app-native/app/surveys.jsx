import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { supabase } from '../src/lib/supabaseClient.js'
import { useAuth } from '../src/lib/AuthContext.jsx'
import { colors } from '../src/lib/theme.js'
import { Card, Badge, EmptyState } from '../src/components/ui.jsx'

export default function Surveys() {
  const { activeChild } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!activeChild?.school) return
    supabase.from('surveys').select('*').eq('school_id', activeChild.school.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [activeChild])

  const open = items.filter((s) => s.status === 'open')

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Surveys' }} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sub}>From {activeChild?.school?.name}.</Text>
        {open.map((s) => (
          <Card key={s.id}>
            <Text style={styles.itemTitle}>{s.title}</Text>
            <Badge tone="danger">Open — tap to respond</Badge>
          </Card>
        ))}
        {open.length === 0 && <EmptyState>No open surveys right now.</EmptyState>}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, color: colors.textSecondary, marginBottom: 14 },
  itemTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 }
})
