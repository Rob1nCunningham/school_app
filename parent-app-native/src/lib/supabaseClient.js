import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// Same project as admin-web and parent-web — one shared backend, every
// table locked down with row-level security (see schema.sql).
const SUPABASE_URL = 'https://xjlcvzmkihuqvpbafpdg.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wvtxh5LXELMnhgE8Dj-_vg_4i4mvNiA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
