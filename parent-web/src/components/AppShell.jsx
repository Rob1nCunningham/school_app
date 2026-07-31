import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'

const NAV = [
  ['/home', 'Home', 'ti-home-2'],
  ['/messages', 'Messages', 'ti-message-circle'],
  ['/calendar', 'Calendar', 'ti-calendar'],
  ['/profile', 'Profile', 'ti-user-circle']
]

export default function AppShell() {
  const { activeChild } = useAuth()
  const school = activeChild?.school
  const [unread, setUnread] = useState(0)
  const location = useLocation()
  const isHome = location.pathname === '/home'

  useEffect(() => {
    if (!activeChild) return
    supabase
      .from('message_reads')
      .select('message_id', { count: 'exact', head: true })
      .eq('student_id', activeChild.id)
      .is('read_at', null)
      .then(({ count }) => setUnread(count || 0))
  }, [activeChild])

  const initials = activeChild ? activeChild.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : ''

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column' }}>
      {!isHome && (
        <div style={{ background: school?.brand_color || 'var(--fill-primary)', color: '#fff', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>{school?.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 600 }}>{activeChild ? activeChild.name : ''}</p>
          </div>
        </div>
      )}
      <div style={{ flex: 1, paddingBottom: 70 }}>
        <Outlet />
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--surface-1)', borderTop: '0.5px solid var(--border)', display: 'flex' }}>
        {NAV.map(([to, label, icon]) => (
          <NavLink key={to} to={to}
            style={({ isActive }) => ({
              flex: 1, textAlign: 'center', padding: '8px 0 10px', fontSize: 11,
              color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 400, textDecoration: 'none'
            })}>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 20, display: 'block' }} />
              {to === '/messages' && unread > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -6, minWidth: 14, height: 14, borderRadius: 7, background: 'var(--fill-danger)', color: 'var(--on-danger)', fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                  {unread}
                </span>
              )}
            </span>
            <span style={{ display: 'block', marginTop: 2 }}>{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
