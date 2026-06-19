'use client';

import { useEffect, useState } from 'react';
import type { ContactInquiry, ContactInquiryStatus } from '@/lib/admin/contactInquiries';
import { replyToContactInquiry } from '@/lib/admin/contactInquiries';

interface ContactInquiryDetailModalProps {
  inquiry: {
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    body: string;
    status: string;
    createdAt: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: 'READ' | 'REPLIED' | 'ARCHIVED') => void;
  onReplySuccess?: (inquiry: ContactInquiry) => void;
  isUpdating?: boolean;
}

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

function statusBadgeClass(status: string) {
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
      return 'bg-surface-container text-on-surface-variant';
  }
}

function statusLabel(status: string) {
  switch (status as ContactInquiryStatus) {
    case 'NEW':
      return 'New';
    case 'READ':
      return 'Read';
    case 'REPLIED':
      return 'Replied';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return status;
  }
}

function senderInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function ContactInquiryDetailModal({
  inquiry,
  isOpen,
  onClose,
  onStatusChange,
  onReplySuccess,
  isUpdating = false,
}: ContactInquiryDetailModalProps) {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReplyMessage('');
      setReplyError('');
      setReplySuccess('');
    }
  }, [isOpen, inquiry?.id]);

  if (!isOpen || !inquiry) return null;

  const isArchived = inquiry.status === 'ARCHIVED';
  const isBusy = isUpdating || isSendingReply;

  const handleSendReply = async () => {
    const trimmed = replyMessage.trim();
    if (!trimmed) {
      setReplyError('Please enter a reply message.');
      return;
    }

    setIsSendingReply(true);
    setReplyError('');
    setReplySuccess('');

    try {
      const updated = await replyToContactInquiry(inquiry.id, trimmed);
      setReplyMessage('');
      setReplySuccess('Reply sent successfully.');
      onReplySuccess?.(updated);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        aria-label="Close inquiry details"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-outline bg-surface shadow-xl animate-scale-in"
      >
        <div className="border-b border-outline bg-surface-container/60 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">mail</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(inquiry.status)}`}
                >
                  {statusLabel(inquiry.status)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {formatDateTime(inquiry.createdAt)}
                </span>
              </div>
              <h2
                id="inquiry-modal-title"
                className="mt-2 text-lg font-bold leading-snug text-on-surface sm:text-xl"
              >
                {inquiry.subject}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-outline/60 bg-surface-container/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                From
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {senderInitials(inquiry.senderName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {inquiry.senderName}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-on-surface-variant">
                    {inquiry.senderEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline/60 bg-surface-container/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Inquiry details
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-on-surface-variant">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(inquiry.status)}`}
                    >
                      {statusLabel(inquiry.status)}
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-on-surface-variant">Received</dt>
                  <dd className="text-right text-on-surface">{formatDateTime(inquiry.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Original message
            </p>
            <div className="rounded-xl border border-outline/60 bg-surface-container/30 p-4 sm:p-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
                {inquiry.body}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Your reply
            </p>
            <div className="rounded-xl border border-outline/60 bg-surface-container/20 p-4">
              <textarea
                value={replyMessage}
                onChange={(e) => {
                  setReplyMessage(e.target.value);
                  if (replyError) setReplyError('');
                  if (replySuccess) setReplySuccess('');
                }}
                disabled={isArchived || isBusy}
                rows={5}
                placeholder={
                  isArchived
                    ? 'Archived inquiries cannot be replied to.'
                    : 'Write your response to the customer...'
                }
                className="w-full resize-y rounded-lg border border-outline bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-on-surface-variant">
                  Sent via Lokhari email to {inquiry.senderEmail}
                </p>
                <button
                  type="button"
                  disabled={isArchived || isBusy || !replyMessage.trim()}
                  onClick={handleSendReply}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b5d68] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#094851] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSendingReply ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">send</span>
                      Send reply
                    </>
                  )}
                </button>
              </div>
              {replyError && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  {replyError}
                </p>
              )}
              {replySuccess && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-green-700">
                  <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                  {replySuccess}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-outline bg-surface-container/40 px-5 py-4 sm:px-6">
          {inquiry.status === 'NEW' && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onStatusChange('READ')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-outline px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">drafts</span>
              Mark read
            </button>
          )}
          {inquiry.status !== 'REPLIED' && inquiry.status !== 'ARCHIVED' && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onStatusChange('REPLIED')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-outline px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">mark_email_read</span>
              Mark replied
            </button>
          )}
          {inquiry.status !== 'ARCHIVED' && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onStatusChange('ARCHIVED')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">archive</span>
              Archive
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
