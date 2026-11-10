import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

// Lazy or safe initialized client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseConfigStatus {
  configured: boolean;
  url: string;
  hasAnonKey: boolean;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  return {
    configured: isSupabaseConfigured,
    url: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^/]+).*/, '$1') : 'Not configured',
    hasAnonKey: Boolean(supabaseAnonKey),
  };
}
