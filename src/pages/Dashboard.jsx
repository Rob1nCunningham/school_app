import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Dashboard() {
  const { school } = useAuth()
  const [stats, setStats] = useState({ students: null, messages: null })

  useEffect(() => {
    if (!school) return
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', school.id)
      .then(({ count }) => setStats((s) => ({ ...s, students: count })))
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('school_id', school.id)
      .then(({ count }) => setStats((s) => ({ ...s, messages: count })))
  }, [school])

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        {school?.name} · live data from Supabase
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24, maxWidth: 480 }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: 14 }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-secondary)' }}>Students on roll</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{stats.students ?? '…'}</p>
        </div>
        <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: 14 }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-secondary)' }}>Messages sent</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{stats.messages ?? '…'}</p>
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, margin: '24px 0 10px' }}>Quick actions</p>
      <Link to="/messages"><button>New message</button></Link>
    </div>
  )
}
