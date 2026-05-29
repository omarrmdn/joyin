import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://icuvaldfjqmyirzmcjst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdXZhbGRmanFteWlyem1janN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzA1NDMsImV4cCI6MjA4NTc0NjU0M30.9jYkDkLN1ro3esiQb1nzUUSbEEPMuX5MfSDxz6fkFqE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking events table...");
  const { data: events, error: eventsError } = await supabase.from('events').select('*').limit(1);
  console.log("Events:", events, eventsError);

  console.log("Checking users table...");
  const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1);
  console.log("Users:", users, usersError);
}

check();
