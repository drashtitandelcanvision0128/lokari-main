import nodemailer from 'nodemailer';
import { renderEmail } from './templateRenderer.js';

// ─── Transporter (lazy-initialised) ──────────────────────────────────────────

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout:   10_000,
    socketTimeout:     15_000,
  });

  return transporter;
}

function getFrom() {
  return process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER;
}

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!to?.trim())      throw new Error('Recipient email (to) is required');
  if (!subject?.trim()) throw new Error('Email subject is required');
  if (!html && !text)   throw new Error('Email must have html or text content');

  const transport = getTransporter();

  if (!transport) {
    // Dev-only fallback — log to console when SMTP is not configured
    console.warn('[EMAIL] SMTP not configured — printing to console (dev only)');
    console.warn(`To: ${to} | Subject: ${subject}`);
    console.warn(text ?? '[html content]');
    return { messageId: 'dev-console', dev: true };
  }

  const info = await transport.sendMail({
    from:    getFrom(),
    to:      to.trim(),
    subject: subject.trim(),
    ...(html    && { html }),
    ...(text    && { text }),
    ...(replyTo && { replyTo }),
  });

  return info;
}

export async function sendTemplatedEmail({ to, subject, templates, context = {}, replyTo }) {
  const { html, text } = renderEmail(templates, context);
  return sendEmail({ to, subject, html, text, replyTo });
}
