# Task 18: Home Page, Cart Page, and App Router

**Status:** Done  
**Date:** 2026-09-06

## Summary

Created the home page with hero, featured products, and category grid. Created the cart page with full order summary. Updated App.tsx with proper routing using Layout wrapper.

## Files Created/Modified

| File | Action |
|------|--------|
| `client/src/pages/Home.tsx` | Created |
| `client/src/pages/Cart.tsx` | Created |
| `client/src/App.tsx` | Replaced |

## Implementation

- **Home.tsx**: Fetches featured products and categories from API. Renders hero section with brand messaging, category grid (6-col responsive), featured product grid using ProductGrid component, and promotional banner.
- **Cart.tsx**: Renders cart items with quantity controls, order summary with subtotal/shipping/tax/total calculations. Shows sign-in prompt if unauthenticated, empty cart state if no items.
- **App.tsx**: Sets up BrowserRouter with Toaster, all routes nested under Layout: `/` (Home), `/product/:slug` (ProductDetail), `/category/:slug` (CategoryPage), `/cart` (Cart). Initializes auth via `useAuth` hook and fetches cart on user change.
