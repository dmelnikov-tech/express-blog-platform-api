// значения пагинации и сортировки из req.query
export interface PaginationSortQuery {
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string;
  pageSize?: string;
}

export interface BlogPaginationSortQuery extends PaginationSortQuery {
  searchNameTerm?: string;
}

export interface UserPaginationSortQuery extends PaginationSortQuery {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}

// уже обработанные значения пагинации и сортировки, которые передаются в сервис и репозиторий
export interface PaginationSortParams {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
}

export interface BlogPaginationSortParams extends PaginationSortParams {
  searchNameTerm?: string;
}

export interface UserPaginationSortParams extends PaginationSortParams {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}

export interface PaginatedSortedResponse<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}
