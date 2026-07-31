import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

export default function AddChild() {
  const { user, kids, refreshKids, signOut } = useAuth()
  const [checking, setChecking] = useState(false)
  const navigate = useNavigate()

  async function checkAgain() {
    setChecking(true)
    await refreshKids()
    setChecking(false)
  }

  useEffect(() => {
    checkAgain()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const linked = kids && kids.length > 0

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>
          {linked ? "You're all set" : 'Waiting to be linked'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          {linked
            ? `${kids.length === 1 ? 'A new child has' : 'New children have'} been linked to your account.`
            : `Signed in as ${user?.email}. Your child's school needs to link your account before you can see anything — ask the school office to add you as a parent contact, then check again here.`}
        </p>

        {linked ? (
          <button onClick={() => navigate('/home')} style={{ width: '100%', background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            Continue
          </button>
        ) : (
          <button onClick={checkAgain} disabled={checking} style={{ width: '100%', background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {checking ? 'Checking…' : 'Check again'}
          </button>
        )}

        <button onClick={signOut} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-accent)' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
