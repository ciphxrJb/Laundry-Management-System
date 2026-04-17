import { createClient } from '@supabase/supabase-js';

const projectId = "imxsejsnzdsczdnsxqzk"
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteHNlanNuemRzY3pkbnN4cXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMDM1OTksImV4cCI6MjA5MTg3OTU5OX0.NfycSG6tAshJJCJxAZz_eW4hyuf52Zmx3znsIygbqzw"

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);
