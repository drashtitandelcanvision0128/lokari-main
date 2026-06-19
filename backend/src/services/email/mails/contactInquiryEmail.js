import { sendTemplatedEmail } from '../emailService.js';

function getNotifyAddress() {
  return process.env.CONTACT_NOTIFY_EMAIL?.trim() || 'support@lokhari.com';
}

/** Notify the Lokhari team about a new contact form submission. */
export async function sendContactInquiryNotification(inquiry) {
  const subject = `[Contact] ${inquiry.subject}`;

  return sendTemplatedEmail({
    to: getNotifyAddress(),
    subject,
    replyTo: inquiry.email,
    templates: {
      html: 'contact-inquiry/html.hbs',
      text: 'contact-inquiry/text.hbs',
    },
    context: {
      title: 'New contact inquiry — Lokhari',
      headerSubtitle: 'Contact form',
      senderName: inquiry.name,
      senderEmail: inquiry.email,
      inquirySubject: inquiry.subject,
      inquiryMessage: inquiry.message,
      submittedAt: inquiry.created_at.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }),
      footerNote: 'Reply directly to this email to respond to the sender.',
    },
  });
}

/** Send an auto-reply confirmation to the person who submitted the form. */
export async function sendContactInquiryConfirmation(inquiry) {
  return sendTemplatedEmail({
    to: inquiry.email,
    subject: 'We received your message — Lokhari',
    templates: {
      html: 'contact-confirmation/html.hbs',
      text: 'contact-confirmation/text.hbs',
    },
    context: {
      title: 'Message received — Lokhari',
      headerSubtitle: 'Thank you for contacting us',
      recipientName: inquiry.name,
      inquirySubject: inquiry.subject,
      footerNote: 'This is an automated message. Please do not reply.',
    },
  });
}

function buildReplySubject(subject) {
  return /^re:/i.test(subject.trim()) ? subject.trim() : `Re: ${subject.trim()}`;
}

/** Send an admin reply to the person who submitted the contact form. */
export async function sendContactInquiryReply({ inquiry, message }) {
  const supportEmail = getNotifyAddress();

  return sendTemplatedEmail({
    to: inquiry.email,
    subject: buildReplySubject(inquiry.subject),
    replyTo: supportEmail,
    templates: {
      html: 'contact-inquiry-reply/html.hbs',
      text: 'contact-inquiry-reply/text.hbs',
    },
    context: {
      title: `${buildReplySubject(inquiry.subject)} — Lokhari`,
      headerSubtitle: 'Response from Lokhari Support',
      recipientName: inquiry.name,
      inquirySubject: inquiry.subject,
      replyMessage: message,
      supportEmail,
      footerNote: 'You received this email because you contacted Lokhari support.',
    },
  });
}
