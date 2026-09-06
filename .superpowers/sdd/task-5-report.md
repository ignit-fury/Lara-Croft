# Task 5: Auth Middleware

## Status: COMPLETE

## Files Created
- `server/src/middleware/auth.ts` — JWT verification (`authenticate`) + role-based access (`authorize`)
- `server/src/middleware/errorHandler.ts` — centralized error handler + 404 catch-all
- `server/src/middleware/validate.ts` — Zod schema request body validation
- `server/src/middleware/logger.ts` — HTTP request logger (method, path, status, duration)

## Details
- `AuthRequest` extends `Request` with `userId` and `user` fields for downstream handlers
- `authenticate`: verifies Bearer token via `SUPABASE_JWT_SECRET`, looks up user by `supabaseId`
- `authorize(...roles)`: checks `req.user.role` against allowed roles array
- `validate`: generic Zod schema validator for `req.body`
- `errorHandler`: catches `AppError` with optional `statusCode`, defaults to 500
- `notFound`: catch-all 404 response

## Commit
`feat: add auth, error handling, validation, and logger middleware` (713f842)
