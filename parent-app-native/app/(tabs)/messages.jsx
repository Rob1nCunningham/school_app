import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabaseClient.js'
import { useAuth } from '../../src/lib/AuthContext.jsx'
import { colors } from '../../src/lib/theme.js'
import ChildBanner from '../../src/components/ChildBanner.jsx'
import { EmptyState } from '../../src/components/ui.jsx'

export default function Messages() {
  const { activeChild } = useAuth()
  const [messages, setMessages] = useState([])
  const [readMap, setReadMap] = useState({})
  const [expandedId, setExpandedId] = useState(null)

  async function load() {
    if (!activeChild?.school) return
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('school_id', activeChild.school.id)
      .order('created_at', { ascending: false })
    setMessages(msgs || [])
    if (msgs && msgs.length) {
      const { data: reads } = await supabase
        .from('message_reads')
        .select('message_id, read_at')
        .eq('student_id', activeChild.id)
        .in('message_id', msgs.map((m) => m.id))
      const map = {}
      ;(reads || []).forEach((r) => { map[r.message_id] = r.read_at })
      setReadMap(map)
    }
  }

  useEffect(() => { load() }, [activeChild])

  async function openMessage(id) {
    setExpandedId(expandedId === id ? null : id)
    if (!readMap[id]) {
      await supabase.from('message_reads').update({ read_at: new Date().toISOString() })
        .eq('message_id', id).eq('student_id', activeChild.id)
      setReadMap((m) => ({ ...m, [id]: new Date().toISOString() }))
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface2 }}>
      <ChildBanner />
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        {messages.map((m) => {
          const isRead = !!readMap[m.id]
          const expanded = expandedId === m.id
          return (
            <Pressable key={m.id} onPress={() => openMessage(m.id)} style={{ backgroundColor: colors.surface1, borderRadius: 10, padding: 14, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: isRead ? '400' : '700', color: colors.textPrimary, flex: 1 }}>{m.subject}</Text>
                {!isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.fillPrimary, marginTop: 4 }} />}
              </View>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{new Date(m.created_at).toLocaleDateString()}</Text>
              {expanded && <Text style={{ fontSize: 13, color: colors.textPrimary, marginTop: 8 }}>{m.body}</Text>}
            </Pressable>
          )
        })}
        {messages.length === 0 && <EmptyState>No messages yet.</EmptyState>}
      </ScrollView>
    </View>
  )
}
