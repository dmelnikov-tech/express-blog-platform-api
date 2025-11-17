import type { PaginationSortParams } from "../types/domain/pagination.types.js";

const BLOG_SORT_FIELDS = [
  "id",
  "name",
  "description",
  "websiteUrl",
  "createdAt",
  "isMembership",
];
const POST_SORT_FIELDS = [
  "id",
  "title",
  "shortDescription",
  "content",
  "blogId",
  "blogName",
  "createdAt",
];

export function getPaginationSortParams(
  query: Record<string, unknown>, //TODO: с помощью дженериков типизировать Request и тогда тут будет нормальный тип
  entityType: "blogs" | "posts"
): PaginationSortParams {
  const sortBy = typeof query.sortBy === "string" ? query.sortBy : undefined;
  const sortDirection =
    typeof query.sortDirection === "string" ? query.sortDirection : undefined;
  const pageNumber =
    typeof query.pageNumber === "string"
      ? parseInt(query.pageNumber, 10)
      : undefined;
  const pageSize =
    typeof query.pageSize === "string"
      ? parseInt(query.pageSize, 10)
      : undefined;

  const validSortFields =
    entityType === "blogs" ? BLOG_SORT_FIELDS : POST_SORT_FIELDS;
  const validSortBy =
    sortBy && validSortFields.includes(sortBy) ? sortBy : "createdAt";

  return {
    sortBy: validSortBy,
    sortDirection: sortDirection === "asc" ? 1 : -1,
    pageNumber: pageNumber && pageNumber > 0 ? pageNumber : 1,
    pageSize: pageSize && pageSize > 0 ? pageSize : 10,
  };
}
