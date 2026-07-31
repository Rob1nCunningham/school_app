import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

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
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Letters home</h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>From {activeChild?.school?.name}.</p>
      {items.map((l) => (
        <div key={l.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{l.title}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(l.published_at).toLocaleDateString()}</p>
          {l.summary && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{l.summary}</p>}
        </div>
      ))}
      {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing published yet.</p>}
    </div>
  )
}
