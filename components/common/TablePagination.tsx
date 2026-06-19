'use client';

import type { PaginationMeta } from '@/types/pagination';
import { PAGE_SIZE_OPTIONS } from '@/types/pagination';

interface TablePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (limit: number) => void;
  pageSizeOptions?: readonly number[];
  disabled?: boolean;
  itemLabel?: string;
}

function pageRangeStart(pagination: PaginationMeta) {
  if (pagination.total === 0) return 0;
  return (pagination.page - 1) * pagination.limit + 1;
}

function pageRangeEnd(pagination: PaginationMeta) {
  if (pagination.total === 0) return 0;
  return Math.min(pagination.page * pagination.limit, pagination.total);
}

export default function TablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  disabled = false,
  itemLabel = 'items',
}: TablePaginationProps) {
  const { page, limit, total, totalPages, hasNextPage, hasPrevPage } = pagination;
  const rangeStart = pageRangeStart(pagination);
  const rangeEnd = pageRangeEnd(pagination);

  if (total === 0) {
    return null;
  }

  const navButtonClass =
    'inline-flex items-center justify-center rounded-lg border border-outline bg-surface p-2 text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-col gap-3 border-t border-outline px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-on-surface-variant">
        Showing {rangeStart}–{rangeEnd} of {total} {total === 1 ? itemLabel.replace(/s$/, '') : itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <label className="inline-flex items-center gap-2 text-xs text-on-surface-variant">
            Rows
            <select
              value={limit}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-outline bg-surface px-2 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            disabled={disabled || !hasPrevPage}
            onClick={() => onPageChange(page - 1)}
            className={navButtonClass}
            aria-label="Previous page"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>

          <span className="min-w-[5rem] px-2 text-center text-xs font-medium text-on-surface">
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            disabled={disabled || !hasNextPage}
            onClick={() => onPageChange(page + 1)}
            className={navButtonClass}
            aria-label="Next page"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
