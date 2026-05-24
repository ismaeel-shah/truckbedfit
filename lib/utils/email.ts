import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });
}

export async function sendContactEmail({
  name, email, message,
}: { name: string; email: string; message: string }) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Home Desk Essentials";
  const to       = process.env.EMAIL_SERVER_USER!;
  const from     = process.env.EMAIL_FROM ?? `"${siteName}" <noreply@homedeskessentials.com>`;

  const transporter = createTransporter();
  await transporter.verify();

  await transporter.sendMail({
    from,
    to,
    replyTo: email,
    subject: `New Contact Message from ${name} — ${siteName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="font-size:22px;font-weight:700;color:#1B2A3B;margin:0 0 16px;">New Contact Message</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:80px;"><strong>Name</strong></td><td style="padding:8px 0;font-size:14px;color:#1B2A3B;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;"><strong>Email</strong></td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${email}" style="color:#2DD4BF;">${email}</a></td></tr>
        </table>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;font-size:15px;color:#1B2A3B;line-height:1.6;white-space:pre-wrap;">${message}</div>
        <p style="color:#94a3b8;font-size:13px;margin:20px 0 0;">Reply directly to this email to respond to ${name}.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
        <p style="color:#cbd5e1;font-size:12px;margin:0;">${siteName} &middot; Contact Form</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const siteName    = process.env.NEXT_PUBLIC_SITE_NAME ?? "Home Desk Essentials";
  const from        = process.env.EMAIL_FROM ?? `"${siteName}" <noreply@homedeskessentials.com>`;
  const transporter = createTransporter();
  await transporter.verify();

  await transporter.sendMail({
    from,
    to,
    subject: `Reset your ${siteName} password`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="font-size:22px;font-weight:700;color:#1B2A3B;margin:0 0 8px;">Password Reset</h2>
        <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
          We received a request to reset your <strong>${siteName}</strong> admin password.
          Click the button below — this link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#2DD4BF;color:#1B2A3B;font-weight:700;
                 font-size:15px;padding:12px 28px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="color:#cbd5e1;font-size:12px;margin:0;">
          ${siteName} &middot; Admin Dashboard
        </p>
      </div>
    `,
  });
}
