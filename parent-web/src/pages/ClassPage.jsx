import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function ClassPage() {
  const { activeChild } = useAuth()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!activeChild?.classId) return
    supabase.from('class_posts').select('*').eq('class_id', activeChild.classId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []))
  }, [activeChild])

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Class page</h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>{activeChild?.className}.</p>
      {posts.map((p) => (
        <div key={p.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.created_at).toLocaleDateString()}</p>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>{p.text}</p>
        </div>
      ))}
      {posts.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No posts yet.</p>}
    </div>
  )
}
