import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import AudiencePicker from '../components/AudiencePicker.jsx'
import { emptyAudience, resolveAudience, saveAudienceTargets, loadClassesAndRoster } from '../lib/audience.js'

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function Calendar() {
  const { school } = useAuth()
  const [yearGroups, setYearGroups] = useState([])
  const [roster, setRoster] = useState([])
  const [audience, setAudience] = useState(emptyAudience())
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [file, setFile] = useState(null)
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!school) return
    loadClassesAndRoster(supabase, school.id).then(({ yearGroups, roster }) => {
      setYearGroups(yearGroups)
      setRoster(roster)
    })
    refreshEvents()
  }, [school])

  async function refreshEvents() {
    if (!school) return
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('school_id', school.id)
      .order('starts_at', { ascending: true })
    setEvents(data || [])
  }

  const targetStudents = useMemo(() => resolveAudience(roster, audience), [roster, audience])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !startsAt || targetStudents.length === 0) return
    setBusy(true)
    setError(null)
    try {
      let attachmentUrl = null
      let attachmentName = null
      if (file) {
        const path = `${school.id}/${Date.now()}-${file.name}`
        const { error: upErr } = await supabase.storage.from('attachments').upload(path, file)
        if (upErr) throw upErr
        const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path)
        attachmentUrl = pub.publicUrl
        attachmentName = file.name
      }

      const { data: userData } = await supabase.auth.getUser()
      const { data: ev, error: evErr } = await supabase.from('events').insert({
        school_id: school.id,
        title,
        starts_at: startsAt,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        created_by: userData.user.id
      }).select().single()
      if (evErr) throw evErr
      await saveAudienceTargets(supabase, 'event', ev.id, audience)

      setTitle('')
      setStartsAt('')
      setFile(null)
      setAudience(emptyAudience())
      await refreshEvents()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function removeEvent(id) {
    await supabase.from('events').delete().eq('id', id)
    refreshEvents()
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Calendar</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>Events at {school?.name}.</p>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>Add event</p>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }} />
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }} />
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Attachment (optional) — permission slip, itinerary, flyer
            </label>
            <input type="file" onChange={(e) => setFile(e.target.files[0] || null)} style={{ width: '100%', fontSize: 12 }} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 8px' }}>Visible to</p>
          <AudiencePicker yearGroups={yearGroups} roster={roster} audience={audience} setAudience={setAudience} targetCount={targetStudents.length} />
          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '0 0 12px' }}>{error}</p>}
          <button type="submit" disabled={busy} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Saving…' : 'Add to calendar'}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>Upcoming</p>
      {events.map((e) => (
        <div key={e.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, maxWidth: 480, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{e.title}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(e.starts_at).toLocaleString()}</p>
            {e.attachment_url && (
              <a href={e.attachment_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 8, textDecoration: 'none', marginTop: 6 }}>
                {e.attachment_name}
              </a>
            )}
          </div>
          <button onClick={() => removeEvent(e.id)} style={{ background: 'var(--bg-danger)', color: 'var(--text-danger)', border: 'none', fontSize: 12, flexShrink: 0 }}>
            Remove
          </button>
        </div>
      ))}
      {events.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No events scheduled.</p>}
    </div>
  )
}
