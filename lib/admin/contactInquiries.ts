import { apiUrl, authHeaders } from '@/lib/api';
import {
  buildPaginationSearchParams,
  parsePaginationFromResponse,
} from '@/lib/pagination';
import { appendSortSearchParams } from '@/lib/sorting';
import type { PaginationMeta } from '@/types/pagination';
import type { SortOrder } from '@/types/sorting';

export type ContactInquirySortField = 'name' | 'email' | 'createdAt';

export type ContactInquiryStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';

export type ContactInquiryStatusFilter = ContactInquiryStatus | 'all';

export const CONTACT_INQUIRY_STATUS_OPTIONS: {
  value: ContactInquiryStatusFilter;
  label: string;
}[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'READ', label: 'Read' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactInquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminContactNotification {
  id: string;
  inquiryId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  status: ContactInquiryStatus;
  createdAt: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
}

interface ContactInquiriesResponse {
  status?: string;
  error?: string;
  data?: ContactInquiry[];
  unreadCount?: number;
  pagination?: Partial<PaginationMeta>;
}

export interface FetchContactInquiriesParams {
  status?: ContactInquiryStatusFilter;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: ContactInquirySortField;
  sortOrder?: SortOrder;
}

interface ContactInquiryMutationResponse {
  status?: string;
  error?: string;
  message?: string;
  data?: ContactInquiry | { updatedCount?: number; unreadCount?: number };
}

async function parseResponse<T>(response: Response, fallbackPath: string): Promise<T> {
  let body: T & { error?: string; message?: string } = {} as T & {
    error?: string;
    message?: string;
  };

  try {
    body = await response.json();
  } catch {
    throw new Error(`Cannot reach API at ${apiUrl(fallbackPath)}. Is the backend running?`);
  }

  if (!response.ok) {
    throw new Error(body.error || body.message || 'Request failed');
  }

  return body;
}

export function inquiryToNotification(inquiry: ContactInquiry): AdminContactNotification {
  const isNew = inquiry.status === 'NEW';

  return {
    id: inquiry.id,
    inquiryId: inquiry.id,
    title: isNew ? 'New contact inquiry' : inquiry.subject,
    message: `${inquiry.name} (${inquiry.email}): ${inquiry.subject}`,
    type: isNew ? 'info' : inquiry.status === 'REPLIED' ? 'success' : 'info',
    read: inquiry.status !== 'NEW',
    status: inquiry.status,
    createdAt: inquiry.createdAt,
    senderName: inquiry.name,
    senderEmail: inquiry.email,
    subject: inquiry.subject,
    body: inquiry.message,
  };
}

export async function fetchContactInquiries(
  params: FetchContactInquiriesParams = {},
): Promise<{
  inquiries: ContactInquiry[];
  unreadCount: number;
  pagination: PaginationMeta;
}> {
  const {
    status = 'all',
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;
  const queryParams = buildPaginationSearchParams(page, limit, {
    status: status === 'all' ? undefined : status,
    search: search?.trim() || undefined,
  });
  appendSortSearchParams(queryParams, sortBy, sortOrder);
  const query = queryParams.toString();
  const response = await fetch(apiUrl(`/admin/contact-inquiries?${query}`), {
    headers: authHeaders(),
  });

  const body = await parseResponse<ContactInquiriesResponse>(
    response,
    '/admin/contact-inquiries',
  );

  return {
    inquiries: body.data ?? [],
    unreadCount: body.unreadCount ?? 0,
    pagination: parsePaginationFromResponse(body, limit),
  };
}

export async function fetchContactInquiryUnreadCount(): Promise<number> {
  const response = await fetch(apiUrl('/admin/contact-inquiries/unread-count'), {
    headers: authHeaders(),
  });

  const body = await parseResponse<ContactInquiryMutationResponse>(
    response,
    '/admin/contact-inquiries/unread-count',
  );

  const unreadCount = (body.data as { unreadCount?: number } | undefined)?.unreadCount;
  return unreadCount ?? 0;
}

export async function updateContactInquiryStatus(
  inquiryId: string,
  status: ContactInquiryStatus,
): Promise<ContactInquiry> {
  const response = await fetch(apiUrl(`/admin/contact-inquiries/${inquiryId}`), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  const body = await parseResponse<ContactInquiryMutationResponse>(
    response,
    `/admin/contact-inquiries/${inquiryId}`,
  );

  if (!body.data || !('id' in body.data)) {
    throw new Error('Invalid response from server');
  }

  return body.data;
}

export async function replyToContactInquiry(
  inquiryId: string,
  message: string,
): Promise<ContactInquiry> {
  const response = await fetch(apiUrl(`/admin/contact-inquiries/${inquiryId}/reply`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });

  const body = await parseResponse<ContactInquiryMutationResponse>(
    response,
    `/admin/contact-inquiries/${inquiryId}/reply`,
  );

  if (!body.data || !('id' in body.data)) {
    throw new Error('Invalid response from server');
  }

  return body.data;
}

export async function markAllContactInquiriesRead(): Promise<number> {
  const response = await fetch(apiUrl('/admin/contact-inquiries/mark-all-read'), {
    method: 'PATCH',
    headers: authHeaders(),
  });

  const body = await parseResponse<ContactInquiryMutationResponse>(
    response,
    '/admin/contact-inquiries/mark-all-read',
  );

  return (body.data as { updatedCount?: number } | undefined)?.updatedCount ?? 0;
}
