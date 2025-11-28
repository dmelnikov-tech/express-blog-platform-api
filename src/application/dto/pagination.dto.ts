// значения пагинации и сортировки из req.query
export interface PaginationSortDto {
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string;
  pageSize?: string;
}

export interface BlogPaginationSortDto extends PaginationSortDto {
  searchNameTerm?: string;
}

export interface UserPaginationSortDto extends PaginationSortDto {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}
