import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { findManyWithSort } from '../utils/caseInsensitiveSort.js';
import { verifyRecaptchaToken } from './recaptchaService.js';
import {
  sendContactInquiryConfirmation,
  sendContactInquiryNotification,
  sendContactInquiryReply,
} from './email/mails/contactInquiryEmail.js';
import { isEmailConfigured } from './email/emailService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function normalizePayload(body) {
  return {
    name: body.name?.trim() ?? '',
    email: body.email?.trim().toLowerCase() ?? '',
    subject: body.subject?.trim() ?? '',
    message: body.message?.trim() ?? '',
    recaptchaToken: body.recaptchaToken ?? null,
  };
}

function validatePayload(payload) {
  if (!payload.name || payload.name.length > 120) {
    throw validationError('Please enter your name (max 120 characters).');
  }
  if (!payload.email || !EMAIL_REGEX.test(payload.email) || payload.email.length > 254) {
    throw validationError('Please enter a valid email address.');
  }
  if (!payload.subject || payload.subject.length > 200) {
    throw validationError('Please enter a subject (max 200 characters).');
  }
  if (!payload.message || payload.message.length > 5000) {
    throw validationError('Please enter a message (max 5000 characters).');
  }
}

export async function submitContactInquiry(body) {
  const payload = normalizePayload(body);
  validatePayload(payload);

  await verifyRecaptchaToken(payload.recaptchaToken);

  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    },
  });

  try {
    await Promise.all([
      sendContactInquiryNotification(inquiry),
      sendContactInquiryConfirmation(inquiry),
    ]);
  } catch (emailError) {
    console.error('Contact inquiry saved but email failed:', emailError);
    if (process.env.NODE_ENV === 'production') {
      const err = new Error(
        'Your message was saved but we could not send confirmation emails. Please try again or contact us directly.',
      );
      err.statusCode = 502;
      throw err;
    }
  }

  return inquiry;
}

const VALID_INQUIRY_STATUSES = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];

export function mapInquiryForAdmin(inquiry) {
  return {
    id: inquiry.inquiry_id,
    name: inquiry.name,
    email: inquiry.email,
    subject: inquiry.subject,
    message: inquiry.message,
    status: inquiry.status,
    createdAt: inquiry.created_at.toISOString(),
    updatedAt: inquiry.updated_at.toISOString(),
  };
}

export function buildContactInquiryWhere({ status, search } = {}) {
  const filters = [];

  if (status && VALID_INQUIRY_STATUSES.includes(status)) {
    filters.push({ status });
  }

  const searchTerm = search?.trim();
  if (searchTerm) {
    filters.push({
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { subject: { contains: searchTerm, mode: 'insensitive' } },
        { message: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  return { AND: filters };
}

export function buildContactInquiryWhereSql({ status, search } = {}) {
  const clauses = [];

  if (status && VALID_INQUIRY_STATUSES.includes(status)) {
    clauses.push(Prisma.sql`status = ${status}::"ContactInquiryStatus"`);
  }

  const searchTerm = search?.trim();
  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    clauses.push(
      Prisma.sql`(name ILIKE ${pattern} OR email ILIKE ${pattern} OR subject ILIKE ${pattern} OR message ILIKE ${pattern})`,
    );
  }

  if (clauses.length === 0) return Prisma.sql`TRUE`;
  if (clauses.length === 1) return clauses[0];
  return Prisma.join(clauses, Prisma.sql` AND `);
}

export async function listContactInquiries({
  status,
  search,
  skip = 0,
  limit = 10,
  dbField = 'created_at',
  sortOrder = 'desc',
  caseInsensitive = false,
} = {}) {
  const where = buildContactInquiryWhere({ status, search });
  const whereClauseSql = buildContactInquiryWhereSql({ status, search });

  const [inquiries, total] = await Promise.all([
    findManyWithSort({
      prismaClient: prisma,
      modelDelegate: prisma.contactInquiry,
      tableName: 'contact_inquiries',
      idColumn: 'inquiry_id',
      whereClauseSql,
      where,
      skip,
      limit,
      dbField,
      sortOrder,
      caseInsensitive,
    }),
    prisma.contactInquiry.count({ where }),
  ]);

  return {
    items: inquiries.map(mapInquiryForAdmin),
    total,
  };
}

export async function getUnreadContactInquiryCount() {
  return prisma.contactInquiry.count({
    where: { status: 'NEW' },
  });
}

export async function updateContactInquiryStatus(inquiryId, status) {
  if (!VALID_INQUIRY_STATUSES.includes(status)) {
    throw validationError('Invalid inquiry status.');
  }

  const existing = await prisma.contactInquiry.findUnique({
    where: { inquiry_id: inquiryId },
  });

  if (!existing) {
    const err = new Error('Contact inquiry not found.');
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.contactInquiry.update({
    where: { inquiry_id: inquiryId },
    data: { status },
  });

  return mapInquiryForAdmin(updated);
}

export async function markAllContactInquiriesRead() {
  const result = await prisma.contactInquiry.updateMany({
    where: { status: 'NEW' },
    data: { status: 'READ' },
  });

  return result.count;
}

export async function replyToContactInquiry(inquiryId, { message }) {
  if (!message?.trim()) {
    throw validationError('Reply message is required.');
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length > 10000) {
    throw validationError('Reply message is too long (max 10000 characters).');
  }

  if (!isEmailConfigured()) {
    const err = new Error(
      'Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS to send replies.',
    );
    err.statusCode = 503;
    throw err;
  }

  const existing = await prisma.contactInquiry.findUnique({
    where: { inquiry_id: inquiryId },
  });

  if (!existing) {
    const err = new Error('Contact inquiry not found.');
    err.statusCode = 404;
    throw err;
  }

  await sendContactInquiryReply({
    inquiry: existing,
    message: trimmedMessage,
  });

  const shouldMarkReplied = existing.status !== 'ARCHIVED';
  const updated = shouldMarkReplied
    ? await prisma.contactInquiry.update({
        where: { inquiry_id: inquiryId },
        data: { status: 'REPLIED' },
      })
    : existing;

  return mapInquiryForAdmin(updated);
}

