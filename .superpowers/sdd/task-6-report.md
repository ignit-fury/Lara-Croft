# Task 6 Report: Auth Routes

**Status:** Complete  
**Commit:** `2608022` — `feat: add auth routes with user sync and profile management`

## Files Created

- `server/src/controllers/authController.ts` — syncUser, getProfile, updateProfile, addAddress
- `server/src/routes/auth.ts` — routes wired with authenticate middleware

## Files Modified

- `server/src/index.ts` — imported and mounted `/api/auth` before health check

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/sync` | No | Upsert user from Supabase OAuth data |
| GET | `/api/auth/profile` | Yes | Get authenticated user profile |
| PUT | `/api/auth/profile` | Yes | Update name, avatar, preferences |
| POST | `/api/auth/addresses` | Yes | Add address to user profile |
