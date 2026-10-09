import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: true,
      code: err.code,
      message: err.message,
      details: err.details || undefined,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: true,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: true,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}