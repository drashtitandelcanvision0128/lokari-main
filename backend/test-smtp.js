/**
 * Quick SMTP connection test — run from backend/ folder:
 *   node test-smtp.js
 *
 * Delete this file after confirming SMTP works.
 */
import 'dotenv/config';
import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

console.log('\n--- SMTP Config ---');
console.log('SMTP_HOST :', SMTP_HOST || '(not set)');
console.log('SMTP_PORT :', SMTP_PORT || '(not set, will use 587)');
console.log('SMTP_USER :', SMTP_USER || '(not set)');
console.log('SMTP_PASS :', SMTP_PASS ? `${SMTP_PASS.slice(0, 12)}... (length ${SMTP_PASS.length})` : '(not set)');
console.log('SMTP_FROM :', SMTP_FROM || '(not set)');
console.log('-------------------\n');

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('Missing SMTP_HOST / SMTP_USER / SMTP_PASS in .env');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

console.log('Verifying SMTP connection...');
transport.verify((err, success) => {
  if (err) {
    console.error('\nFAILED:', err.message);
    console.error('\nCommon Brevo fixes:');
    console.error('  - SMTP_USER must be your Brevo LOGIN EMAIL (not the key)');
    console.error('  - SMTP_PASS must start with  xsmtpsib-  (SMTP key, not xkeysib- API key)');
    console.error('  - Generate SMTP key at: app.brevo.com → Settings → SMTP & API → SMTP tab');
    process.exit(1);
  }
  console.log('\nSMTP connection OK — credentials are correct.\n');
  process.exit(0);
});
