import type { PaginationMeta } from '@/types/pagination';

export { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/types/pagination';

export function buildPaginationSearchParams(
  page: number,
  limit: number,
  extra?: Record<string, string | number | boolean | undefined | null>,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined || value === null || value === '') continue;
      if (value === false) continue;
      params.set(key, value === true ? 'true' : String(value));
    }
  }

  return params;
}

export function emptyPaginationMeta(limit = 10): PaginationMeta {
  return {
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };
}

export function parsePaginationFromResponse(
  body: { pagination?: Partial<PaginationMeta> },
  fallbackLimit = 10,
): PaginationMeta {
  const pagination = body.pagination;

  if (!pagination) {
    return emptyPaginationMeta(fallbackLimit);
  }

  return {
    page: pagination.page ?? 1,
    limit: pagination.limit ?? fallbackLimit,
    total: pagination.total ?? 0,
    totalPages: pagination.totalPages ?? 0,
    hasNextPage: pagination.hasNextPage ?? false,
    hasPrevPage: pagination.hasPrevPage ?? false,
  };
}
