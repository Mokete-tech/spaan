// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jkajgkphojeelebucdzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYWpna3Bob2plZWxlYnVjZHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMzI0MTUsImV4cCI6MjA1NjYwODQxNX0.g5P16s0rry4doYRAB-ZLhwp59po9XZs_UxpzZJ9Tv94";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);