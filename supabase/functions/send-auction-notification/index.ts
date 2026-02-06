import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AuctionNotificationPayload {
  type: 'new_auction' | 'bid_update' | 'auction_ending' | 'auction_won' | 'outbid';
  auctionId: string;
  userId?: string; // Optional - if not provided, notify all users
  title: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuctionNotificationPayload = await req.json();
    const { type, auctionId, userId, title, message } = payload;

    if (!auctionId || !title || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auction details
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError) {
      console.error('Error fetching auction:', auctionError);
      return new Response(
        JSON.stringify({ success: false, error: 'Auction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine target users
    let targetUserIds: string[] = [];

    if (userId) {
      // Specific user notification
      targetUserIds = [userId];
    } else if (type === 'new_auction') {
      // For new auctions, notify all users (or those with matching preferences)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id');
      
      targetUserIds = profiles?.map(p => p.user_id) || [];
    }

    console.log(`Sending ${type} notification to ${targetUserIds.length} users`);

    // Create in-app notifications
    const notifications = targetUserIds.map(uid => ({
      user_id: uid,
      auction_id: auctionId,
      type,
      title,
      message,
      read: false,
    }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
      }
    }

    // Send email notifications (if RESEND_API_KEY is configured)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && targetUserIds.length > 0) {
      // Get user emails
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const userEmails = authUsers?.users
        .filter(u => targetUserIds.includes(u.id))
        .map(u => u.email)
        .filter(Boolean) as string[] || [];

      if (userEmails.length > 0) {
        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>${title}</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🚗 AutoVault</h1>
                </div>
                <div style="padding: 30px;">
                  <h2 style="color: #1a1a1a; margin-top: 0;">${title}</h2>
                  <p style="color: #666; font-size: 16px; line-height: 1.6;">${message}</p>
                  
                  <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px; color: #1a1a1a;">Auction Details</h3>
                    <p style="margin: 5px 0; color: #666;"><strong>Car:</strong> ${auction.car_brand} ${auction.car_model} (${auction.car_year})</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Current Bid:</strong> ₹${(auction.current_price / 100000).toFixed(2)} Lakh</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Ends:</strong> ${new Date(auction.end_time).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <a href="${Deno.env.get('APP_URL') || 'https://autovault.lovable.app'}/auctions/${auctionId}" 
                     style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;">
                    View Auction →
                  </a>
                </div>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0; color: #999; font-size: 14px;">
                    AutoVault - India's Premier Car Auction Platform
                  </p>
                </div>
              </div>
            </body>
            </html>
          `;

          // Send email via Resend
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'AutoVault <noreply@autovault.app>',
              to: userEmails.slice(0, 50), // Limit batch size
              subject: `${title} - AutoVault`,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            console.error('Resend email error:', errorData);
          } else {
            console.log(`Emails sent to ${userEmails.length} users`);
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: notifications.length,
        message: `Notifications sent for ${type}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-auction-notification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
