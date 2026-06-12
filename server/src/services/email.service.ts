import nodemailer from "nodemailer";

// Retrieve email credentials from environment variables
const user = process.env.EMAIL_USER || "";
const pass = process.env.EMAIL_PASS || "";
const from = user ? `"CarePlus Support" <${user}>` : '"CarePlus Support" <no-reply@careplus.com>';

// Create the Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: user && pass ? { user, pass } : undefined,
});

/**
 * Sends an email notification to a user whose registration/KYC was rejected.
 * 
 * @param to The recipient's email address
 * @param name The recipient's name
 * @param reason Optional rejection reason
 */
export async function sendRejectionEmail(to: string, name: string, reason?: string): Promise<void> {
  // Safe check: If credentials are not configured, print to console as fallback
  if (!user || !pass) {
    console.warn(`⚠️ Email credentials not set (EMAIL_USER/EMAIL_PASS). Rejection email for ${name} (${to}) logged to console.`);
    console.log(`
=========================================
[SMTP MOCK EMAIL REJECTION NOTICE]
To:      ${to}
From:    ${from}
Subject: CarePlus - Registration Rejection Notification
Body:
Dear ${name},

We regret to inform you that your registration/KYC verification for CarePlus has been rejected due to a policy violation or incorrect verification details.

Reason: ${reason || "Noticeable violation / Incorrect credentials"}

Please check your details and try again or contact support if you believe this is an error.

Best regards,
CarePlus Team
=========================================
`);
    return;
  }

  const mailOptions = {
    from,
    to,
    subject: "CarePlus - Registration Rejection Notification",
    text: `Dear ${name},

We regret to inform you that your registration/KYC verification for CarePlus has been rejected due to a policy violation or incorrect verification details.

Reason: ${reason || "Noticeable violation / Incorrect credentials"}

Please check your details and try again or contact support if you believe this is an error.

Best regards,
CarePlus Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333333;">
        <h2 style="color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 10px; margin-top: 0;">CarePlus Registration Rejection</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We regret to inform you that your registration/KYC verification for CarePlus has been rejected due to a policy violation or incorrect verification details.</p>
        <div style="background-color: #fcf8e3; color: #8a6d3b; border: 1px solid #faebcc; padding: 15px; border-left: 5px solid #f0ad4e; margin: 20px 0; border-radius: 4px;">
          <strong>Reason for Rejection:</strong><br/>
          ${reason || "Noticeable violation / Incorrect credentials"}
        </div>
        <p>Please review your details and submit again, or contact our support team if you believe this rejection was made in error.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;"/>
        <p style="font-size: 11px; color: #777777; line-height: 1.4;">
          This is an automated notification from CarePlus. Please do not reply directly to this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✉️ Rejection email successfully sent to ${to}`);
}
