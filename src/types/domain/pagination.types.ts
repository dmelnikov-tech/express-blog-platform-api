// значения пагинации и сортировки из req.query
export interface PaginationSortQuery {
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string;
  pageSize?: string;
  searchNameTerm?: string;
}

// уже обработанные значения пагинации и сортировки, которые передаются в сервис и репозиторий
export interface PaginationSortParams {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
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
