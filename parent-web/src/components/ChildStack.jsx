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
        return (
          <div key={k.id} onClick={() => setActiveChildId(k.id)}
            style={{
              position: 'absolute', top, left: 0, right: 0, height: CARD_H,
              borderRadius: 16, background: k.school?.brand_color || 'var(--fill-primary)',
              zIndex: z, boxShadow: pos === 0 ? '0 6px 16px rgba(0,0,0,0.16)' : '0 6px 16px rgba(0,0,0,0.08)',
              cursor: n > 1 ? 'pointer' : 'default', transition: 'top 0.25s ease',
              padding: '14px 16px 16px', boxSizing: 'border-box', color: '#fff',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                <i className="ti ti-user" aria-hidden="true"
                  style={{ fontSize: 18, color: k.school?.brand_color || 'var(--fill-primary)' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>{k.name}</p>
                {pos === 0 && (
                  <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.85 }}>
                    {k.school?.name} · {k.className}
                  </p>
                )}
              </div>
            </div>

            {pos === 0 && k.school?.website_url && (
              <a
                href={k.school.website_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.16)', color: '#fff', fontSize: 12, fontWeight: 500,
                  padding: '8px 14px', borderRadius: 20, textDecoration: 'none'
                }}>
                Visit school website
                <i className="ti ti-external-link" aria-hidden="true" style={{ fontSize: 14 }} />
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
