import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY is missing. Supabase client will fail to initialize properly.');
}

// Initialize Supabase Client
// We use the service_role key to bypass RLS since the Node.js backend handles auth
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY || 'MISSING_KEY'
);

export async function connectDatabase(): Promise<void> {
  // Supabase REST client doesn't need a persistent connection initialization,
  // but we can verify it by fetching the current time from the DB.
  try {
    const { data, error } = await supabase.from('customers').select('id').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed. Check URL and Key:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
  }
}
