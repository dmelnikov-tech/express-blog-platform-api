import type { PaginationSortParams, PaginatedSortedResponse } from '../../domain/types/pagination.types.js';

export function createPaginatedResponse<T>(
  items: T[],
  totalCount: number,
  params: PaginationSortParams
): PaginatedSortedResponse<T> {
  const pagesCount = Math.ceil(totalCount / params.pageSize);

  return {
    pagesCount,
    page: params.pageNumber,
    pageSize: params.pageSize,
    totalCount,
    items,
  };
}
