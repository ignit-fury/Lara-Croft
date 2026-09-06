# Task 16 — Header, Footer, Layout Components (Light Theme)

**Status:** Done
**Commit:** `87a04a5` feat: add layout components (Header, Footer, Layout)

## Files Created

| File | Purpose |
|------|---------|
| `client/src/components/layout/Header.tsx` | Sticky top nav with logo, category links, cart badge, auth actions |
| `client/src/components/layout/Footer.tsx` | Footer with brand, categories, help links, newsletter |
| `client/src/components/layout/Layout.tsx` | Wraps Header + Footer around `<Outlet />` |

## Theme Applied

- **Colors:** `bg-white` background, `text-gray-800` text, `text-brand-brown` / `bg-brand-brown` accents
- **Border radius:** `rounded-none` everywhere
- **Sticky header:** `sticky top-0 z-50` with `border-b`
- **Light footer:** `bg-gray-50 border-t`
- **Cart badge:** `rounded-full h-5 w-5` pill on cart icon
- **Auth:** Google sign-in button, admin link, sign-out

## Dependencies Used

- `react-router-dom` — Link, Outlet
- `useUserStore` — user state
- `useCartStore` — cart items
- `useAuth` — signInWithGoogle, signOut

## Next

Wire Layout into router, test mobile nav, add mobile menu drawer.
