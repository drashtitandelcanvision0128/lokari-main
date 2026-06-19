'use client';

import type { SortOrder } from '@/types/sorting';

interface SortableTableHeaderProps {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (field: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export default function SortableTableHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
  align = 'left',
  className = '',
}: SortableTableHeaderProps) {
  const isActive = sortBy === field;

  return (
    <th
      className={`px-3 py-2 font-semibold whitespace-nowrap ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-on-surface ${
          isActive ? 'text-on-surface' : 'text-on-surface-variant'
        } ${align === 'right' ? 'ml-auto' : ''}`}
        aria-sort={
          isActive ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'
        }
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-sm leading-none">
          {isActive
            ? sortOrder === 'asc'
              ? 'arrow_upward'
              : 'arrow_downward'
            : 'unfold_more'}
        </span>
      </button>
    </th>
  );
}
