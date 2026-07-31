import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Consent() {
  const { activeChild } = useAuth()
  const [forms, setForms] = useState([])
  const [responses, setResponses] = useState({})

  async function load() {
    if (!activeChild?.school) return
    const { data: formRows } = await supabase
      .from('consent_forms')
      .select('*')
      .eq('school_id', activeChild.school.id)
      .order('due_date', { ascending: true })
    setForms(formRows || [])
    if (formRows && formRows.length) {
      const { data: rows } = await supabase
        .from('consent_responses')
        .select('consent_form_id, responded')
        .eq('student_id', activeChild.id)
        .in('consent_form_id', formRows.map((f) => f.id))
      const map = {}
      ;(rows || []).forEach((r) => { map[r.consent_form_id] = r.responded })
      setResponses(map)
    }
  }

  useEffect(() => { load() }, [activeChild])

  async function respond(formId) {
    await supabase.from('consent_responses').update({ responded: true, responded_at: new Date().toISOString() })
      .eq('consent_form_id', formId).eq('student_id', activeChild.id)
    setResponses((r) => ({ ...r, [formId]: true }))
  }

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Consent & absence</h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>For {activeChild?.name}.</p>
      {forms.map((f) => {
        const responded = responses[f.id]
        return (
          <div key={f.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{f.title}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>Due {new Date(f.due_date).toLocaleDateString()}</p>
            {f.detail && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{f.detail}</p>}
            {responded ? (
              <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: 'var(--text-success)', background: 'var(--bg-success)', padding: '3px 10px', borderRadius: 8 }}>
                Responded
              </span>
            ) : (
              <button onClick={() => respond(f.id)} style={{ marginTop: 8, background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none', fontSize: 12 }}>
                Give consent
              </button>
            )}
          </div>
        )
      })}
      {forms.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing needs a response right now.</p>}
    </div>
  )
}
