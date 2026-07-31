import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

function formatRange(startsAt, endsAt) {
  const start = new Date(startsAt)
  const opts = { weekday: 'short', day: 'numeric', month: 'short' }
  if (!endsAt) return start.toLocaleDateString(undefined, opts)
  const end = new Date(endsAt)
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
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

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const isPast = (item) => new Date(item.ends_at || item.starts_at) < today

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-calendar-event" aria-hidden="true" style={{ fontSize: 18, color: '#1d9e75' }} />Term dates
      </h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
        {activeChild?.school?.name} — a quick summary. These also sync to your calendar.
      </p>
      {items.map((item) => (
        <div key={item.id} style={{
          background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8,
          opacity: isPast(item) ? 0.5 : 1
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{item.title}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{formatRange(item.starts_at, item.ends_at)}</p>
        </div>
      ))}
      {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No term dates published yet.</p>}
    </div>
  )
}
