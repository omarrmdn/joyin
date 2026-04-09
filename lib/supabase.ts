import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This can be used on the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * When using Supabase with Clerk on the web (Next.js),
 * we need to inject the Clerk token into the Supabase headers
 * similarly to how it was done in the mobile version.
 */
export function useSupabaseClient(clerkToken: string | null) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: clerkToken ? `Bearer ${clerkToken}` : '',
      },
    },
  });
}
