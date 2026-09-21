import { Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import type { AuthRequest } from './auth';
import type { Normalized } from '../validation/schemas';

const APP_VERSION = process.env.APP_VERSION || '1.0.0';

interface ValidateOptions {
  /** Label for logs/error payload so legacy usage is greppable. */
  stage?: string;
  /** Legacy -> canonical mapper. Runs BEFORE strict parse. */
  normalize?: (raw: any) => Normalized;
  /** Validate query params instead of body (e.g. DELETE /cart/remove). */
  source?: 'body' | 'query';
}

/**
 * Two-stage validation:
 *  1. explicit legacy normalization (if provided),
 *  2. strict parse of the canonical format.
 *
 * Error semantics: failures here are ALWAYS 400 (bad business input).
 * Never 401/403 — those come from authenticate/authorize only.
 * Unexpected errors fall through to errorHandler -> 500.
 */
export function validate(schema: ZodSchema, opts: ValidateOptions = {}) {
  const { stage = 'canonical', normalize, source = 'body' } = opts;
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const raw = source === 'query' ? req.query : req.body;
      let input = raw;
      let legacyUsed = false;

      // Strip null values from objects — Zod .optional() only accepts undefined, not null
      if (input && typeof input === 'object' && !Array.isArray(input)) {
        input = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== null));
      }

      if (normalize) {
        try {
          const n = normalize(raw);
          input = n.data;
          legacyUsed = n.legacyUsed;
        } catch {
          // Normalizer crashed on garbage -> strict parse below yields 400.
          input = raw;
        }
      }

      const result = schema.safeParse(input);
      const authenticated = !!req.userId;
      const endpoint = `${req.method} ${req.path}`;

      if (result.success) {
        if (source === 'query') {
          req.query = result.data as any;
        } else {
          req.body = result.data;
        }
        if (legacyUsed) {
          // Grep `legacy-normalized` to verify old clients are gone before removal.
          console.log(
            `[VALIDATE] ${endpoint} stage=${stage} legacy-normalized authenticated=${authenticated} version=${APP_VERSION}`
          );
        }
        next();
        return;
      }

      // Log issue paths/codes only — never values (no PII/secrets in logs).
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.') || '(root)',
        code: i.code,
      }));
      console.warn(
        `[VALIDATE] ${endpoint} stage=${stage} legacy=${legacyUsed} authenticated=${authenticated} version=${APP_VERSION} errors=${JSON.stringify(issues)}`
      );
      res.status(400).json({
        success: false,
        error: result.error.issues
          .map((e) => `${e.path.join('.') || '(root)'}: ${e.message}`)
          .join(', '),
        stage,
      });
    } catch (error) {
      next(error);
    }
  };
}
