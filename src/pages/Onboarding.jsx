import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Onboarding() {
  const { user, refreshStaffMember, signOut } = useAuth()
  const [schools, setSchools] = useState([])
  const [schoolId, setSchoolId] = useState('')
  const [role, setRole] = useState('admin')
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('schools').select('*').order('name').then(({ data }) => {
      setSchools(data || [])
      if (data && data[0]) setSchoolId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!schoolId) return
    supabase.from('classes').select('*, year_groups(name, sort_order)').eq('school_id', schoolId)
      .then(({ data }) => {
        const sorted = (data || []).sort((a, b) => (a.year_groups?.sort_order ?? 0) - (b.year_groups?.sort_order ?? 0) || a.name.localeCompare(b.name))
        setClasses(sorted)
        if (sorted[0]) setClassId(sorted[0].id)
      })
  }, [schoolId])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const { error } = await supabase.from('staff_members').insert({
        user_id: user.id,
        school_id: schoolId,
        role,
        class_id: role === 'teacher' ? classId : null,
        full_name: user.email
      })
      if (error) throw error
      await refreshStaffMember()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>Complete your account</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          Signed in as {user?.email}. Tell us which school and role.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>School</label>
          <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}
            style={{ width: '100%', display: 'block', margin: '4px 0 12px' }}>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', display: 'block', margin: '4px 0 12px' }}>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
          </select>

          {role === 'teacher' && (
            <>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Class</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)}
                style={{ width: '100%', display: 'block', margin: '4px 0 16px' }}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.year_groups?.name} · {c.name}</option>)}
              </select>
            </>
          )}

          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '0 0 12px' }}>{error}</p>}

          <button type="submit" disabled={busy}
            style={{ width: '100%', background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Please wait…' : 'Continue'}
          </button>
        </form>
        <button onClick={signOut} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-accent)' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
