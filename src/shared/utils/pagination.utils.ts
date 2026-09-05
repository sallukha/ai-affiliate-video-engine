import type { PaginatedData, PaginationMeta, PaginationParams } from '../types/index.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const normalizePagination = (
  page?: number,
  limit?: number,
): PaginationParams => ({
  page: Number.isInteger(page) && page !== undefined && page > 0 ? page : DEFAULT_PAGE,
  limit: Number.isInteger(limit) && limit !== undefined && limit > 0
    ? Math.min(limit, MAX_LIMIT)
    : DEFAULT_LIMIT,
});

export const getPaginationOffset = ({ page, limit }: PaginationParams): number =>
  (page - 1) * limit;

export const createPaginationMeta = (
  { page, limit }: PaginationParams,
  total: number,
): PaginationMeta => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
};

export const createPaginatedData = <T>(
  items: T[],
  pagination: PaginationParams,
  total: number,
): PaginatedData<T> => ({
  items,
  pagination: createPaginationMeta(pagination, total),
});