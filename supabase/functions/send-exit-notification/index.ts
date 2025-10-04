import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExitNotificationRequest {
  email: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, timestamp }: ExitNotificationRequest = await req.json();

    console.log(`Sending exit notification to ${email} at ${timestamp}`);

    const emailResponse = await resend.emails.send({
      from: "Focus Timer <onboarding@resend.dev>",
      to: [email],
      subject: "Session Ended - Focus Timer",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Session Ended</h1>
          <p>Your Focus Timer session has ended at ${new Date(timestamp).toLocaleString()}.</p>
          <p>We hope you had a productive session!</p>
          <br>
          <p style="color: #666; font-size: 14px;">
            This is an automated notification from Focus Timer.
          </p>
        </div>
      `,
    });

    console.log("Exit notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-exit-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
