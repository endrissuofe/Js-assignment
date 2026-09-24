const nodemailer = require('nodemailer');
const config = require('../config/env');

// If SMTP details are not filled in yet, we just print emails to the console.
// This makes local testing easy without a real email account.
const smtpReady = config.smtp.host && config.smtp.user && config.smtp.pass
  && config.smtp.user !== 'you@example.com';

const transporter = smtpReady
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465, // true only for port 465
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : null;

/** Sends an email. Falls back to logging it when SMTP isn't configured. */
async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.log('\n--- EMAIL (SMTP not configured, printing instead) ---');
    console.log(`To: ${to}\nSubject: ${subject}\n${html}`);
    console.log('----------------------------------------------------\n');
    return;
  }
  await transporter.sendMail({ from: config.smtp.from, to, subject, html });
}

/** Builds and sends the "verify your email" message. */
async function sendVerificationEmail(user, token) {
  const link = `${config.frontendUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify your EventHorizon account',
    html: `
      <p>Hi ${user.name},</p>
      <p>Thanks for signing up to EventHorizon. Please confirm your email address:</p>
      <p><a href="${link}">Verify my email</a></p>
      <p>This link expires in ${config.verificationTokenTtlMinutes} minutes.</p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `,
  });
}

module.exports = { sendEmail, sendVerificationEmail };
