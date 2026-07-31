import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [kids, setKids] = useState(undefined) // undefined = loading, [] = no children linked yet
  const [activeChildId, setActiveChildIdState] = useState(() => localStorage.getItem('activeChildId'))

  const loadKids = useCallback(async (userId) => {
    if (!userId) {
      setKids(null)
      return
    }
    // Pick up any invite the school has sent to this account's email —
    // this is what links the parent to their child, not a search.
    await supabase.rpc('accept_pending_invites')

    const { data, error } = await supabase
      .from('parent_children')
      .select('student_id, students(id, first_name, last_name, class_id, classes(name, school_id, schools(*)))')
      .eq('parent_id', userId)
    if (error) {
      console.error('load parent_children failed', error)
    }
    const list = (data || [])
      .filter((row) => row.students)
      .map((row) => ({
        id: row.students.id,
        name: `${row.students.first_name} ${row.students.last_name}`,
        classId: row.students.class_id,
        className: row.students.classes?.name,
        school: row.students.classes?.schools
      }))
    setKids(list)
    if (list.length && !list.find((k) => k.id === localStorage.getItem('activeChildId'))) {
      setActiveChildIdState(list[0].id)
      localStorage.setItem('activeChildId', list[0].id)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadKids(data.session?.user?.id)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      loadKids(newSession?.user?.id)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadKids])

  function setActiveChildId(id) {
    setActiveChildIdState(id)
    localStorage.setItem('activeChildId', id)
  }

  async function refreshKids() {
    await loadKids(session?.user?.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    localStorage.removeItem('activeChildId')
  }

  const activeChild = (kids || []).find((k) => k.id === activeChildId) || (kids && kids[0]) || null

  const value = {
    session,
    user: session?.user || null,
    kids,
    activeChild,
    activeChildId: activeChild?.id || null,
    setActiveChildId,
    refreshKids,
    signOut,
    loading: session === undefined || (session && kids === undefined)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
