export interface PaginationSortParams {
  sortBy: string;
  sortDirection: 1 | -1;
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedSortedResponse<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}
