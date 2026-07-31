import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Students() {
  const { school } = useAuth()
  const [groups, setGroups] = useState([])

  useEffect(() => {
    if (!school) return
    supabase
      .from('students')
      .select('id, first_name, last_name, classes(name, year_groups(name, sort_order))')
      .eq('school_id', school.id)
      .then(({ data }) => {
        const byClass = {}
        ;(data || []).forEach((st) => {
          const key = `${st.classes?.year_groups?.name} · ${st.classes?.name}`
          if (!byClass[key]) byClass[key] = { key, sort: st.classes?.year_groups?.sort_order ?? 0, students: [] }
          byClass[key].students.push(st)
        })
        setGroups(Object.values(byClass).sort((a, b) => a.sort - b.sort || a.key.localeCompare(b.key)))
      })
  }, [school])

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Students</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        The live roster at {school?.name}, seeded from Supabase.
      </p>
      {groups.map((g) => (
        <div key={g.key} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500 }}>{g.key} · {g.students.length} students</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {g.students.map((st) => (
              <span key={st.id} style={{ fontSize: 12, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 8 }}>
                {st.first_name} {st.last_name}
              </span>
            ))}
          </div>
        </div>
      ))}
      {groups.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No students yet — run seed_and_bootstrap.sql to add the demo roster.</p>}
    </div>
  )
}
