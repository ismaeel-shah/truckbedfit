import { Resend } from "resend";
import { DEFAULT_EMAIL_FROM, SITE_NAME } from "@/lib/site";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(apiKey);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const siteName = SITE_NAME;
  const to = process.env.CONTACT_EMAIL ?? process.env.RESEND_TO_EMAIL;
  const from = process.env.RESEND_FROM || DEFAULT_EMAIL_FROM;

  if (!to) throw new Error("CONTACT_EMAIL or RESEND_TO_EMAIL is not configured");

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  await getResend().emails.send({
    from,
    to: [to],
    replyTo: email,
    subject: `New Contact Message from ${name} - ${siteName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="font-size:22px;font-weight:700;color:#1F2328;margin:0 0 16px;">New Contact Message</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:80px;"><strong>Name</strong></td><td style="padding:8px 0;font-size:14px;color:#1F2328;">${safeName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;"><strong>Email</strong></td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#EA580C;">${safeEmail}</a></td></tr>
        </table>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;font-size:15px;color:#1F2328;line-height:1.6;white-space:pre-wrap;">${safeMessage}</div>
        <p style="color:#94a3b8;font-size:13px;margin:20px 0 0;">Reply directly to this email to respond to ${safeName}.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
        <p style="color:#cbd5e1;font-size:12px;margin:0;">${siteName} &middot; Contact Form</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const siteName = SITE_NAME;
  const from = process.env.RESEND_FROM || DEFAULT_EMAIL_FROM;

  await getResend().emails.send({
    from,
    to: [to],
    subject: `Reset your ${siteName} password`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="font-size:22px;font-weight:700;color:#1F2328;margin:0 0 8px;">Password Reset</h2>
        <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
          We received a request to reset your <strong>${siteName}</strong> admin password.
          Click the button below. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${escapeHtml(resetUrl)}"
          style="display:inline-block;background:#EA580C;color:#1F2328;font-weight:700;
                 font-size:15px;padding:12px 28px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">
          If you did not request this, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#cbd5e1;font-size:12px;margin:0;">
          ${siteName} &middot; Admin Dashboard
        </p>
      </div>
    `,
  });
}
