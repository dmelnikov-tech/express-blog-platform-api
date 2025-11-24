import type {
  PaginationSortParams,
  PaginationSortQuery,
  UserPaginationSortParams,
  UserPaginationSortQuery,
  BlogPaginationSortParams,
  BlogPaginationSortQuery,
} from '../../domain/types/pagination.types.js';

const BLOG_SORT_FIELDS: string[] = ['id', 'name', 'description', 'websiteUrl', 'createdAt', 'isMembership'];
const POST_SORT_FIELDS: string[] = ['id', 'title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt'];
const USER_SORT_FIELDS: string[] = ['id', 'login', 'email', 'createdAt'];
const COMMENT_SORT_FIELDS: string[] = ['id', 'content', 'createdAt'];

export function getPaginationSortParams(
  query: PaginationSortQuery | BlogPaginationSortQuery | UserPaginationSortQuery,
  entityType: 'blogs' | 'posts' | 'users' | 'comments'
): PaginationSortParams | BlogPaginationSortParams | UserPaginationSortParams {
  const sortBy: string | undefined = typeof query.sortBy === 'string' ? query.sortBy : undefined;
  const sortDirection: string | undefined = typeof query.sortDirection === 'string' ? query.sortDirection : undefined;

  const pageNumber: number | undefined =
    typeof query.pageNumber === 'string' ? parseInt(query.pageNumber, 10) : undefined;
  const pageSize: number | undefined = typeof query.pageSize === 'string' ? parseInt(query.pageSize, 10) : undefined;

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
  const validSortBy: string = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const baseParams: PaginationSortParams = {
    sortBy: validSortBy,
    sortDirection: sortDirection === 'asc' ? 'asc' : 'desc',
    pageNumber: pageNumber && pageNumber > 0 ? pageNumber : 1,
    pageSize: pageSize && pageSize > 0 ? pageSize : 10,
  };

  if (entityType === 'blogs') {
    const searchNameTerm: string | undefined =
      'searchNameTerm' in query && typeof query.searchNameTerm === 'string' ? query.searchNameTerm : undefined;
    return {
      ...baseParams,
      searchNameTerm,
    } as BlogPaginationSortParams;
  } else if (entityType === 'users') {
    const searchLoginTerm: string | undefined =
      'searchLoginTerm' in query && typeof query.searchLoginTerm === 'string' ? query.searchLoginTerm : undefined;
    const searchEmailTerm: string | undefined =
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
