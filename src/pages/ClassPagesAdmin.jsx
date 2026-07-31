import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function ClassPagesAdmin() {
  const { school } = useAuth()
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [posts, setPosts] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!school) return
    supabase
      .from('classes')
      .select('id, name, year_groups(name, sort_order)')
      .eq('school_id', school.id)
      .then(({ data }) => {
        const sorted = (data || []).sort((a, b) => (a.year_groups?.sort_order ?? 0) - (b.year_groups?.sort_order ?? 0) || a.name.localeCompare(b.name))
        setClasses(sorted)
        if (sorted[0]) setClassId(sorted[0].id)
      })
  }, [school])

  async function loadPosts(id) {
    const { data } = await supabase.from('class_posts').select('*').eq('class_id', id).order('created_at', { ascending: false })
    setPosts(data || [])
  }

  useEffect(() => {
    if (classId) loadPosts(classId)
  }, [classId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('class_posts').insert({ class_id: classId, text, posted_by: userData.user.id })
    setText('')
    setBusy(false)
    loadPosts(classId)
  }

  const current = classes.find((c) => c.id === classId)

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Class pages</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Posts are only visible to parents of children in that class.</p>

      <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Class</label>
      <select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ width: 220, display: 'block', margin: '6px 0 16px' }}>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.year_groups?.name} · {c.name}</option>)}
      </select>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>{current?.year_groups?.name} · {current?.name}</p>
        <form onSubmit={handleSubmit}>
          <textarea placeholder="What's been happening in class this week?" value={text} onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', minHeight: 60, marginBottom: 10 }} />
          <button type="submit" disabled={busy} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Posting…' : 'Post to class page'}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>Recent posts</p>
      {posts.map((p) => (
        <div key={p.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, maxWidth: 480 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.created_at).toLocaleDateString()}</p>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>{p.text}</p>
        </div>
      ))}
      {posts.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No posts yet.</p>}
    </div>
  )
}
