const nodemailer = require("nodemailer");

// Universal Transporter (Supports Gmail, SendGrid, or any SMTP)
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: { user, pass },
  });
};

/**
 * Send Workspace Invitation Email
 */
exports.sendInvitationEmail = async ({
  toEmail,
  inviterName,
  workspaceName,
  role,
  inviteLink,
}) => {
  const transporter = createTransporter();

  // If credentials missing, log link for local testing
  if (!transporter) {
    console.log(
      `\n⚠️ [EMAIL SERVICE] Email credentials not set in .env!\n🔗 Test Invite Link: ${inviteLink}\n`,
    );
    return { success: true, simulated: true, link: inviteLink };
  }

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; background-color: #070709; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #faf7f0; }
      .container { max-width: 560px; margin: 40px auto; background-color: #0e0f14; border: 1px solid #2a2520; border-radius: 16px; overflow: hidden; }
      .header { padding: 32px; background: linear-gradient(180deg, #161822 0%, #0e0f14 100%); text-align: center; border-bottom: 1px solid #201d1a; }
      .badge { display: inline-block; padding: 4px 12px; background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.35); border-radius: 9999px; color: #f97316; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
      .title { font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; }
      .content { padding: 32px; }
      .message { font-size: 14px; line-height: 1.6; color: #b8ab97; margin-bottom: 24px; }
      .role-card { background-color: #12131a; border: 1px solid #23201d; border-radius: 12px; padding: 16px; margin-bottom: 28px; }
      .role-label { font-size: 11px; text-transform: uppercase; color: #8a7f70; font-family: monospace; margin-bottom: 4px; }
      .role-val { font-size: 15px; font-weight: bold; color: #faf7f0; }
      .btn { display: block; width: 100%; box-sizing: border-box; text-align: center; background-color: #ea580c; color: #ffffff !important; padding: 14px 24px; border-radius: 10px; font-weight: bold; font-size: 14px; text-decoration: none; box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); }
      .footer { padding: 24px 32px; background-color: #0a0a0d; border-top: 1px solid #1a1714; text-align: center; font-size: 11px; color: #78716c; font-family: monospace; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="badge">PRAXIS Orchestration</div>
        <h1 class="title">You're Invited to Join</h1>
        <p style="margin: 0; color: #f97316; font-size: 16px; font-weight: 700;">${workspaceName}</p>
      </div>

      <div class="content">
        <p class="message">
          Hello,<br><br>
          <strong style="color: #ffffff;">${inviterName}</strong> has invited you to collaborate on the <strong>${workspaceName}</strong> multi-agent platform.
        </p>

        <div class="role-card">
          <div class="role-label">Assigned Workspace Role</div>
          <div class="role-val">${role}</div>
        </div>

        <a href="${inviteLink}" class="btn" target="_blank">
          Accept Invitation & Join Workspace →
        </a>

        <p style="font-size: 11px; color: #78716c; margin-top: 24px; text-align: center;">
          This secure link is valid for <strong>7 days</strong>.
        </p>
      </div>

      <div class="footer">
        PRAXIS — Multi-Agent Orchestration Platform For Developers
      </div>
    </div>
  </body>
  </html>
  `;

  return await transporter.sendMail({
    from: `"PRAXIS Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `[Invitation] ${inviterName} invited you to join ${workspaceName} on PRAXIS`,
    html: htmlContent,
  });
};
