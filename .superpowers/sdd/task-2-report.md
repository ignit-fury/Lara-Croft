# Task 2: Wishlist / Save for Later — Report

## Status: ✅ Complete

All files created/modified, server and client build cleanly (`npx tsc` and `vite build`).

## Files Created
- `server/src/controllers/wishlistController.ts` — 4 endpoints: getWishlist, addToWishlist, removeFromWishlist, isInWishlist
- `server/src/routes/wishlist.ts` — Express router with authenticate middleware on all routes
- `client/src/stores/useWishlistStore.ts` — Zustand store with items, ids (Set), fetchWishlist, toggleWishlist, isInWishlist
- `client/src/pages/Wishlist.tsx` — Grid page with empty state and guest prompt

## Files Modified
- `server/src/index.ts` — Mounted `app.use('/api/wishlist', wishlistRoutes)` after upload routes
- `client/src/App.tsx` — Added `/wishlist` route (inside Layout, not protected), fetchWishlist on user login
- `client/src/components/product/ProductCard.tsx` — Heart icon (top-right) using lucide-react `Heart`, filled when in wishlist, only shown for logged-in users, stops event propagation
- `client/src/components/layout/Header.tsx` — Heart icon link to `/wishlist` with badge count, mobile menu link

## Design Decisions
- **Wishlist stored as JSONB array on users table** — no schema migration needed; gracefully treats missing/null column as empty array
- **Toggle pattern** — `toggleWishlist` checks `ids` Set, calls POST or DELETE, then re-fetches full list with product objects
- **Heart icon only visible to logged-in users** — consistent with auth requirement
- **Wishlist page not protected** — shows login prompt for guests, per brief

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/wishlist` | Yes | Returns user's wishlist with full product objects |
| POST | `/api/wishlist/:productId` | Yes | Adds product ID to wishlist |
| DELETE | `/api/wishlist/:productId` | Yes | Removes product ID from wishlist |
| GET | `/api/wishlist/check/:productId` | Yes | Returns `{ inWishlist: boolean }` |

## Build Verification
- Server: `npx tsc --noEmit` — clean, no errors
- Client: `npx vite build` — builds successfully
