import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const APP_VERSION = process.env.APP_VERSION || '1.0.0';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Body parse errors (SyntaxError from express.json())
  if (err instanceof SyntaxError && 'body' in err) {
    const ct = req.headers['content-type'] || 'unknown';
    const preview = (req as any)._rawBodyPreview || '(no preview)';
    console.warn(
      `[ERROR] ${req.method} ${req.path} status=400 stage=body-parse content-type=${ct} authenticated=${!!(req as any).userId} version=${APP_VERSION} preview=${JSON.stringify(preview)}`
    );
    res.status(400).json({
      success: false,
      error: 'Invalid request body. Expected JSON.',
    });
    return;
  }

  // Zod / request validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
    });
    return;
  }

  const statusCode = (err as any).statusCode || 500;
  const message =
    statusCode === 500
      ? 'Internal server error'
      : (err.message || 'Something went wrong');

  console.error(
    `[ERROR] ${req.method} ${req.path} status=${statusCode} authenticated=${!!(req as any).userId} version=${APP_VERSION} message=${message}`
  );

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
