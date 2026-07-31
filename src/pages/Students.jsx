import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Students() {
  const { school } = useAuth()
  const [groups, setGroups] = useState([])
  const [invitesByStudent, setInvitesByStudent] = useState({})
  const [openStudentId, setOpenStudentId] = useState(null)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    if (!school) return
    const { data } = await supabase
      .from('students')
      .select('id, first_name, last_name, classes(name, year_groups(name, sort_order))')
      .eq('school_id', school.id)
    const byClass = {}
    ;(data || []).forEach((st) => {
      const key = `${st.classes?.year_groups?.name} · ${st.classes?.name}`
      if (!byClass[key]) byClass[key] = { key, sort: st.classes?.year_groups?.sort_order ?? 0, students: [] }
      byClass[key].students.push(st)
    })
    setGroups(Object.values(byClass).sort((a, b) => a.sort - b.sort || a.key.localeCompare(b.key)))

    const { data: invites } = await supabase.from('parent_invites').select('*').eq('school_id', school.id)
    const map = {}
    ;(invites || []).forEach((inv) => {
      if (!map[inv.student_id]) map[inv.student_id] = []
      map[inv.student_id].push(inv)
    })
    setInvitesByStudent(map)
  }

  useEffect(() => { load() }, [school])

  function toggleOpen(id) {
    setOpenStudentId(openStudentId === id ? null : id)
    setEmail('')
    setError(null)
  }

  async function sendInvite(studentId) {
    if (!email.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { error } = await supabase.from('parent_invites').insert({
        school_id: school.id,
        student_id: studentId,
        email: email.trim().toLowerCase(),
        invited_by: userData.user.id
      })
      if (error) throw error
      setEmail('')
      setOpenStudentId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Students</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        The live roster at {school?.name}. Click a student to invite a parent.
      </p>
      {groups.map((g) => (
        <div key={g.key} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500 }}>{g.key} · {g.students.length} students</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {g.students.map((st) => {
              const isOpen = openStudentId === st.id
              const invites = invitesByStudent[st.id] || []
              return (
                <div key={st.id}>
                  <button onClick={() => toggleOpen(st.id)}
                    style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 12, padding: '6px 10px' }}>
                    <span>{st.first_name} {st.last_name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {invites.length === 0 ? 'No parent linked' : invites.map((i) => `${i.email} (${i.status})`).join(', ')}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8, marginTop: 4, display: 'flex', gap: 8 }}>
                      <input type="email" placeholder="parent@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                        style={{ flex: 1, fontSize: 12 }} />
                      <button disabled={busy} onClick={() => sendInvite(st.id)}
                        style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none', fontSize: 12 }}>
                        {busy ? 'Sending…' : 'Invite parent'}
                      </button>
                    </div>
                  )}
                  {isOpen && error && <p style={{ fontSize: 11, color: 'var(--text-danger)', margin: '4px 0 0 10px' }}>{error}</p>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {groups.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No students yet — run seed_and_bootstrap.sql to add the demo roster.</p>}
    </div>
  )
}
