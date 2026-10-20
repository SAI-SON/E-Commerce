import { createClient, User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

// Supabase project URL derived from project ref: rfthmlmaismtyukxpyld
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://rfthmlmaismtyukxpyld.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGhtbG1haXNtdHl1a3hweWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcxNjY4MDAsImV4cCI6MjAyMjc0MjgwMH0.placeholder';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type { SupabaseUser, SupabaseSession };
