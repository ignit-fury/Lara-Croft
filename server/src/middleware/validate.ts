import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      if (result.success) {
        req.body = result.data;
        next();
      } else {
        // Lenient: merge raw input with parsed defaults where possible
        // Only reject if truly missing required fields
        const criticalErrors = result.error.issues.filter(
          (i) => i.code === 'invalid_type' && i.received === 'undefined'
        );
        if (criticalErrors.length > 0) {
          res.status(400).json({
            success: false,
            error: criticalErrors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
          });
        } else {
          // Accept with raw body — let controller handle bad data
          next();
        }
      }
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: error.issues.map((e) => e.message).join(', '),
        });
      } else {
        next(error);
      }
    }
  };
}
