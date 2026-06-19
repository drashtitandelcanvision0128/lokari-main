import type { SortOrder } from '@/types/sorting';

export function appendSortSearchParams(
  params: URLSearchParams,
  sortBy?: string,
  sortOrder?: SortOrder,
): URLSearchParams {
  if (sortBy) {
    params.set('sortBy', sortBy);
  }
  if (sortOrder) {
    params.set('sortOrder', sortOrder);
  }
  return params;
}
