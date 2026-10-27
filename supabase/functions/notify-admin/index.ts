import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// جلب المفاتيح من بيئة Supabase
const RESEND_API_KEY = Deno.env.get("MARKETER_RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("MARKETER_ADMIN_EMAIL") || "cj2281x@gmail.com";
// مسار تطبيق الأدمن لتوجيه أزرار الموافقة/الرفض
const ADMIN_APP_URL = "https://hudaengineering.com/admindashboardcrm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // معالجة طلبات CORS للمتصفح
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received Notification Payload:", JSON.stringify(payload));

    let subject = "";
    let htmlContent = "";

    // =========================================================
    // الحالة الأولى: تسجيل مسوق جديد (قادم من Database Webhook)
    // =========================================================
    const record = payload.record || payload.new;

    if (record) {
      subject = "Notification: New Marketer Registered";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2b2b2b;">New Marketer Registered</h2>
          <p><strong>Name:</strong> ${record.full_name || record.name || "N/A"}</p>
          <p><strong>Email:</strong> ${record.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${record.phone || "N/A"}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Automated notification from your CRM System.</p>
        </div>
      `;
    }
    // =========================================================
    // الحالة الثانية: رفع CPO أو Receipt (قادم من Marketer Dashboard)
    // =========================================================
    else if (payload.actionType) {
      const {
        leadId,
        marketerName,
        clientName,
        actionType,
        status,
        files,
        project,
        unit,
      } = payload;

      if (!leadId) {
        return new Response(JSON.stringify({ message: "Missing leadId" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      let actionTitle = "";
      let fileLinks = "";

      // تجهيز روابط الملفات المرفقة
      if (files && files.length > 0) {
        fileLinks = files
          .map(
            (file: string, index: number) =>
              `<a href="${file}" target="_blank" style="display: inline-block; margin: 5px; padding: 8px 12px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">View File ${index + 1}</a>`,
          )
          .join("");
      }

      // تجهيز الروابط التفاعلية
      const approveUrl = `${ADMIN_APP_URL}?action=approve&type=${actionType}&leadId=${leadId}`;
      const rejectUrl = `${ADMIN_APP_URL}?action=reject&type=${actionType}&leadId=${leadId}`;

      if (actionType === "CPO") {
        subject = `[Action Required] New CPO Uploaded by ${marketerName}`;
        actionTitle = "New Request for Qualification (CPO Uploaded)";
      } else if (actionType === "RECEIPT") {
        subject = `[Action Required] New Payment Receipt Uploaded by ${marketerName}`;
        actionTitle = "New Payment Receipt Uploaded";
      }

      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #111827; margin: 0;">${actionTitle}</h2>
            <span style="display: inline-block; margin-top: 10px; padding: 4px 12px; background-color: #f3f4f6; border-radius: 999px; font-size: 12px; font-weight: bold; color: #374151;">Status: ${status}</span>
          </div>

          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Marketer:</strong> ${marketerName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Client:</strong> ${clientName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Project:</strong> ${project || "N/A"}</p>
            <p style="margin: 0;"><strong>Unit:</strong> ${unit || "N/A"}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h4 style="color: #374151; margin-bottom: 10px;">Attached Documents:</h4>
            ${fileLinks || "<p style='color: #6b7280; font-size: 14px;'>No files attached directly, please check dashboard.</p>"}
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          
          <div style="text-align: center; margin-bottom: 10px;">
            <h4 style="color: #111827; margin-bottom: 15px;">Admin Actions:</h4>
            <a href="${approveUrl}" style="display: inline-block; padding: 10px 20px; margin: 0 10px; background-color: #10b981; color: white; text-decoration: none; font-weight: bold; border-radius: 6px;">Approve in Dashboard</a>
            <a href="${rejectUrl}" style="display: inline-block; padding: 10px 20px; margin: 0 10px; background-color: #ef4444; color: white; text-decoration: none; font-weight: bold; border-radius: 6px;">Reject in Dashboard</a>
          </div>
          
          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 30px;">Automated notification from CRM System.</p>
        </div>
      `;
    }
    // =========================================================
    // إذا كانت البيانات غير معروفة
    // =========================================================
    else {
      console.log("No recognized record or actionType found in payload");
      return new Response(
        JSON.stringify({ message: "Payload not recognized" }),
        { status: 400, headers: corsHeaders },
      );
    }

    // إرسال الإيميل الفعلي عبر Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CRM System <notifications@crm.hudaengineering.com>",
        to: [ADMIN_EMAIL],
        subject: subject,
        html: htmlContent,
      }),
    });

    const resData = await res.json();
    console.log("Resend API Response:", resData);

    return new Response(JSON.stringify(resData), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in notify-admin Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
