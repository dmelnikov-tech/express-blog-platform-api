export interface PaginationSortParams {
  sortBy: string;
  sortDirection: "asc" | "desc";
  pageNumber: number;
  pageSize: number;
  searchNameTerm?: string; // используется только для blogs
}

export interface PaginatedSortedResponse<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}
