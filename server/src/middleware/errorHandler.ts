import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);

  // Zod / request validation errors — safe to expose the issue list
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
    });
    return;
  }

  // Express-rate-limit and similar known errors carry a statusCode
  const statusCode = (err as any).statusCode || 500;

  // Production: never leak raw error messages or stack traces to the client
  const message =
    statusCode === 500
      ? 'Internal server error'
      : (err.message || 'Something went wrong');

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
}
