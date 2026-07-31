// Shared audience-targeting helpers used by Messages, Calendar and Consent.

export function emptyAudience() {
  return { all: true, yearGroups: [], classes: [], students: [] }
}

export function resolveAudience(roster, audience) {
  if (audience.all) return roster
  return roster.filter(
    (st) =>
      audience.yearGroups.includes(st.year_group_id) ||
      audience.classes.includes(st.class_id) ||
      audience.students.includes(st.id)
  )
}

export async function saveAudienceTargets(supabase, contentType, contentId, audience) {
  const rows = []
  if (audience.all) {
    rows.push({ content_type: contentType, content_id: contentId, target_type: 'all', target_id: null })
  } else {
    audience.yearGroups.forEach((id) => rows.push({ content_type: contentType, content_id: contentId, target_type: 'year_group', target_id: id }))
    audience.classes.forEach((id) => rows.push({ content_type: contentType, content_id: contentId, target_type: 'class', target_id: id }))
    audience.students.forEach((id) => rows.push({ content_type: contentType, content_id: contentId, target_type: 'student', target_id: id }))
  }
  const { error } = await supabase.from('audience_targets').insert(rows)
  if (error) throw error
}

export async function loadClassesAndRoster(supabase, schoolId) {
  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, year_group_id, year_groups(name, sort_order)')
    .eq('school_id', schoolId)
  const byGroup = {}
  ;(classData || []).forEach((c) => {
    const gid = c.year_group_id
    if (!byGroup[gid]) byGroup[gid] = { id: gid, name: c.year_groups?.name, sort: c.year_groups?.sort_order ?? 0, classes: [] }
    byGroup[gid].classes.push({ id: c.id, name: c.name })
  })
  const yearGroups = Object.values(byGroup).sort((a, b) => a.sort - b.sort)

  const { data: studentData } = await supabase
    .from('students')
    .select('id, first_name, last_name, class_id, classes(name, year_group_id)')
    .eq('school_id', schoolId)
  const roster = (studentData || []).map((st) => ({
    id: st.id,
    name: `${st.first_name} ${st.last_name}`,
    class_id: st.class_id,
    class_name: st.classes?.name,
    year_group_id: st.classes?.year_group_id
  }))

  return { yearGroups, roster }
}
