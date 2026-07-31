import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

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
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Messages</h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>For {activeChild?.name}.</p>
      {messages.map((m) => {
        const isRead = !!readMap[m.id]
        const expanded = expandedId === m.id
        return (
          <div key={m.id} onClick={() => openMessage(m.id)} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: isRead ? 400 : 600 }}>{m.subject}</p>
              {!isRead && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--fill-primary)', flexShrink: 0, marginTop: 4 }} />}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(m.created_at).toLocaleDateString()}</p>
            {expanded && <p style={{ margin: '8px 0 0', fontSize: 13 }}>{m.body}</p>}
          </div>
        )
      })}
      {messages.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No messages yet.</p>}
    </div>
  )
}
