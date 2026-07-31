import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [staffMember, setStaffMember] = useState(undefined) // undefined = loading, null = needs onboarding
  const [school, setSchool] = useState(null)

  const loadStaffMember = useCallback(async (userId) => {
    if (!userId) {
      setStaffMember(null)
      setSchool(null)
      return
    }
    const { data, error } = await supabase
      .from('staff_members')
      .select('*, schools(*)')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    if (error) {
      console.error('load staff_members failed', error)
    }
    setStaffMember(data || null)
    setSchool(data ? data.schools : null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadStaffMember(data.session?.user?.id)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      loadStaffMember(newSession?.user?.id)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadStaffMember])

  async function refreshStaffMember() {
    await loadStaffMember(session?.user?.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user || null,
    staffMember,
    school,
    isTeacher: staffMember?.role === 'teacher',
    isAdmin: staffMember?.role === 'admin',
    loading: session === undefined || (session && staffMember === undefined),
    refreshStaffMember,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
