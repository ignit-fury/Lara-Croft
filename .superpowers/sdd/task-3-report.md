# Task 3: Backend Config Files

**Status:** ✅ Done

## Created Files

| File | Purpose |
|------|---------|
| `server/src/config/env.ts` | Zod env validation (all vars required with types) |
| `server/src/config/db.ts` | Mongoose connectDB() with error handling |
| `server/src/config/supabase.ts` | Supabase client (service role) |
| `server/src/config/razorpay.ts` | Razorpay instance |

## Updated Files

| File | Change |
|------|--------|
| `server/src/index.ts` | Added `connectDB()` import; server starts only after DB connects |

## Env Vars Required

```
MONGODB_URI
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
```

## Dependencies Used

- `zod` (env validation)
- `mongoose` (MongoDB)
- `@supabase/supabase-js` (auth/storage)
- `razorpay` (payments)
