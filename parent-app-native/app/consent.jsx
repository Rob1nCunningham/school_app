import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { supabase } from '../src/lib/supabaseClient.js'
import { useAuth } from '../src/lib/AuthContext.jsx'
import { colors } from '../src/lib/theme.js'
import { Card, Badge, PrimaryButton, EmptyState } from '../src/components/ui.jsx'

export default function Consent() {
  const { activeChild } = useAuth()
  const [forms, setForms] = useState([])
  const [responses, setResponses] = useState({})

  async function load() {
    if (!activeChild?.school) return
    const { data: formRows } = await supabase
      .from('consent_forms')
      .select('*')
      .eq('school_id', activeChild.school.id)
      .order('due_date', { ascending: true })
    setForms(formRows || [])
    if (formRows && formRows.length) {
      const { data: rows } = await supabase
        .from('consent_responses')
        .select('consent_form_id, responded')
        .eq('student_id', activeChild.id)
        .in('consent_form_id', formRows.map((f) => f.id))
      const map = {}
      ;(rows || []).forEach((r) => { map[r.consent_form_id] = r.responded })
      setResponses(map)
    }
  }

  useEffect(() => { load() }, [activeChild])

  async function respond(formId) {
    await supabase.from('consent_responses').update({ responded: true, responded_at: new Date().toISOString() })
      .eq('consent_form_id', formId).eq('student_id', activeChild.id)
    setResponses((r) => ({ ...r, [formId]: true }))
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Consent & absence' }} />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={styles.sub}>For {activeChild?.name}.</Text>
        {forms.map((f) => {
          const responded = responses[f.id]
          return (
            <Card key={f.id}>
              <Text style={styles.itemTitle}>{f.title}</Text>
              <Text style={styles.itemDate}>Due {new Date(f.due_date).toLocaleDateString()}</Text>
              {f.detail ? <Text style={styles.itemBody}>{f.detail}</Text> : null}
              {responded ? (
                <Badge tone="success">Responded</Badge>
              ) : (
                <PrimaryButton title="Give consent" onPress={() => respond(f.id)} style={{ marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 16 }} />
              )}
            </Card>
          )
        })}
        {forms.length === 0 && <EmptyState>Nothing needs a response right now.</EmptyState>}
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
