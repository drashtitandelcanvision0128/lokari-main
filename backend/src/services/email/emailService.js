import nodemailer from 'nodemailer';
import { renderEmail } from './templateRenderer.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465 || process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    // Fail fast — Render / cloud hosts often block port 587; without timeouts
    // the request would hang for ~2 minutes before throwing.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  return transporter;
}

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getFromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@lokhari.com';
}

/**
 * Send a raw email (html and/or text).
 * Falls back to console logging when SMTP is not configured.
 */
export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!to?.trim()) {
    throw new Error('Recipient email (to) is required');
  }
  if (!subject?.trim()) {
    throw new Error('Email subject is required');
  }
  if (!html && !text) {
    throw new Error('Email must include html or text content');
  }

  const mail = {
    from: getFromAddress(),
    to: to.trim(),
    subject: subject.trim(),
    ...(html && { html }),
    ...(text && { text }),
    ...(replyTo && { replyTo }),
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('--- Email (SMTP not configured) ---');
    console.log(`To: ${mail.to}`);
    console.log(`Subject: ${mail.subject}`);
    console.log(text || html);
    console.log('Set SMTP_HOST, SMTP_USER, SMTP_PASS in root .env for Docker backend');
    console.log('-----------------------------------');
    return { messageId: 'dev-console', dev: true };
  }

  try {
    const info = await transport.sendMail(mail);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Ethereal email preview: ${previewUrl}`);
    } else if (process.env.NODE_ENV !== 'production') {
      console.log(`Email sent via ${process.env.SMTP_HOST} → ${mail.to}`);
    }

    return info;
  } catch (smtpErr) {
    // Log the OTP / email to server console as a fallback so the platform
    // (Render logs, etc.) can be used manually while SMTP is being fixed.
    console.error(`[EMAIL FAILED] ${smtpErr.message}`);
    console.warn('--- Fallback email (SMTP failed) ---');
    console.warn(`To:      ${mail.to}`);
    console.warn(`Subject: ${mail.subject}`);
    console.warn(text || mail.html);
    console.warn('------------------------------------');

    // In production re-throw so the caller knows email was not delivered.
    // Remove this throw if you want silent fallback (not recommended).
    throw new Error(`Email delivery failed: ${smtpErr.message}`);
  }
}

/**
 * Render Handlebars templates and send.
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {{ html: string, text?: string }} options.templates — paths under templates/
 * @param {object} options.context — handlebars context
 */
export async function sendTemplatedEmail({ to, subject, templates, context = {}, replyTo }) {
  const { html, text } = renderEmail(templates, context);

  return sendEmail({ to, subject, html, text, replyTo });
}
