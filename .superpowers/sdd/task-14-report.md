# Task 14 — Google OAuth Sign-In/Sign-Out with Supabase

## Summary
Implemented Google OAuth authentication flow using Supabase Auth with JWT token persistence and Zustand state management.

## Files Created

### `client/src/hooks/useAuth.ts`
- Handles session initialization via `supabase.auth.getSession()`
- Listens for auth state changes (`SIGNED_IN`, `SIGNED_OUT`)
- Stores Supabase JWT in `localStorage` as `supabase_token`
- Syncs user data to backend via `POST /auth/sync` on each sign-in
- Provides `signInWithGoogle()` and `signOut()` methods
- Returns `{ loading, signInWithGoogle, signOut }`

### `client/src/stores/useUserStore.ts`
- Zustand store for user state
- Actions: `setUser(user)`, `clearUser()`
- Used by `useAuth` hook to persist authenticated user across components

### `client/src/stores/useCartStore.ts`
- Zustand store for cart state with async API integration
- Actions: `fetchCart`, `addItem`, `updateItem`, `removeItem`, `clearCart`, `total()`
- All mutations hit backend API and sync returned cart items to state

## Auth Flow
1. User clicks "Sign in with Google" → `supabase.auth.signInWithOAuth({ provider: 'google' })`
2. Supabase redirects to Google → callback returns to app origin
3. `onAuthStateChange` fires `SIGNED_IN` → stores JWT in localStorage
4. JWT sent via `api` interceptor (assumed configured in `services/api.ts`)
5. Backend `POST /auth/sync` creates/updates user record
6. Sign-out clears Supabase session, localStorage, and Zustand state

## Commit
`feat: add Supabase Google OAuth with auth hooks and Zustand stores`
