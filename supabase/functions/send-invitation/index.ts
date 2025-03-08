
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
    // such as SendGrid, AWS SES, or similar service to send actual emails
    // For now, we'll simulate the invitation process
    
    // Mock sending invitation emails to each address
    const results = await Promise.all(emails.map(async (email) => {
      try {
        // Simulate network delay for email sending
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`Email invitation sent to: ${email}`);
        
        return {
          email,
          status: 'sent',
          message: `Invitation sent to ${email}`,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Failed to send invitation to ${email}:`, error);
        return {
          email,
          status: 'failed',
          message: `Failed to send invitation to ${email}: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
    }));

    // Count successful and failed invitations
    const successful = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${emails.length} invitations (${successful} sent, ${failed} failed)`,
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
