import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function ClassPage() {
  const { staffMember } = useAuth()
  const [posts, setPosts] = useState([])
  const [className, setClassName] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data: cls } = await supabase.from('classes').select('name').eq('id', staffMember.class_id).single()
    setClassName(cls?.name || '')
    const { data } = await supabase
      .from('class_posts')
      .select('*')
      .eq('class_id', staffMember.class_id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  useEffect(() => {
    if (staffMember?.class_id) load()
  }, [staffMember])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('class_posts').insert({ class_id: staffMember.class_id, text, posted_by: userData.user.id })
    setText('')
    setBusy(false)
    load()
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>My class page</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
        Only visible to parents of children in {className}.
      </p>
      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>{className}</p>
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
