'use client';

import { useCallback, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/types/pagination';

export function useServerPagination(initialLimit = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const setLimitAndReset = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    setPage,
    setLimit: setLimitAndReset,
    resetPage,
  };
}
