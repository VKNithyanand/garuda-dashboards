
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json();
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('Invalid email list provided');
    }

    console.log(`Sending invitations to ${emails.length} users:`, emails);

    // In a real implementation, this would connect to an email service
    // For now, we'll simulate the invitation process
    const results = emails.map(email => ({
      email,
      status: 'sent',
      message: `Invitation sent to ${email}`
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${emails.length} invitations`,
        results
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error in send-invitation function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
