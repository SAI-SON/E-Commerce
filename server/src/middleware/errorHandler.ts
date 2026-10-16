import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/index.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: unknown;

  constructor(message: string, statusCode = 500, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  } else if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as { code?: string; meta?: Record<string, unknown> };
    if (prismaErr.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this unique value already exists';
      errors = prismaErr.meta;
    } else if (prismaErr.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    }
  }

  // Log error in development or operational
  if (config.env === 'development' || statusCode === 500) {
    console.error(`[API Error] ${statusCode} - ${err.message}`, err);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errors,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};
