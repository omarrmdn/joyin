
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  // Since we can't easily list all tables without dynamic SQL/RPC,
  // we'll try to probe common ones.
  const commonTables = ['events', 'users', 'event_attendees', 'event_participants', 'joined_events', 'tags', 'categories', 'event_questions', 'messages'];
  
  for (const table of commonTables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (!error) {
      console.log(`Table '${table}' exists. Count: ${count}`);
    }
  }
}

listTables();
