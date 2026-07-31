import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Surveys() {
  const { activeChild } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!activeChild?.school) return
    supabase.from('surveys').select('*').eq('school_id', activeChild.school.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [activeChild])

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Surveys</h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>From {activeChild?.school?.name}.</p>
      {items.filter((s) => s.status === 'open').map((s) => (
        <div key={s.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{s.title}</p>
          <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, color: 'var(--text-danger)', background: 'var(--bg-danger)', padding: '3px 10px', borderRadius: 8 }}>
            Open — tap to respond
          </span>
        </div>
      ))}
      {items.filter((s) => s.status === 'open').length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No open surveys right now.</p>}
    </div>
  )
}
