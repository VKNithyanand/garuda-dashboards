
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
    const { action, data } = await req.json();
    
    // Handle different types of notification requests
    if (action === 'send_invitations') {
      // Check if emails is provided and valid
      if (!data.emails || !Array.isArray(data.emails) || data.emails.length === 0) {
        throw new Error('Invalid email list provided');
      }

      console.log(`Sending invitations to ${data.emails.length} users:`, data.emails);
      
      // Mock sending invitation emails to each address
      const results = await Promise.all(data.emails.map(async (email) => {
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
          message: `Successfully processed ${data.emails.length} invitations (${successful} sent, ${failed} failed)`,
          results
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    } 
    // Handle email notifications
    else if (action === 'email_notification') {
      const { recipient, subject, message } = data;
      
      if (!recipient || !subject || !message) {
        throw new Error('Missing required fields for email notification');
      }
      
      // Simulate sending an email notification
      console.log(`Sending email notification to ${recipient}: ${subject}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Email notification sent to ${recipient}`,
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    // Handle push notifications
    else if (action === 'push_notification') {
      const { userId, title, body } = data;
      
      if (!userId || !title || !body) {
        throw new Error('Missing required fields for push notification');
      }
      
      // Simulate sending a push notification
      console.log(`Sending push notification to user ${userId}: ${title}`);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Push notification sent to user ${userId}`,
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    // Handle marketing emails
    else if (action === 'marketing_email') {
      const { recipients, campaign, content } = data;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !campaign || !content) {
        throw new Error('Missing required fields for marketing email');
      }
      
      // Simulate sending marketing emails
      console.log(`Sending marketing email "${campaign}" to ${recipients.length} recipients`);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Marketing email campaign "${campaign}" sent to ${recipients.length} recipients`,
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    else {
      throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    console.error('Error in notification function:', error);
    
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
