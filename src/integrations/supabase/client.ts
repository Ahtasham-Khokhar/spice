import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Vite uses import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
    SUPABASE_URL || '', 
    SUPABASE_PUBLISHABLE_KEY || ''
);