import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://icuvaldfjqmyirzmcjst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdXZhbGRmanFteWlyem1janN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzA1NDMsImV4cCI6MjA4NTc0NjU0M30.9jYkDkLN1ro3esiQb1nzUUSbEEPMuX5MfSDxz6fkFqE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: tables, error } = await supabase.from('payments').select('*').limit(1);
  console.log("Payments table:", tables, error);
}

check();
