import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

const NAV = [
  ['/home', 'Home'],
  ['/messages', 'Messages'],
  ['/calendar', 'Calendar'],
  ['/profile', 'Profile']
]

export default function AppShell() {
  const { activeChild } = useAuth()
  const school = activeChild?.school

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: school?.brand_color || 'var(--fill-primary)', color: '#fff', padding: '14px 18px' }}>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>{school?.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 600 }}>{activeChild ? activeChild.name : ''}</p>
      </div>
      <div style={{ flex: 1, paddingBottom: 70 }}>
        <Outlet />
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--surface-1)', borderTop: '0.5px solid var(--border)', display: 'flex' }}>
        {NAV.map(([to, label]) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 11,
              color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 400, textDecoration: 'none'
            })}>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
