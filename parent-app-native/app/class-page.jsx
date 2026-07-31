import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { supabase } from '../src/lib/supabaseClient.js'
import { useAuth } from '../src/lib/AuthContext.jsx'
import { colors } from '../src/lib/theme.js'
import { Card, EmptyState } from '../src/components/ui.jsx'

export default function ClassPage() {
  const { activeChild } = useAuth()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!activeChild?.classId) return
    supabase.from('class_posts').select('*').eq('class_id', activeChild.classId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []))
  }, [activeChild])

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Class page' }} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sub}>{activeChild?.className}.</Text>
        {posts.map((p) => (
          <Card key={p.id}>
            <Text style={styles.itemDate}>{new Date(p.created_at).toLocaleDateString()}</Text>
            <Text style={styles.itemBody}>{p.text}</Text>
          </Card>
        ))}
        {posts.length === 0 && <EmptyState>No posts yet.</EmptyState>}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  sub: { fontSize: 12, color: colors.textSecondary, marginBottom: 14 },
  itemDate: { fontSize: 12, color: colors.textSecondary },
  itemBody: { fontSize: 13, color: colors.textPrimary, marginTop: 4 }
})
