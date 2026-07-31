import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { emptyAudience, saveAudienceTargets } from '../lib/audience.js'

const PRESETS = ['INSET day', 'Term starts', 'Term ends', 'Half term', 'Bank holiday', 'Custom…']

function formatRange(startsAt, endsAt) {
  const start = new Date(startsAt)
  const opts = { weekday: 'short', day: 'numeric', month: 'short' }
  if (!endsAt) return start.toLocaleDateString(undefined, opts)
  const end = new Date(endsAt)
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
}

export default function TermDates() {
  const { school } = useAuth()
  const [items, setItems] = useState([])
  const [preset, setPreset] = useState('INSET day')
  const [label, setLabel] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    if (!school) return
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('school_id', school.id)
      .eq('category', 'term_date')
      .order('starts_at', { ascending: true })
    setItems(data || [])
  }

  useEffect(() => { refresh() }, [school])

  const effectiveLabel = preset === 'Custom…' ? label : preset

  async function handleSubmit(e) {
    e.preventDefault()
    if (!effectiveLabel.trim() || !startDate) return
    setBusy(true)
    setError(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: ev, error: evErr } = await supabase.from('events').insert({
        school_id: school.id,
        title: effectiveLabel.trim(),
        starts_at: `${startDate}T00:00:00`,
        ends_at: endDate ? `${endDate}T23:59:59` : null,
        all_day: true,
        category: 'term_date',
        created_by: userData.user.id
      }).select().single()
      if (evErr) throw evErr
      // Term dates always apply to the whole school.
      await saveAudienceTargets(supabase, 'event', ev.id, emptyAudience())

      setLabel('')
      setStartDate('')
      setEndDate('')
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    await supabase.from('events').delete().eq('id', id)
    refresh()
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Term dates</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        Inset days, term start/end, and holidays for {school?.name}. These automatically appear in every parent's Calendar and synced calendar feed, plus a quick-glance summary in the app.
      </p>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>Add a date</p>
        <form onSubmit={handleSubmit}>
          <select value={preset} onChange={(e) => setPreset(e.target.value)} style={{ width: '100%', marginBottom: 8 }}>
            {PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {preset === 'Custom…' && (
            <input type="text" placeholder="Label, e.g. Non-uniform day" value={label} onChange={(e) => setLabel(e.target.value)}
              style={{ width: '100%', marginBottom: 8 }} />
          )}
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }} />
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
            End date (optional — for a holiday or half term spanning several days)
          </label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }} />
          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '0 0 12px' }}>{error}</p>}
          <button type="submit" disabled={busy} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
            {busy ? 'Saving…' : 'Add term date'}
          </button>
        </form>
      </div>

      <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 10px' }}>Upcoming</p>
      {items.map((item) => (
        <div key={item.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, maxWidth: 480, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{item.title}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{formatRange(item.starts_at, item.ends_at)}</p>
          </div>
          <button onClick={() => remove(item.id)} style={{ background: 'var(--bg-danger)', color: 'var(--text-danger)', border: 'none', fontSize: 12, flexShrink: 0 }}>
            Remove
          </button>
        </div>
      ))}
      {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No term dates added yet.</p>}
    </div>
  )
}
