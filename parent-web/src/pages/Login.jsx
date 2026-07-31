import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function Login({ initialMode = 'signin', onBack }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Account created. If email confirmation is on, check your inbox, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          {mode === 'signin' ? 'Sign in to see what\'s happening at your child\'s school.' : 'Create your parent account.'}
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ width: '100%', display: 'block', margin: '4px 0 12px' }} />
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            style={{ width: '100%', display: 'block', margin: '4px 0 16px' }} />
          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '0 0 12px' }}>{error}</p>}
          {info && <p style={{ fontSize: 12, color: 'var(--text-success)', margin: '0 0 12px' }}>{info}</p>}
          <button type="submit" disabled={busy}
            style={{ width: '100%', background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
          style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-accent)' }}>
          {mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in'}
        </button>
        {onBack && (
          <button onClick={onBack} style={{ width: '100%', marginTop: 4, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12 }}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}
