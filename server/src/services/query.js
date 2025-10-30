const {
  PAGINATION_DEFAULT_PAGE_NUMBER,
  PAGINATION_DEFAULT_PAGE_LIMIT,
} = process.env;

export function getPagination(query) {
  const page = Math.abs(query.page) || PAGINATION_DEFAULT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || PAGINATION_DEFAULT_PAGE_LIMIT;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit
  }
}
