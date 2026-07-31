export default function Welcome({ onSignIn, onCreateAccount }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--surface-1)', borderRadius: 28, padding: '36px 24px 28px', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', height: 280 }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 76, height: 76, borderRadius: 22, background: 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-building-community" aria-hidden="true" style={{ fontSize: 34, color: 'var(--text-accent)' }} />
          </div>
          <div style={{ position: 'absolute', top: 60, left: 12, width: 58, height: 58, borderRadius: 18, background: 'var(--bg-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-message-circle" aria-hidden="true" style={{ fontSize: 26, color: 'var(--text-success)' }} />
          </div>
          <div style={{ position: 'absolute', top: 44, right: 6, width: 58, height: 58, borderRadius: 18, background: '#FAECE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-calendar" aria-hidden="true" style={{ fontSize: 26, color: '#993C1D' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 34, left: 0, width: 52, height: 52, borderRadius: 16, background: 'var(--bg-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-shield-check" aria-hidden="true" style={{ fontSize: 24, color: 'var(--text-warning)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 20, right: 8, width: 52, height: 52, borderRadius: 16, background: '#FBEAF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-news" aria-hidden="true" style={{ fontSize: 24, color: '#993556' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 150, height: 150, borderRadius: '50%', background: 'var(--fill-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-mood-smile" aria-hidden="true" style={{ fontSize: 76, color: 'var(--on-primary)' }} />
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', margin: '20px 0 6px', fontFamily: "'Poppins',sans-serif" }}>
          School App
        </p>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 28px' }}>
          Everything from school, in one place.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onSignIn}
            style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none', fontSize: 14, fontWeight: 600, padding: 14, borderRadius: 26 }}>
            Sign in
          </button>
          <button onClick={onCreateAccount}
            style={{ background: 'var(--surface-1)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, padding: 14, borderRadius: 26, border: '1px solid var(--border)' }}>
            I've been invited — create account
          </button>
        </div>
      </div>
    </div>
  )
}
