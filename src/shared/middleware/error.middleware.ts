import type { ErrorRequestHandler } from 'express';
import { AppError, ErrorCode } from '../errors/index.js';
import type { ApiErrorResponse } from '../types/index.js';

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  const appError = error instanceof AppError
    ? error
    : new AppError('An unexpected error occurred', 500, ErrorCode.INTERNAL_ERROR, undefined, false);

  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details === undefined ? {} : { details: appError.details }),
    },
  };

  response.status(appError.statusCode).json(payload);
};