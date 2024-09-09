import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { record } = await req.json()

  if (!record || !record.email) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  console.log(`New user signed up: ${record.email}`)

  return new Response(
    JSON.stringify({ message: 'Notification sent' }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})