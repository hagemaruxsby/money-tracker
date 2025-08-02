// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// The Supabase URL and anon key are publicly accessible.
// They are not secrets, but rather identifiers for your project.
const SUPABASE_URL = 'https://wloasvgtmppylypzcpvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsb2Fzdmd0bXBweWx5cHpjcHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjI1MTYsImV4cCI6MjA2OTYzODUxNn0.5a0tBpUHLOSn2IVfeUhCCLdCqlW8-eU6vam_SQ4bOUQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});