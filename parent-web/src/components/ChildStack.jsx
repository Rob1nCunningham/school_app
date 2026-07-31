import { useAuth } from '../lib/AuthContext.jsx'

const PEEK = 34
const CARD_H = 150

export default function ChildStack() {
  const { kids, activeChildId, setActiveChildId } = useAuth()
  if (!kids || kids.length === 0) return null

  const active = kids.find((k) => k.id === activeChildId) || kids[0]
  const others = kids.filter((k) => k.id !== active.id)
  const order = [active, ...others] // pos 0 = front/active
  const n = order.length

  return (
    <div style={{ position: 'relative', height: CARD_H + (n - 1) * PEEK, margin: '0 0 16px' }}>
      {order.map((k, pos) => {
        const top = (n - 1 - pos) * PEEK
        const z = n - pos
        const initials = k.name.split(' ').map((p) => p[0]).slice(0, 2).join('')
        return (
          <div key={k.id} onClick={() => setActiveChildId(k.id)}
            style={{
              position: 'absolute', top, left: 0, right: 0, height: CARD_H,
              borderRadius: 16, background: k.school?.brand_color || 'var(--fill-primary)',
              zIndex: z, boxShadow: pos === 0 ? '0 6px 16px rgba(0,0,0,0.16)' : '0 6px 16px rgba(0,0,0,0.08)',
              cursor: n > 1 ? 'pointer' : 'default', transition: 'top 0.25s ease',
              padding: '8px 16px 16px', boxSizing: 'border-box', color: '#fff'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                {initials}
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>{k.name}</p>
            </div>
            {pos === 0 && (
              <p style={{ margin: '10px 0 0 30px', fontSize: 11, opacity: 0.85 }}>
                {k.school?.name} · {k.className}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
