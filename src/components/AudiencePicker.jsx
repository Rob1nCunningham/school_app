import { useState } from 'react'

export default function AudiencePicker({ yearGroups, roster, audience, setAudience, targetCount }) {
  const [expanded, setExpanded] = useState([])

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

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
        <input type="checkbox" checked={audience.all} onChange={toggleAll} /> All parents
      </label>

      <div style={{ opacity: audience.all ? 0.4 : 1, marginBottom: 10 }}>
        {yearGroups.map((g) => (
          <div key={g.id} style={{ marginBottom: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '3px 0' }}>
              <input type="checkbox" checked={audience.yearGroups.includes(g.id)} onChange={() => toggleYearGroup(g.id)} disabled={audience.all} />
              {g.name}
            </label>
            {g.classes.map((c) => {
              const ygChecked = audience.yearGroups.includes(g.id)
              const clsChecked = ygChecked || audience.classes.includes(c.id)
              const isExpanded = expanded.includes(c.id)
              return (
                <div key={c.id} style={{ marginLeft: 20 }}>
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
        Reaches <strong style={{ color: 'var(--text-primary)' }}>{targetCount}</strong> {targetCount === 1 ? 'family' : 'families'}
      </p>
    </div>
  )
}
