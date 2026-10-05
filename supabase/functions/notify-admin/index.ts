import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("MARKETER_RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("MARKETER_ADMIN_EMAIL") || "cj2281x@gmail.com";

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("Received Webhook Payload:", JSON.stringify(payload));

    // Read marketer record from trigger payload
    const record = payload.record || payload.new;

    if (!record) {
      console.log("No record found in payload");
      return new Response(JSON.stringify({ message: "No record found" }), {
        status: 200,
      });
    }

    // Send email using verified domain
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CRM System <notifications@crm.hudaengineering.com>",
        to: [ADMIN_EMAIL],
        subject: "Notification: New Marketer Registered",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #2b2b2b;">New Marketer Registered</h2>
            <p><strong>Name:</strong> ${record.full_name || record.name || "N/A"}</p>
            <p><strong>Email:</strong> ${record.email || "N/A"}</p>
            <p><strong>Phone:</strong> ${record.phone || "N/A"}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">Automated notification from your CRM System.</p>
          </div>
        `,
      }),
    });

    const resData = await res.json();
    console.log("Resend API Response:", resData);

    return new Response(JSON.stringify(resData), { status: 200 });
  } catch (error) {
    console.error("Error in Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
