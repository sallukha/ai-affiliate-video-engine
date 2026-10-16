import type { ApiSuccessResponse } from '../types/index.js';

export const successResponse = <T>(
  data: T,
  message?: string,
): ApiSuccessResponse<T> => ({
  success: true,
  data,
  ...(message === undefined ? {} : { message }),
});