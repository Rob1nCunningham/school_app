import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

const TILES = [
  ['/consent', 'Consent & absence', '#2F6FE0'],
  ['/calendar', 'Calendar', '#1d9e75'],
  ['/newsletters', 'Newsletters', '#d85a30'],
  ['/letters', 'Letters home', '#8a5cf6'],
  ['/class-page', 'Class page', '#e0872f'],
  ['/surveys', 'Surveys', '#2f9ce0'],
]

export default function Home() {
  const { kids, activeChildId, setActiveChildId } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ padding: '18px' }}>
      {kids && kids.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16 }}>
          {kids.map((k) => (
            <button key={k.id} onClick={() => setActiveChildId(k.id)}
              style={{
                flexShrink: 0, fontSize: 12, padding: '6px 12px',
                background: k.id === activeChildId ? 'var(--bg-accent)' : 'var(--surface-1)',
                color: k.id === activeChildId ? 'var(--text-accent)' : 'var(--text-secondary)',
                borderColor: k.id === activeChildId ? 'var(--border-accent)' : 'var(--border-strong)'
              }}>
              {k.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {TILES.map(([to, label, color]) => (
          <Link key={to} to={to} style={{ background: 'var(--surface-1)', borderRadius: 12, padding: 16, display: 'block' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: color, display: 'block', marginBottom: 10 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <a href="https://www.parentpay.com" target="_blank" rel="noopener noreferrer"
          style={{ background: 'var(--surface-1)', borderRadius: 12, padding: 16, display: 'block', border: '1px dashed var(--border-strong)' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Meals menu</span>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>via ParentPay ↗</span>
        </a>
        <a href="https://www.parentpay.com" target="_blank" rel="noopener noreferrer"
          style={{ background: 'var(--surface-1)', borderRadius: 12, padding: 16, display: 'block', border: '1px dashed var(--border-strong)' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Pay online</span>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>via ParentPay ↗</span>
        </a>
      </div>

      <button onClick={() => navigate('/add-child')} style={{ width: '100%', marginTop: 20 }}>
        Check for new invites
      </button>
    </div>
  )
}
