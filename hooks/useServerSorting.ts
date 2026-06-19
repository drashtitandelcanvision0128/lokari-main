'use client';

import { useCallback, useState } from 'react';
import type { SortOrder } from '@/types/sorting';

export function useServerSorting<T extends string>(
  defaultSortBy: T,
  defaultSortOrder: SortOrder = 'desc',
) {
  const [sortBy, setSortBy] = useState<T>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);

  const toggleSort = useCallback(
    (field: T) => {
      if (sortBy === field) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
        return;
      }

      setSortBy(field);
      setSortOrder('asc');
    },
    [sortBy],
  );

  return {
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    toggleSort,
  };
}
