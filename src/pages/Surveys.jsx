import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Surveys() {
  const { school } = useAuth()
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    if (!school) return
    const { data } = await supabase.from('surveys').select('*').eq('school_id', school.id).order('created_at', { ascending: false })
    setItems(data || [])
  }

  useEffect(() => { refresh() }, [school])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    await supabase.from('surveys').insert({ school_id: school.id, title })
    setTitle('')
    setBusy(false)
    refresh()
  }

  async function closeSurvey(id) {
    await supabase.from('surveys').update({ status: 'closed' }).eq('id', id)
    refresh()
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Surveys</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>Sent to every parent at {school?.name}.</p>
      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>New survey</p>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="e.g. Parent view: after-school clubs" value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }} />
          <button type="submit" disabled={busy} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Sending…' : 'Send to parents'}
          </button>
        </form>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>All surveys</p>
      {items.map((s) => (
        <div key={s.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, maxWidth: 480, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{s.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: s.status === 'open' ? 'var(--bg-danger)' : 'var(--surface-2)', color: s.status === 'open' ? 'var(--text-danger)' : 'var(--text-secondary)' }}>
              {s.status === 'open' ? 'Open' : 'Closed'}
            </span>
            {s.status === 'open' && <button onClick={() => closeSurvey(s.id)}>Close</button>}
          </div>
        </div>
      ))}
      {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No surveys yet.</p>}
    </div>
  )
}
