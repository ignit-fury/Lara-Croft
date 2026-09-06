# Task 20: Admin Dashboard Pages

**Status:** ✅ Complete
**Commit:** `fa9d7f0` — `feat: add admin dashboard, products, and users pages`

## Files Created

| File | Purpose |
|------|---------|
| `client/src/pages/admin/Dashboard.tsx` | Stats cards (orders, revenue, users, products), orders-by-status grid, recent orders table |
| `client/src/pages/admin/Products.tsx` | Product list with image, price, stock, delete action |
| `client/src/pages/admin/Users.tsx` | User list with email, role selector dropdown, ID display |

## Features

- **Dashboard:** Fetches `/admin/dashboard`, displays 4 stat cards, status breakdown, recent orders with colored status badges
- **Products:** Fetches `/products?limit=100`, shows product image/name/brand, formatted price in INR, stock count, delete with confirmation
- **Users:** Fetches `/admin/users`, shows name/email, inline role dropdown (user/manager/admin) with API update on change

## Notes

- All pages redirect non-admin/non-manager users to `/`
- Uses existing `useUserStore`, `api` service, `react-hot-toast`, and `Product`/`User` types
- Routes not yet wired in `App.tsx` — admin routes need to be added separately
