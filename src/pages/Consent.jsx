import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import AudiencePicker from '../components/AudiencePicker.jsx'
import { emptyAudience, resolveAudience, saveAudienceTargets, loadClassesAndRoster } from '../lib/audience.js'

function rateColor(rate) {
  if (rate >= 75) return { text: 'var(--text-success)', bg: 'var(--bg-success)' }
  if (rate >= 45) return { text: 'var(--text-secondary)', bg: 'var(--surface-2)' }
  return { text: 'var(--text-danger)', bg: 'var(--bg-danger)' }
}

export default function Consent() {
  const { school } = useAuth()
  const [yearGroups, setYearGroups] = useState([])
  const [roster, setRoster] = useState([])
  const [audience, setAudience] = useState(emptyAudience())
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [due, setDue] = useState('')
  const [forms, setForms] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!school) return
    loadClassesAndRoster(supabase, school.id).then(({ yearGroups, roster }) => {
      setYearGroups(yearGroups)
      setRoster(roster)
    })
    refreshForms()
  }, [school])

  async function refreshForms() {
    if (!school) return
    const { data: formRows } = await supabase
      .from('consent_forms')
      .select('*')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false })
    if (!formRows) return
    const withBreakdown = await Promise.all(
      formRows.map(async (f) => {
        const { data: responses } = await supabase
          .from('consent_responses')
          .select('responded, students(class_id, classes(name))')
          .eq('consent_form_id', f.id)
        const byClass = {}
        ;(responses || []).forEach((r) => {
          const cls = r.students?.classes?.name || 'Unknown'
          if (!byClass[cls]) byClass[cls] = { cls, recipients: 0, responded: 0 }
          byClass[cls].recipients += 1
          if (r.responded) byClass[cls].responded += 1
        })
        return { ...f, breakdown: Object.values(byClass) }
      })
    )
    setForms(withBreakdown)
  }

  const targetStudents = useMemo(() => resolveAudience(roster, audience), [roster, audience])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !due || targetStudents.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: form, error: formErr } = await supabase.from('consent_forms').insert({
        school_id: school.id,
        title,
        detail,
        due_date: due,
        created_by: userData.user.id
      }).select().single()
      if (formErr) throw formErr
      await saveAudienceTargets(supabase, 'consent_form', form.id, audience)

      const responseRows = targetStudents.map((st) => ({ consent_form_id: form.id, student_id: st.id, responded: false }))
      const { error: respErr } = await supabase.from('consent_responses').insert(responseRows)
      if (respErr) throw respErr

      setTitle('')
      setDetail('')
      setDue('')
      setAudience(emptyAudience())
      await refreshForms()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function logResponse(formId, cls) {
    const { data: candidates } = await supabase
      .from('consent_responses')
      .select('student_id, students!inner(class_id, classes!inner(name))')
      .eq('consent_form_id', formId)
      .eq('responded', false)
    const match = (candidates || []).find((c) => c.students?.classes?.name === cls)
    if (!match) return
    await supabase.from('consent_responses').update({ responded: true, responded_at: new Date().toISOString() })
      .eq('consent_form_id', formId).eq('student_id', match.student_id)
    refreshForms()
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Consent and absence</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>Forms parents need to respond to at {school?.name}.</p>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>New consent form</p>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }} />
          <textarea placeholder="Details" value={detail} onChange={(e) => setDetail(e.target.value)}
            style={{ width: '100%', minHeight: 60, marginBottom: 8 }} />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
            style={{ width: '100%', marginBottom: 14 }} />
          <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 8px' }}>Send to</p>
          <AudiencePicker yearGroups={yearGroups} roster={roster} audience={audience} setAudience={setAudience} targetCount={targetStudents.length} />
          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '0 0 12px' }}>{error}</p>}
          <button type="submit" disabled={busy} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Publishing…' : 'Publish to parents'}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>Published forms</p>
      {forms.map((f) => {
        const total = f.breakdown.reduce((n, r) => n + r.recipients, 0)
        const responded = f.breakdown.reduce((n, r) => n + r.responded, 0)
        const rate = total ? Math.round((responded / total) * 100) : 0
        const colors = rateColor(rate)
        const expanded = expandedId === f.id
        return (
          <div key={f.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, maxWidth: 480 }}>
            <div onClick={() => setExpandedId(expanded ? null : f.id)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{f.title}</p>
                <span style={{ fontSize: 11, color: colors.text, background: colors.bg, padding: '2px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}>
                  {responded} of {total} responded
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>Due {new Date(f.due_date).toLocaleDateString()}</p>
              {f.detail && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{f.detail}</p>}
            </div>
            {expanded && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
                {f.breakdown.map((r) => {
                  const rRate = r.recipients ? Math.round((r.responded / r.recipients) * 100) : 0
                  const rc = rateColor(rRate)
                  return (
                    <div key={r.cls} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                      <p style={{ margin: 0, fontSize: 12, width: 70, flexShrink: 0 }}>{r.cls}</p>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: rc.text, width: `${rRate}%` }} />
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', width: 70, textAlign: 'right', flexShrink: 0 }}>{r.responded} of {r.recipients}</p>
                      {r.responded < r.recipients && (
                        <button onClick={() => logResponse(f.id, r.cls)} style={{ fontSize: 11, padding: '4px 8px' }}>Log response</button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      {forms.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No consent forms published yet.</p>}
    </div>
  )
}
