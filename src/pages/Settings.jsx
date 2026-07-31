import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Settings() {
  const { school, refreshStaffMember } = useAuth()
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!school) return
    setName(school.name || '')
    setWebsiteUrl(school.website_url || '')
    setLogoUrl(school.logo_url || '')
  }, [school])

  async function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const path = `logos/${school.id}-${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('attachments').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path)
      setLogoUrl(pub.publicUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const { error } = await supabase.from('schools').update({
        name: name.trim(),
        website_url: websiteUrl.trim() || null,
        logo_url: logoUrl || null
      }).eq('id', school.id)
      if (error) throw error
      await refreshStaffMember()
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Settings</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        School name, logo and website link — these show up on the child card in the parent app.
      </p>

      <form onSubmit={handleSave} style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 16, maxWidth: 420 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>School name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Website URL</label>
        <input type="url" placeholder="https://www.yourschool.co.uk" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
          style={{ width: '100%', marginBottom: 14 }} />

        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Logo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10, background: school?.brand_color || 'var(--fill-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden'
          }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{school?.initials}</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: 12 }} />
        </div>
        {uploading && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px' }}>Uploading…</p>}

        {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '0 0 12px' }}>{error}</p>}
        {saved && <p style={{ fontSize: 12, color: 'var(--text-success)', margin: '0 0 12px' }}>Saved.</p>}

        <button type="submit" disabled={busy || uploading} style={{ background: 'var(--fill-primary)', color: 'var(--on-primary)', border: 'none' }}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
