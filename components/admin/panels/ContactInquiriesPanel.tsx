'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@/components/common/Button';
import TablePagination from '@/components/common/TablePagination';
import SortableTableHeader from '@/components/common/SortableTableHeader';
import { ContactInquiryDetailModal } from '@/components/admin/ContactInquiryDetailModal';
import { useServerPagination } from '@/hooks/useServerPagination';
import { useServerSorting } from '@/hooks/useServerSorting';
import { emptyPaginationMeta } from '@/lib/pagination';
import type { PaginationMeta } from '@/types/pagination';
import { useAppDispatch } from '@/lib/store/hooks';
import { setContactInquiryUnreadCount } from '@/lib/store/slices/adminNotificationsSlice';
import {
  fetchContactInquiries,
  markAllContactInquiriesRead,
  updateContactInquiryStatus,
  CONTACT_INQUIRY_STATUS_OPTIONS,
  type ContactInquiry,
  type ContactInquirySortField,
  type ContactInquiryStatus,
  type ContactInquiryStatusFilter,
} from '@/lib/admin/contactInquiries';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function statusBadgeClass(status: ContactInquiryStatus) {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800';
    case 'READ':
      return 'bg-gray-100 text-gray-700';
    case 'REPLIED':
      return 'bg-green-100 text-green-800';
    case 'ARCHIVED':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function ContactInquiriesPanel() {
  const dispatch = useAppDispatch();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationMeta>(() => emptyPaginationMeta());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactInquiryStatusFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const isFirstSearchDebounce = useRef(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { page, limit, setPage, setLimit } = useServerPagination();
  const { sortBy, sortOrder, toggleSort } = useServerSorting<ContactInquirySortField>(
    'createdAt',
    'desc',
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      if (!isFirstSearchDebounce.current) {
        setPage(1);
      }
      isFirstSearchDebounce.current = false;
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, setPage]);

  const handleSort = (field: string) => {
    toggleSort(field as ContactInquirySortField);
    if (page !== 1) {
      setPage(1);
    }
  };

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const {
        inquiries: data,
        unreadCount: count,
        pagination: nextPagination,
      } = await fetchContactInquiries({
        status: statusFilter,
        search: debouncedSearch || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      if (data.length === 0 && page > 1 && nextPagination.total > 0) {
        setPage(page - 1);
        return;
      }

      setInquiries(data);
      setUnreadCount(count);
      dispatch(setContactInquiryUnreadCount(count));
      setPagination(nextPagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contact inquiries');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page, limit, sortBy, sortOrder, setPage, dispatch]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleStatusFilterChange = (value: ContactInquiryStatusFilter) => {
    setStatusFilter(value);
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleStatusChange = async (
    inquiryId: string,
    status: ContactInquiryStatus,
    closeModal = false,
  ) => {
    setIsUpdating(true);
    try {
      const updated = await updateContactInquiryStatus(inquiryId, status);
      const leavesFilteredView =
        statusFilter !== 'all' && updated.status !== statusFilter;

      if (leavesFilteredView) {
        if (inquiries.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          await loadInquiries();
        }
      } else {
        setInquiries((prev) =>
          prev.map((item) => (item.id === inquiryId ? updated : item)),
        );
      }

      if (selectedInquiry?.id === inquiryId) {
        if (closeModal) {
          setSelectedInquiry(null);
        } else {
          setSelectedInquiry(updated);
        }
      }

      setUnreadCount((prev) => {
        const wasNew = inquiries.find((i) => i.id === inquiryId)?.status === 'NEW';
        const next = wasNew && status !== 'NEW' ? Math.max(0, prev - 1) : prev;
        dispatch(setContactInquiryUnreadCount(next));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inquiry');
    } finally {
      setIsUpdating(false);
    }
  };

  const markAllAsRead = async () => {
    setIsUpdating(true);
    try {
      await markAllContactInquiriesRead();
      if (statusFilter === 'NEW') {
        await loadInquiries();
      } else {
        setInquiries((prev) =>
          prev.map((item) => (item.status === 'NEW' ? { ...item, status: 'READ' } : item)),
        );
      }
      setUnreadCount(0);
      dispatch(setContactInquiryUnreadCount(0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setIsUpdating(false);
    }
  };

  const openInquiry = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === 'NEW') {
      handleStatusChange(inquiry.id, 'READ');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative w-full max-w-xl">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
            search
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, subject, or message..."
            className="w-full rounded-lg border border-outline bg-surface py-2.5 pl-10 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-on-surface">
            Status
            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilterChange(e.target.value as ContactInquiryStatusFilter)
              }
              className="rounded-lg border border-outline bg-surface px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CONTACT_INQUIRY_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={isUpdating}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          {error}
        </div>
      )}

      <div className="bg-surface rounded-xl border border-outline shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">
              refresh
            </span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">mail</span>
            <p className="mt-3 font-medium text-on-surface">No contact inquiries</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {debouncedSearch
                ? `No inquiries match "${debouncedSearch}".`
                : statusFilter !== 'all'
                  ? `No ${CONTACT_INQUIRY_STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label.toLowerCase()} inquiries found.`
                  : 'No inquiries found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-container border-b border-outline text-[0.6875rem] uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <SortableTableHeader
                    label="Name"
                    field="name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableTableHeader
                    label="Email"
                    field="email"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <th className="px-3 py-2 font-semibold whitespace-nowrap">Subject</th>
                  <th className="px-3 py-2 font-semibold whitespace-nowrap">Status</th>
                  <SortableTableHeader
                    label="Date"
                    field="createdAt"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <th className="px-3 py-2 font-semibold whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/40">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className={`hover:bg-surface-container/50 transition-colors ${
                      inquiry.status === 'NEW' ? 'bg-primary-container/10' : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-on-surface whitespace-nowrap">
                      {inquiry.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline">
                        {inquiry.email}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-on-surface max-w-[180px] truncate">
                      {inquiry.subject}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded-full text-[0.6875rem] font-semibold ${statusBadgeClass(inquiry.status)}`}
                      >
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-on-surface-variant whitespace-nowrap">
                      {formatDateTime(inquiry.createdAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => openInquiry(inquiry)}
                          className="p-1 text-primary hover:bg-primary-container/30 rounded-md"
                          title="View details"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        {inquiry.status === 'NEW' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(inquiry.id, 'READ')}
                            className="p-1 text-on-surface-variant hover:bg-surface-container rounded-md disabled:opacity-50"
                            title="Mark as read"
                          >
                            <span className="material-symbols-outlined text-sm">drafts</span>
                          </button>
                        )}
                        {inquiry.status !== 'REPLIED' && inquiry.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(inquiry.id, 'REPLIED')}
                            className="p-1 text-green-700 hover:bg-green-50 rounded-md disabled:opacity-50"
                            title="Mark as replied"
                          >
                            <span className="material-symbols-outlined text-sm">
                              mark_email_read
                            </span>
                          </button>
                        )}
                        {inquiry.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(inquiry.id, 'ARCHIVED')}
                            className="p-1 text-on-surface-variant hover:bg-surface-container rounded-md disabled:opacity-50"
                            title="Archive"
                          >
                            <span className="material-symbols-outlined text-sm">archive</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && inquiries.length > 0 && (
          <TablePagination
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            disabled={loading || isUpdating}
            itemLabel="inquiries"
          />
        )}
      </div>

      {!loading && inquiries.length > 0 && (
        <p className="mt-3 text-xs text-on-surface-variant">
          {unreadCount > 0 ? `${unreadCount} new ${unreadCount === 1 ? 'inquiry' : 'inquiries'}` : ''}
        </p>
      )}

      <ContactInquiryDetailModal
        inquiry={
          selectedInquiry
            ? {
                id: selectedInquiry.id,
                senderName: selectedInquiry.name,
                senderEmail: selectedInquiry.email,
                subject: selectedInquiry.subject,
                body: selectedInquiry.message,
                status: selectedInquiry.status,
                createdAt: selectedInquiry.createdAt,
              }
            : null
        }
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        isUpdating={isUpdating}
        onReplySuccess={(updated) => {
          const wasNew = selectedInquiry?.status === 'NEW';
          setSelectedInquiry(updated);

          if (statusFilter !== 'all' && updated.status !== statusFilter) {
            void loadInquiries();
          } else {
            setInquiries((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item)),
            );
          }

          if (wasNew && updated.status !== 'NEW') {
            setUnreadCount((prev) => {
              const next = Math.max(0, prev - 1);
              dispatch(setContactInquiryUnreadCount(next));
              return next;
            });
          }
        }}
        onStatusChange={(status) => {
          if (!selectedInquiry) return;
          handleStatusChange(selectedInquiry.id, status, status === 'ARCHIVED');
        }}
      />
    </div>
  );
}
