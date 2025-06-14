
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Cors headers for browser requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
export const createSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )
}

// Verify user authentication
export const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error("Missing Authorization header")
  }
  
  const supabase = createSupabaseClient()
  const token = authHeader.replace("Bearer ", "")
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw new Error("Invalid authentication")
  }
  
  return { user, supabase }
}
