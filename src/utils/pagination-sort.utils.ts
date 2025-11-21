import type {
  PaginationSortParams,
  PaginationSortQuery,
  UserPaginationSortParams,
  UserPaginationSortQuery,
  BlogPaginationSortParams,
  BlogPaginationSortQuery,
} from '../types/domain/pagination.types.js';

const BLOG_SORT_FIELDS = ['id', 'name', 'description', 'websiteUrl', 'createdAt', 'isMembership'];
const POST_SORT_FIELDS = ['id', 'title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt'];
const USER_SORT_FIELDS = ['id', 'login', 'email', 'createdAt'];
const COMMENT_SORT_FIELDS = ['id', 'content', 'createdAt'];

export function getPaginationSortParams(
  query: PaginationSortQuery | BlogPaginationSortQuery | UserPaginationSortQuery,
  entityType: 'blogs' | 'posts' | 'users' | 'comments'
): PaginationSortParams | BlogPaginationSortParams | UserPaginationSortParams {
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : undefined;
  const sortDirection = typeof query.sortDirection === 'string' ? query.sortDirection : undefined;

  const pageNumber = typeof query.pageNumber === 'string' ? parseInt(query.pageNumber, 10) : undefined;
  const pageSize = typeof query.pageSize === 'string' ? parseInt(query.pageSize, 10) : undefined;

  let validSortFields: string[];
  switch (entityType) {
    case 'blogs':
      validSortFields = BLOG_SORT_FIELDS;
      break;
    case 'posts':
      validSortFields = POST_SORT_FIELDS;
      break;
    case 'users':
      validSortFields = USER_SORT_FIELDS;
      break;
    case 'comments':
      validSortFields = COMMENT_SORT_FIELDS;
      break;
    default:
      throw new Error(`Invalid entity type: ${entityType}`);
  }
  const validSortBy = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const baseParams = {
    sortBy: validSortBy,
    sortDirection: sortDirection === 'asc' ? 'asc' : 'desc',
    pageNumber: pageNumber && pageNumber > 0 ? pageNumber : 1,
    pageSize: pageSize && pageSize > 0 ? pageSize : 10,
  };

  if (entityType === 'blogs') {
    const searchNameTerm =
      'searchNameTerm' in query && typeof query.searchNameTerm === 'string' ? query.searchNameTerm : undefined;
    return {
      ...baseParams,
      searchNameTerm,
    } as BlogPaginationSortParams;
  } else if (entityType === 'users') {
    const searchLoginTerm =
      'searchLoginTerm' in query && typeof query.searchLoginTerm === 'string' ? query.searchLoginTerm : undefined;
    const searchEmailTerm =
      'searchEmailTerm' in query && typeof query.searchEmailTerm === 'string' ? query.searchEmailTerm : undefined;
    return {
      ...baseParams,
      searchLoginTerm,
      searchEmailTerm,
    } as UserPaginationSortParams;
  } else {
    return baseParams as PaginationSortParams;
  }
}
