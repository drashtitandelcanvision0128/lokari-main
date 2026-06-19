export type SortOrder = 'asc' | 'desc';

export interface SortState<T extends string = string> {
  sortBy: T;
  sortOrder: SortOrder;
}
