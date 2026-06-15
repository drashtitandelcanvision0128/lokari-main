import { sendTemplatedEmail } from '../emailService.js';

const PURPOSE_LABELS = {
  register: 'complete your registration',
  login: 'sign in to your account',
  reset_password: 'reset your password',
};

/**
 * Send OTP verification email using Handlebars templates.
 */
export async function sendOtpEmail(to, otp, purpose, options = {}) {
  const purposeLabel = PURPOSE_LABELS[purpose] || 'verify your email';
  const expiresInMinutes = Math.floor(
    Number(options.expiresInSeconds || process.env.OTP_TTL_SECONDS || 600) / 60,
  );

  const subject = `${otp} is your Lokhari verification code`;

  return sendTemplatedEmail({
    to,
    subject,
    templates: {
      html: 'otp/html.hbs',
      text: 'otp/text.hbs',
    },
    context: {
      title: 'Verify your email — Lokhari',
      headerSubtitle: 'Email verification',
      otp,
      purposeLabel,
      expiresInMinutes,
      recipientName: options.recipientName,
      footerNote: 'This is an automated message. Please do not reply.',
    },
  });
}
