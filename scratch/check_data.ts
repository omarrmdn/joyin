
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  const { data: events, error: evError } = await supabase.from('events').select('*');
  console.log('Events count:', events?.length);
  if (events && events.length > 0) {
    console.log('First event:', JSON.stringify(events[0], null, 2));
  }
  
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  console.log('Categories count:', categories?.length);
  if (categories && categories.length > 0) {
    console.log('Categories:', categories.map(c => c.name));
  }
}

checkData();
