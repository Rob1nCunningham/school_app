import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { supabase } from '../src/lib/supabaseClient.js'
import { useAuth } from '../src/lib/AuthContext.jsx'
import { colors } from '../src/lib/theme.js'
import { Card, EmptyState } from '../src/components/ui.jsx'

export default function Letters() {
  const { activeChild } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!activeChild?.school) return
    supabase.from('letters').select('*').eq('school_id', activeChild.school.id)
      .order('published_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [activeChild])

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Letters home' }} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sub}>From {activeChild?.school?.name}.</Text>
        {items.map((l) => (
          <Card key={l.id}>
            <Text style={styles.itemTitle}>{l.title}</Text>
            <Text style={styles.itemDate}>{new Date(l.published_at).toLocaleDateString()}</Text>
            {l.summary ? <Text style={styles.itemBody}>{l.summary}</Text> : null}
          </Card>
        ))}
        {items.length === 0 && <EmptyState>Nothing published yet.</EmptyState>}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, color: colors.textSecondary, marginBottom: 14 },
  itemTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  itemDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  itemBody: { fontSize: 13, color: colors.textPrimary, marginTop: 6 }
})
