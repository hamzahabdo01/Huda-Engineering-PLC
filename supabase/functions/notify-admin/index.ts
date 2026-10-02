const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "cj2281x@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response(
        JSON.stringify({ error: "Invalid payload: 'record' property missing" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CRM System <crm.hudaengineering.com>",
        to: [ADMIN_EMAIL],
        subject: "🔔 New Marketer Registration Pending Approval",
        html: `
          <h2>New Marketer Registration</h2>
          <p>A new marketer has registered and is waiting for account activation.</p>
          <ul>
            <li><strong>Name:</strong> ${record.full_name || record.name || "N/A"}</li>
            <li><strong>Email:</strong> ${record.email || "N/A"}</li>
            <li><strong>Phone:</strong> ${record.phone || "N/A"}</li>
            <li><strong>Status:</strong> ${record.status || "pending"}</li>
            <li><strong>Registered At:</strong> ${record.created_at || new Date().toISOString()}</li>
          </ul>
          <p>Please log in to the admin dashboard to review and activate this account.</p>
        `,
      }),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
