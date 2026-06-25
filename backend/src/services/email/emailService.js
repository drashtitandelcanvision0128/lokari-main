import nodemailer from 'nodemailer';
import { renderEmail } from './templateRenderer.js';

// ─── Resend (HTTP API — works on Render / any cloud host) ─────────────────────

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendViaResend({ to, subject, html, text, replyTo }) {
  const apiKey  = process.env.RESEND_API_KEY;
  const from    = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'Lokari <onboarding@resend.dev>';

  const body = {
    from,
    to:      [to.trim()],
    subject: subject.trim(),
    ...(html    && { html }),
    ...(text    && { text }),
    ...(replyTo && { reply_to: replyTo }),
  };

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${data?.message || JSON.stringify(data)}`);
  }

  console.log(`Email sent via Resend → ${to} (id: ${data.id})`);
  return data;
}

// ─── SMTP (nodemailer) fallback ───────────────────────────────────────────────

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465 || process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout:   10_000,
    socketTimeout:     15_000,
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  });

  return transporter;
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@lokari.in';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function isEmailConfigured() {
  return isResendConfigured() || Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Send an email.
 * Priority: Resend HTTP API → SMTP → console log (dev fallback)
 */
export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!to?.trim())         throw new Error('Recipient email (to) is required');
  if (!subject?.trim())    throw new Error('Email subject is required');
  if (!html && !text)      throw new Error('Email must include html or text content');

  // 1. Resend HTTP API (recommended for cloud deployments — no SMTP ports needed)
  if (isResendConfigured()) {
    return sendViaResend({ to, subject, html, text, replyTo });
  }

  // 2. SMTP via nodemailer
  const transport = getTransporter();
  if (transport) {
    try {
      const info = await transport.sendMail({
        from:    getFromAddress(),
        to:      to.trim(),
        subject: subject.trim(),
        ...(html    && { html }),
        ...(text    && { text }),
        ...(replyTo && { replyTo }),
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`Ethereal preview: ${previewUrl}`);
      return info;
    } catch (smtpErr) {
      console.error(`[SMTP FAILED] ${smtpErr.message}`);
      // Fall through to console fallback
    }
  }

  // 3. Console fallback (dev / misconfigured production)
  console.warn('⚠ Email not sent — set RESEND_API_KEY (recommended) or SMTP_* env vars.');
  console.warn('--- Email content ---');
  console.warn(`To:      ${to}`);
  console.warn(`Subject: ${subject}`);
  console.warn(text || '[html only]');
  console.warn('---------------------');

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Email delivery failed: no working transport configured. Set RESEND_API_KEY in your environment.');
  }

  return { messageId: 'dev-console', dev: true };
}

/**
 * Render Handlebars templates and send.
 */
export async function sendTemplatedEmail({ to, subject, templates, context = {}, replyTo }) {
  const { html, text } = renderEmail(templates, context);
  return sendEmail({ to, subject, html, text, replyTo });
}
