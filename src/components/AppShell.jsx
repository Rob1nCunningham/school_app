import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

export default function AppShell() {
  const { school, staffMember, isTeacher, signOut } = useAuth()

  const links = isTeacher
    ? [['/class-page', 'My class page'], ['/messages', 'Messages']]
    : [
        ['/dashboard', 'Dashboard'],
        ['/messages', 'Messages'],
        ['/calendar', 'Calendar'],
        ['/term-dates', 'Term dates'],
        ['/consent', 'Consent and absence'],
        ['/newsletters', 'Newsletters'],
        ['/letters', 'Letters home'],
        ['/class-pages', 'Class pages'],
        ['/surveys', 'Surveys'],
        ['/students', 'Students']
      ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 200, flexShrink: 0, background: 'var(--surface-1)', borderRight: '0.5px solid var(--border)', padding: '14px 10px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 14px', borderBottom: '0.5px solid var(--border)', marginBottom: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: school?.brand_color || '#2F6FE0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
            {school?.initials}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{school?.name}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => ({
                textAlign: 'left', background: isActive ? 'var(--surface-2)' : 'none', border: 'none',
                padding: '9px 10px', borderRadius: 8, fontSize: 13, textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isActive ? 500 : 400
              })}>
              {label}
            </NavLink>
          ))}
        </div>
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 10, marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 500, margin: '0 0 2px', color: 'var(--text-accent)' }}>
            {isTeacher ? 'Teacher' : 'Admin'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 8px', wordBreak: 'break-all' }}>
            {staffMember?.full_name}
          </p>
          <button onClick={signOut} style={{ width: '100%' }}>Log out</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  )
}
