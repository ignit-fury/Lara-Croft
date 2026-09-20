# Task 6: Guest Checkout — Implementation Report

## Status: ✅ Complete

## Files Created (4)

### `server/src/controllers/guestCartController.ts`
- In-memory `Map<sessionId, {items[], expiresAt}>` with 24h TTL
- Endpoints: `getGuestCart`, `addToGuestCart`, `updateGuestCart`, `removeFromGuestCart`
- `clearGuestCart(sessionId)` exported for order confirmation cleanup
- Auto-cleanup of expired sessions on each request

### `server/src/controllers/guestOrderController.ts`
- `createGuestCheckoutSession`: validates email/name/phone/address/items, checks stock, creates Razorpay order, inserts DB order with `user_id: null`, stores `guest_session_id` + `guest_email` + `guest_name`
- `confirmGuestOrder`: verifies Razorpay signature, matches order by `razorpay_order_id` + `guest_session_id` (IDOR guard), decrements stock, sends confirmation email to `guest_email`, clears guest cart

### `client/src/hooks/useGuestSession.ts`
- Generates UUID on first visit, stores in `localStorage` as `guest_session_id`
- Reuses existing session across page reloads

### `client/src/stores/useGuestCartStore.ts`
- Zustand store mirroring `useCartStore` shape
- `items` persisted in `localStorage` as JSON
- `addItem`, `updateItem`, `removeItem`, `clearCart`, `total`
- Syncs with server via `/cart/guest/:sessionId` endpoints on each mutation

## Files Modified (3)

### `server/src/routes/guestCheckout.ts` (NEW)
- All guest routes (no auth middleware):
  - `POST /orders/guest-checkout` — `createGuestCheckoutSession`
  - `POST /orders/guest-confirm` — `confirmGuestOrder`
  - `GET /cart/guest/:sessionId` — `getGuestCart`
  - `POST /cart/guest/:sessionId` — `addToGuestCart`
  - `PUT /cart/guest/:sessionId` — `updateGuestCart`
  - `DELETE /cart/guest/:sessionId` — `removeFromGuestCart`

### `server/src/index.ts`
- Imported `guestCheckoutRoutes` from `./routes/guestCheckout`
- Mounted at `/api` **before** auth-required routes
- Added checkout rate limiter to `/api/orders/guest-checkout`

### `client/src/pages/Checkout.tsx`
- Removed `if (!user) return <Navigate to="/" replace />` redirect
- Added guest info form (name, email, phone) shown when `!user`
- Guest flow: submits to `/orders/guest-checkout` with items from guest cart store
- Guest confirm: posts to `/orders/guest-confirm` with `guestSessionId`
- Auth flow: unchanged (`/orders/create-checkout-session` + `/orders/confirm`)
- Uses `useGuestSession` hook for session ID

### `client/src/App.tsx`
- Moved `<Route path="/checkout" element={<Checkout />} />` **outside** `ProtectedRoute`
- `/checkout/success` and `/account` remain inside `ProtectedRoute`

## Build Verification
- ✅ Server: `npx tsc` — 0 errors
- ✅ Client: `npx vite build` — 0 errors (2369 modules, 346ms)

## Constraints Met
- No database schema changes
- No new environment variables
- Guest cart TTL: 24 hours (in-memory Map)
- Razorpay uses INR
- Guest orders store `guest_email`, `guest_name`, `guest_session_id`
- Stock decrement works identically for guest and authenticated orders
