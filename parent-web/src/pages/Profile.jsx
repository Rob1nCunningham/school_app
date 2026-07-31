import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Profile() {
  const { user, kids, activeChildId, setActiveChildId, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Profile</h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>{user?.email}</p>

      <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 8px' }}>Your children</p>
      {(kids || []).map((k) => (
        <div key={k.id} onClick={() => setActiveChildId(k.id)}
          style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', border: k.id === activeChildId ? '1px solid var(--border-accent)' : '1px solid transparent' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{k.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{k.school?.name} · {k.className}</p>
        </div>
      ))}

      <button onClick={() => navigate('/add-child')} style={{ width: '100%', marginTop: 10, marginBottom: 20 }}>
        Check for new invites
      </button>

      <button onClick={signOut} style={{ width: '100%', background: 'var(--bg-danger)', color: 'var(--text-danger)', border: 'none' }}>
        Sign out
      </button>
    </div>
  )
}
