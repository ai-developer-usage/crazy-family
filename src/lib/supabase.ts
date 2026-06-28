import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * True when real Supabase credentials are present. When false the whole app
 * falls back to read-only DEMO MODE backed by bundled sample data, so the site
 * is fully viewable before any backend is configured.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

/** Storage bucket that holds uploaded member photos. */
export const PHOTO_BUCKET = 'photos';
