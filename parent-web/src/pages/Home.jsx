import { Link, useNavigate } from 'react-router-dom'
import ChildStack from '../components/ChildStack.jsx'

const TILES = [
  ['/consent', 'Consent & absence', 'ti-shield-check', '#2F6FE0'],
  ['/calendar', 'Calendar', 'ti-calendar', '#1d9e75'],
  ['/term-dates', 'Term dates', 'ti-calendar-event', '#1d9e75'],
  ['/newsletters', 'Newsletters', 'ti-news', '#d85a30'],
  ['/letters', 'Letters home', 'ti-mail', '#8a5cf6'],
  ['/class-page', 'Class page', 'ti-users', '#e0872f'],
  ['/surveys', 'Surveys', 'ti-clipboard-list', '#2f9ce0'],
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '18px' }}>
      <ChildStack />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {TILES.map(([to, label, icon, color]) => (
          <Link key={to} to={to} style={{ background: 'var(--surface-1)', borderRadius: 12, padding: 16, display: 'block' }}>
            <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 22, color, display: 'block', marginBottom: 10 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <a href="https://www.parentpay.com" target="_blank" rel="noopener noreferrer"
          style={{ background: 'var(--surface-1)', borderRadius: 12, padding: 16, display: 'block', border: '1px dashed var(--border-strong)' }}>
          <i className="ti ti-tools-kitchen-2" aria-hidden="true" style={{ fontSize: 22, color: 'var(--text-muted)', display: 'block', marginBottom: 10 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Meals menu</span>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>via ParentPay <i className="ti ti-external-link" aria-hidden="true" style={{ fontSize: 11 }} /></span>
        </a>
        <a href="https://www.parentpay.com" target="_blank" rel="noopener noreferrer"
          style={{ background: 'var(--surface-1)', borderRadius: 12, padding: 16, display: 'block', border: '1px dashed var(--border-strong)' }}>
          <i className="ti ti-credit-card" aria-hidden="true" style={{ fontSize: 22, color: 'var(--text-muted)', display: 'block', marginBottom: 10 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Pay online</span>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>via ParentPay <i className="ti ti-external-link" aria-hidden="true" style={{ fontSize: 11 }} /></span>
        </a>
      </div>

      <button onClick={() => navigate('/add-child')} style={{ width: '100%', marginTop: 20 }}>
        Check for new invites
      </button>
    </div>
  )
}
