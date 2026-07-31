import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

function emptyAudience() {
  return { all: true, yearGroups: [], classes: [], students: [] }
}

function resolveAudience(roster, audience) {
  if (audience.all) return roster
  return roster.filter(
    (st) =>
      audience.yearGroups.includes(st.year_group_id) ||
      audience.classes.includes(st.class_id) ||
      audience.students.includes(st.id)
  )
}

export default function Messages() {
  const { school, staffMember, isTeacher } = useAuth()
  const [yearGroups, setYearGroups] = useState([]) // [{id, name, classes:[{id,name}]}]
  const [roster, setRoster] = useState([]) // [{id, name, class_id, class_name, year_group_id, year_group_name}]
  const [audience, setAudience] = useState(
    isTeacher ? { all: false, yearGroups: [], classes: [staffMember.class_id], students: [] } : emptyAudience()
  )
  const [expanded, setExpanded] = useState([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!school) return
    supabase
      .from('classes')
      .select('id, name, year_group_id, year_groups(name, sort_order)')
      .eq('school_id', school.id)
      .then(({ data }) => {
        const byGroup = {}
        ;(data || []).forEach((c) => {
          const gid = c.year_group_id
          if (!byGroup[gid]) byGroup[gid] = { id: gid, name: c.year_groups?.name, sort: c.year_groups?.sort_order ?? 0, classes: [] }
          byGroup[gid].classes.push({ id: c.id, name: c.name })
        })
        setYearGroups(Object.values(byGroup).sort((a, b) => a.sort - b.sort))
      })
    supabase
      .from('students')
      .select('id, first_name, last_name, class_id, classes(name, year_group_id)')
      .eq('school_id', school.id)
      .then(({ data }) => {
        setRoster(
          (data || []).map((st) => ({
            id: st.id,
            name: `${st.first_name} ${st.last_name}`,
            class_id: st.class_id,
            class_name: st.classes?.name,
            year_group_id: st.classes?.year_group_id
          }))
        )
      })
    refreshSent()
  }, [school])

  async function refreshSent() {
    if (!school) return
    const { data: msgs } = await supabase
      .from('messages')
      .select('id, subject, body, created_at')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false })
    if (!msgs) return
    const withStats = await Promise.all(
      msgs.map(async (m) => {
        const { count: recipients } = await supabase
          .from('message_reads')
          .select('student_id', { count: 'exact', head: true })
          .eq('message_id', m.id)
        const { count: reads } = await supabase
          .from('message_reads')
          .select('student_id', { count: 'exact', head: true })
          .eq('message_id', m.id)
          .not('read_at', 'is', null)
        return { ...m, recipients: recipients || 0, reads: reads || 0 }
      })
    )
    setSent(withStats)
  }

  const targetStudents = useMemo(() => resolveAudience(roster, audience), [roster, audience])

  function toggleAll() {
    setAudience({ all: !audience.all, yearGroups: [], classes: [], students: [] })
  }
  function toggleYearGroup(id) {
    setAudience((a) => {
      const has = a.yearGroups.includes(id)
      return { ...a, all: false, yearGroups: has ? a.yearGroups.filter((x) => x !== id) : [...a.yearGroups, id] }
    })
  }
  function toggleClass(id) {
    setAudience((a) => {
      const has = a.classes.includes(id)
      return { ...a, all: false, classes: has ? a.classes.filter((x) => x !== id) : [...a.classes, id] }
    })
  }
  function toggleStudent(id) {
    setAudience((a) => {
      const has = a.students.includes(id)
      return { ...a, all: false, students: has ? a.students.filter((x) => x !== id) : [...a.students, id] }
    })
  }
  function toggleExpand(classId) {
    setExpanded((e) => (e.includes(classId) ? e.filter((x) => x !== classId) : [...e, classId]))
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!subject.trim() || !body.trim() || targetStudents.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const { data: msg, error: msgErr } = await supabase
        .from('messages')
        .insert({ school_id: school.id, subject, body, sent_by: (await supabase.auth.getUser()).data.user.id })
        .select()
        .single()
      if (msgErr) throw msgErr

      const targetRows = []
      if (audience.all) {
        targetRows.push({ content_type: 'message', content_id: msg.id, target_type: 'all', target_id: null })
      } else {
        audience.yearGroups.forEach((id) => targetRows.push({ content_type: 'message', content_id: msg.id, target_type: 'year_group', target_id: id }))
        audience.classes.forEach((id) => targetRows.push({ content_type: 'message', content_id: msg.id, target_type: 'class', target_id: id }))
        audience.students.forEach((id) => targetRows.push({ content_type: 'message', content_id: msg.id, target_type: 'student', target_id: id }))
      }
      const { error: targetErr } = await supabase.from('audience_targets').insert(targetRows)
      if (targetErr) throw targetErr

      const readRows = targetStudents.map((st) => ({ message_id: msg.id, student_id: st.id, read_at: null }))
      const { error: readErr } = await supabase.from('message_reads').insert(readRows)
      if (readErr) throw readErr

      setSubject('')
      setBody('')
      setAudience(isTeacher ? { all: false, yearGroups: [], classes: [staffMember.class_id], students: [] } : emptyAudience())
      await refreshSent()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Messages</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        {isTeacher ? 'Sent to parents in your class.' : `Sent to parents at ${school?.name}.`}
      </p>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>New message</p>
        <form onSubmit={handleSend}>
          <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }} />
          <textarea placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)}
            style={{ width: '100%', minHeight: 70, marginBottom: 14 }} />

          <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 8px' }}>Send to</p>

          {!isTeacher && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
              <input type="checkbox" checked={audience.all} onChange={toggleAll} /> All parents
            </label>
          )}

          <div style={{ opacity: !isTeacher && audience.all ? 0.4 : 1, marginBottom: 10 }}>
            {yearGroups.map((g) => (
              <div key={g.id} style={{ marginBottom: 4 }}>
                {!isTeacher && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '3px 0' }}>
                    <input type="checkbox" checked={audience.yearGroups.includes(g.id)} onChange={() => toggleYearGroup(g.id)} disabled={audience.all} />
                    {g.name}
                  </label>
                )}
                {g.classes
                  .filter((c) => !isTeacher || c.id === staffMember.class_id)
                  .map((c) => {
                    const ygChecked = audience.yearGroups.includes(g.id)
                    const clsChecked = ygChecked || audience.classes.includes(c.id)
                    const isExpanded = expanded.includes(c.id)
                    return (
                      <div key={c.id} style={{ marginLeft: isTeacher ? 0 : 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, flex: 1 }}>
                            <input type="checkbox" checked={clsChecked} disabled={ygChecked} onChange={() => toggleClass(c.id)} />
                            {c.name}
                          </label>
                          <button type="button" onClick={() => toggleExpand(c.id)} style={{ fontSize: 11, padding: '2px 8px' }}>
                            {isExpanded ? 'Hide students' : 'Students'}
                          </button>
                        </div>
                        {isExpanded &&
                          roster
                            .filter((st) => st.class_id === c.id)
                            .map((st) => (
                              <label key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '2px 0 2px 24px', color: clsChecked ? 'var(--text-muted)' : 'inherit' }}>
                                <input type="checkbox" checked={clsChecked || audience.students.includes(st.id)} disabled={clsChecked} onChange={() => toggleStudent(st.id)} />
                                {st.name}
                              </label>
                            ))}
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 14px' }}>
            Reaches <strong style={{ color: 'var(--text-primary)' }}>{targetStudents.length}</strong> {targetStudents.length === 1 ? 'family' : 'families'}
          </p>

          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '0 0 12px' }}>{error}</p>}

          <button type="submit" disabled={busy} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>Sent</p>
      {sent.map((m) => (
        <div key={m.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, maxWidth: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{m.subject}</p>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}>
              {m.reads} of {m.recipients} read
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(m.created_at).toLocaleString()}</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>{m.body}</p>
        </div>
      ))}
      {sent.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No messages sent yet.</p>}
    </div>
  )
}
