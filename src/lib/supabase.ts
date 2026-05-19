import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');

if (!isValidUrl || !supabaseAnonKey || rawUrl.includes('your_supabase_url')) {
  console.warn('Supabase credentials missing or invalid. Please add them to .env.local');
}

const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder.supabase.co';
const supabaseKey = supabaseAnonKey && !supabaseAnonKey.includes('your_') ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
