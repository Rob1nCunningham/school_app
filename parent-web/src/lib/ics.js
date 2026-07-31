function icsDate(d) {
  return new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}
function escapeText(s) {
  return String(s || '').replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n')
}

export function downloadEventIcs(event) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//School App//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:' + event.id + '@school-app',
    'DTSTAMP:' + icsDate(new Date()),
    'DTSTART:' + icsDate(event.starts_at),
    'SUMMARY:' + escapeText(event.title),
    'END:VEVENT',
    'END:VCALENDAR'
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
