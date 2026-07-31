import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function AddChild() {
  const { user, kids, refreshKids, signOut } = useAuth()
  const [step, setStep] = useState('school') // 'school' | 'child'
  const [schoolQuery, setSchoolQuery] = useState('')
  const [schools, setSchools] = useState([])
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [childQuery, setChildQuery] = useState('')
  const [matches, setMatches] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function searchSchools(q) {
    setSchoolQuery(q)
    if (q.trim().length < 2) {
      setSchools([])
      return
    }
    const { data } = await supabase.from('schools').select('*').ilike('name', `%${q}%`).limit(10)
    setSchools(data || [])
  }

  function pickSchool(s) {
    setSelectedSchool(s)
    setStep('child')
  }

  async function searchChild(q) {
    setChildQuery(q)
    if (q.trim().length < 2) {
      setMatches([])
      return
    }
    const [first, ...rest] = q.trim().split(' ')
    let query = supabase.from('students').select('id, first_name, last_name, classes(name)').eq('school_id', selectedSchool.id)
    if (rest.length) {
      query = query.ilike('first_name', `%${first}%`).ilike('last_name', `%${rest.join(' ')}%`)
    } else {
      query = query.or(`first_name.ilike.%${first}%,last_name.ilike.%${first}%`)
    }
    const { data } = await query.limit(10)
    setMatches((data || []).filter((st) => !(kids || []).find((k) => k.id === st.id)))
  }

  async function linkChild(student) {
    setBusy(true)
    setError(null)
    try {
      const { error } = await supabase.from('parent_children').insert({ parent_id: user.id, student_id: student.id })
      if (error) throw error
      await refreshKids()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>
          {step === 'school' ? "Find your child's school" : `Find your child at ${selectedSchool.name}`}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
          {step === 'school' ? 'Search by school name.' : "Search by your child's name."}
        </p>

        {step === 'school' && (
          <>
            <input type="text" placeholder="e.g. Oakwood" value={schoolQuery} onChange={(e) => searchSchools(e.target.value)}
              style={{ width: '100%', marginBottom: 12 }} />
            {schools.map((s) => (
              <button key={s.id} onClick={() => pickSchool(s)}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 6 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: s.brand_color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                  {s.initials}
                </span>
                <span>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.town}</div>
                </span>
              </button>
            ))}
          </>
        )}

        {step === 'child' && (
          <>
            <input type="text" placeholder="Child's full name" value={childQuery} onChange={(e) => searchChild(e.target.value)}
              style={{ width: '100%', marginBottom: 12 }} />
            {matches.map((st) => (
              <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-1)', borderRadius: 10, padding: '10px 12px', marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{st.first_name} {st.last_name} · {st.classes?.name}</span>
                <button disabled={busy} onClick={() => linkChild(st)} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none', fontSize: 12 }}>
                  This is my child
                </button>
              </div>
            ))}
            {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '8px 0' }}>{error}</p>}
            <button onClick={() => setStep('school')} style={{ width: '100%', marginTop: 8 }}>Back to school search</button>
          </>
        )}

        <button onClick={signOut} style={{ width: '100%', marginTop: 16, background: 'none', border: 'none', color: 'var(--text-accent)' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
