import { createClient } from '@supabase/supabase-js'

// Publishable/anon key — safe in client code, every table is locked down
// with row-level security (see schema.sql in the main repo).
const SUPABASE_URL = 'https://xjlcvzmkihuqvpbafpdg.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wvtxh5LXELMnhgE8Dj-_vg_4i4mvNiA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
