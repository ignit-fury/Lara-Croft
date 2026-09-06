# Task 21-22 Report: Admin Orders, Account Page, Route Wiring

## Files Created
- `client/src/pages/admin/Orders.tsx` — Admin order management with status filter and inline status update
- `client/src/pages/Account.tsx` — User account page with orders tab and profile tab

## Files Modified
- `client/src/App.tsx` — Added all routes: `/account`, `/admin`, `/admin/orders`, `/admin/products`, `/admin/users`

## Notes
- `formatPrice` duplicated across 7 files (existing pattern). Extracting to shared util is a separate cleanup task.
- Admin routes sit outside `<Layout />` (admin has its own layout via Dashboard)
- Account route inside `<Layout />` with other consumer pages

## Commit
```
feat: add admin orders, account page, and full route wiring
```
