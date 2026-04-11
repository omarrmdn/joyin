
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npds2v9l3o1k8aun3dn4.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // This will fail if not set, but I'll use run_command with env

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('events').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
