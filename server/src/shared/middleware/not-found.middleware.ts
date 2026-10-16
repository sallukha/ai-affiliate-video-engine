import type { RequestHandler } from 'express';
import { AppError, ErrorCode } from '../errors/index.js';

export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      `Route not found: ${request.method} ${request.originalUrl}`,
      404,
      ErrorCode.NOT_FOUND,
    ),
  );
};