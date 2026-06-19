import {
  getUnreadContactInquiryCount,
  listContactInquiries,
  markAllContactInquiriesRead,
  replyToContactInquiry,
  updateContactInquiryStatus,
} from '../services/contactService.js';
import { parsePaginationQuery, sendPaginatedResponse } from '../utils/pagination.js';
import { parseSortQuery } from '../utils/sorting.js';

const CONTACT_INQUIRY_SORT_FIELDS = {
  name: 'name',
  email: 'email',
  createdAt: 'created_at',
};

export async function getContactInquiriesHandler(req, res) {
  try {
    const statusParam = req.query.status?.trim()?.toUpperCase();
    const validStatuses = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];
    const statusFilter = validStatuses.includes(statusParam) ? statusParam : undefined;
    const search = req.query.search?.trim()?.slice(0, 200) || undefined;

    const { page, limit, skip } = parsePaginationQuery(req.query);
    const sort = parseSortQuery(req.query, {
      allowedFields: CONTACT_INQUIRY_SORT_FIELDS,
      defaultField: 'createdAt',
      defaultOrder: 'desc',
      caseInsensitiveFields: ['name', 'email'],
    });

    const [{ items, total }, unreadCount] = await Promise.all([
      listContactInquiries({
        status: statusFilter,
        search,
        skip,
        limit,
        dbField: sort.dbField,
        sortOrder: sort.sortOrder,
        caseInsensitive: sort.caseInsensitive,
      }),
      getUnreadContactInquiryCount(),
    ]);

    return sendPaginatedResponse(res, {
      data: items,
      page,
      limit,
      total,
      extra: { unreadCount },
    });
  } catch (error) {
    console.error('Get contact inquiries error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to fetch contact inquiries',
    });
  }
}

export async function getContactInquiryUnreadCountHandler(req, res) {
  try {
    const unreadCount = await getUnreadContactInquiryCount();
    return res.status(200).json({
      status: 'success',
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Get contact inquiry unread count error:', error);
    return res.status(500).json({
      error: 'Failed to fetch unread count',
    });
  }
}

export async function updateContactInquiryStatusHandler(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status?.trim()) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const inquiry = await updateContactInquiryStatus(id, status.trim().toUpperCase());

    return res.status(200).json({
      status: 'success',
      message: 'Inquiry status updated',
      data: inquiry,
    });
  } catch (error) {
    console.error('Update contact inquiry status error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to update inquiry status',
    });
  }
}

export async function markAllContactInquiriesReadHandler(req, res) {
  try {
    const updatedCount = await markAllContactInquiriesRead();

    return res.status(200).json({
      status: 'success',
      message: 'All new inquiries marked as read',
      data: { updatedCount },
    });
  } catch (error) {
    console.error('Mark all contact inquiries read error:', error);
    return res.status(500).json({
      error: 'Failed to mark inquiries as read',
    });
  }
}

export async function replyToContactInquiryHandler(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const inquiry = await replyToContactInquiry(id, { message });

    return res.status(200).json({
      status: 'success',
      message: 'Reply sent successfully',
      data: inquiry,
    });
  } catch (error) {
    console.error('Reply to contact inquiry error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to send reply',
    });
  }
}
