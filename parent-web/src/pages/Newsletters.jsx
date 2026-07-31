import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Newsletters() {
  const { activeChild } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!activeChild?.school) return
    supabase.from('newsletters').select('*').eq('school_id', activeChild.school.id)
      .order('published_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [activeChild])

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Newsletters</h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>From {activeChild?.school?.name}.</p>
      {items.map((n) => (
        <div key={n.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{n.title}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(n.published_at).toLocaleDateString()}</p>
          {n.summary && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{n.summary}</p>}
        </div>
      ))}
      {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing published yet.</p>}
    </div>
  )
}
