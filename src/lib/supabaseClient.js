import { createClient } from '@supabase/supabase-js'

// The publishable/anon key is safe to ship in client code — it has no
// privileges of its own. Every table is locked down with row-level security
// (see schema.sql), so this key can only ever do what the RLS policies allow.
const SUPABASE_URL = 'https://xjlcvzmkihuqvpbafpdg.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wvtxh5LXELMnhgE8Dj-_vg_4i4mvNiA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
