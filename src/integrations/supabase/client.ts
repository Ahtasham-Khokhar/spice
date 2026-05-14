import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Vite uses import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'If deploying to Vercel, add it under Settings → Environment Variables.'
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
    'If deploying to Vercel, add it under Settings → Environment Variables.'
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);