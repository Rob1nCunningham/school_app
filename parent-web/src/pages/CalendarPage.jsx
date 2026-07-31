import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { downloadEventIcs } from '../lib/ics.js'

const FEED_BASE = 'https://xjlcvzmkihuqvpbafpdg.supabase.co/functions/v1/calendar-feed'

export default function CalendarPage() {
  const { user, activeChild } = useAuth()
  const [events, setEvents] = useState([])
  const [feedUrl, setFeedUrl] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showSubscribe, setShowSubscribe] = useState(false)

  useEffect(() => {
    if (!activeChild?.school) return
    supabase
      .from('events')
      .select('*')
      .eq('school_id', activeChild.school.id)
      .order('starts_at', { ascending: true })
      .then(({ data }) => setEvents(data || []))
  }, [activeChild])

  async function getFeedUrl() {
    let { data } = await supabase.from('calendar_feed_tokens').select('token').eq('parent_id', user.id).maybeSingle()
    if (!data) {
      const { data: inserted } = await supabase.from('calendar_feed_tokens').insert({ parent_id: user.id }).select('token').single()
      data = inserted
    }
    setFeedUrl(`${FEED_BASE}?token=${data.token}`)
    setShowSubscribe(true)
  }

  function copyFeedUrl() {
    navigator.clipboard.writeText(feedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ padding: 18 }}>
      <h1 style={{ fontSize: 18, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-calendar" aria-hidden="true" style={{ fontSize: 18, color: '#1d9e75' }} />Calendar
      </h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>For {activeChild?.name}.</p>

      <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
        {!showSubscribe ? (
          <button onClick={getFeedUrl} style={{ width: '100%' }}>
            <i className="ti ti-refresh" aria-hidden="true" style={{ fontSize: 14, marginRight: 6, verticalAlign: -2 }} />
            Subscribe with your calendar app
          </button>
        ) : (
          <>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 500 }}>Your personal calendar link</p>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text-secondary)' }}>
              Add this as a subscribed calendar in Apple Calendar or Google Calendar and new events appear automatically — no need to add each one by hand.
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <input readOnly value={feedUrl} onFocus={(e) => e.target.select()} style={{ flex: 1, fontSize: 11 }} />
              <button onClick={copyFeedUrl} style={{ flexShrink: 0 }}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
          </>
        )}
      </div>

      {events.map((e) => (
        <div key={e.id} style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{e.title}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(e.starts_at).toLocaleString()}</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={() => downloadEventIcs(e)} style={{ fontSize: 11, padding: '4px 10px' }}>
              <i className="ti ti-calendar-plus" aria-hidden="true" style={{ fontSize: 12, marginRight: 4, verticalAlign: -1 }} />
              Add to calendar
            </button>
            {e.attachment_url && (
              <a href={e.attachment_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', fontSize: 11, background: 'var(--surface-2)', padding: '4px 10px', borderRadius: 8 }}>
                {e.attachment_name}
              </a>
            )}
          </div>
        </div>
      ))}
      {events.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nothing scheduled.</p>}
    </div>
  )
}
