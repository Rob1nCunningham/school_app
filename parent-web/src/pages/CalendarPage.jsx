import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function CalendarPage() {
  const { activeChild } = useAuth()
  const [events, setEvents] = useState([])

  useEffect(() => {
    if (!activeChild?.school) return
    supabase
      .from('events')
      .select('*')
      .eq('school_id', activeChild.school.id)
      .order('starts_at', { ascending: true })
      .then(({ data }) => setEvents(data || []))
  }, [activeChild])

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Calendar</h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>For {activeChild?.name}.</p>
      {events.map((e) => (
        <div key={e.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{e.title}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(e.starts_at).toLocaleString()}</p>
          {e.attachment_url && (
            <a href={e.attachment_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', fontSize: 11, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 8, marginTop: 6 }}>
              {e.attachment_name}
            </a>
          )}
        </div>
      ))}
      {events.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing scheduled.</p>}
    </div>
  )
}
