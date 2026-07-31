import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabaseClient.js'
import { registerForPushNotifications } from './pushNotifications.js'

const AuthContext = createContext(null)
const ACTIVE_CHILD_KEY = 'activeChildId'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = signed out
  const [kids, setKids] = useState(undefined) // undefined = loading, [] = no children linked yet
  const [activeChildId, setActiveChildIdState] = useState(null)
  const pushRegistered = useRef(null)

  useEffect(() => {
    AsyncStorage.getItem(ACTIVE_CHILD_KEY).then((v) => v && setActiveChildIdState(v))
  }, [])

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
    const storedActive = await AsyncStorage.getItem(ACTIVE_CHILD_KEY)
    if (list.length && !list.find((k) => k.id === storedActive)) {
      setActiveChildIdState(list[0].id)
      await AsyncStorage.setItem(ACTIVE_CHILD_KEY, list[0].id)
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

  // Register this device for push once we know who's signed in — safe to
  // call repeatedly, no-ops in Expo Go / simulators / without a project id.
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId || pushRegistered.current === userId) return
    pushRegistered.current = userId
    registerForPushNotifications(userId)
  }, [session])

  async function setActiveChildId(id) {
    setActiveChildIdState(id)
    await AsyncStorage.setItem(ACTIVE_CHILD_KEY, id)
  }

  async function refreshKids() {
    await loadKids(session?.user?.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    await AsyncStorage.removeItem(ACTIVE_CHILD_KEY)
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
