import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Letters() {
  const { school } = useAuth()
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    if (!school) return
    const { data } = await supabase.from('letters').select('*').eq('school_id', school.id).order('published_at', { ascending: false })
    setItems(data || [])
  }

  useEffect(() => { refresh() }, [school])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    await supabase.from('letters').insert({ school_id: school.id, title, summary })
    setTitle('')
    setSummary('')
    setBusy(false)
    refresh()
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Letters home</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>Published to parents at {school?.name}.</p>
      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>New letter</p>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
          <textarea placeholder="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} style={{ width: '100%', minHeight: 60, marginBottom: 10 }} />
          <button type="submit" disabled={busy} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>Published</p>
      {items.map((l) => (
        <div key={l.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, maxWidth: 480 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{l.title}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(l.published_at).toLocaleDateString()}</p>
          {l.summary && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{l.summary}</p>}
        </div>
      ))}
      {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing published yet.</p>}
    </div>
  )
}
