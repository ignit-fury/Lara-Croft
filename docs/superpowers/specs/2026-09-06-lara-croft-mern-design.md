# LARA CROFT - MERN Stack E-Commerce Design

**Date:** 2026-09-06
**Project:** Prima Facie — LARA CROFT
**Timeline:** MVP in 2-3 weeks

---

## 1. Architecture Overview

### Approach: Full MERN + Supabase Hybrid

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Frontend** | React 18 + Vite + TypeScript | UI, state management, Supabase realtime client |
| **Backend** | Express + TypeScript | REST API, business logic, MongoDB operations, Razorpay webhooks |
| **Database** | MongoDB Atlas (Mongoose) | Products, Orders, Users, Cart, Categories, Reviews |
| **Auth** | Supabase (Google OAuth) | Authentication, JWT issuance, user management |
| **Realtime** | Supabase Realtime | Cart sync, order tracking, live charts, chat |
| **Payments** | Razorpay | Checkout sessions, webhooks, payment links |
| **Storage** | Supabase Storage | Product images, user avatars |
| **Admin** | React (separate /admin route) | Dashboard, CRUD, analytics |

---

## 2. Backend Architecture

### Project Structure
```
server/
├── src/
│   ├── config/           # Environment, DB, Supabase, Razorpay config
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routers
│   ├── services/         # Business logic (Razorpay, email, etc.)
│   ├── utils/            # Helpers, constants
│   └── index.ts          # Entry point
├── package.json
└── tsconfig.json
```

### API Routes
| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth` | POST | Supabase token verification, user sync |
| `/api/products` | GET, POST, PUT, DELETE | Product CRUD (admin: write) |
| `/api/categories` | GET, POST, PUT, DELETE | Category management |
| `/api/orders` | GET, POST, PUT | Order creation, history, status updates |
| `/api/cart` | GET, POST, PUT, DELETE | Cart operations |
| `/api/users` | GET, PUT | Profile, addresses, preferences |
| `/api/admin` | GET, POST, PUT, DELETE | Admin-only: dashboard stats, bulk ops |
| `/api/webhooks/razorpay` | POST | Razorpay webhook handler |

### Authentication Flow
1. Frontend: User clicks "Sign in with Google" → Supabase OAuth
2. Supabase returns JWT (access_token) + refresh_token
3. Frontend stores tokens, sends `Authorization: Bearer <access_token>` on API calls
4. Backend middleware verifies JWT with Supabase JWKS
5. Backend extracts `sub` (Supabase UUID), looks up/creates MongoDB user document
6. Attach `req.user` with MongoDB user + Supabase claims

---

## 3. Frontend Architecture

### Project Structure
```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Base components (Button, Input, Modal, etc.)
│   │   ├── layout/       # Header, Footer, CartDrawer, MobileMenu
│   │   ├── products/     # ProductCard, ProductGrid, ProductModal
│   │   ├── cart/         # CartItem, CartSummary
│   │   └── admin/        # Admin-specific components
│   ├── pages/            # Route-level components
│   │   ├── Home.tsx
│   │   ├── Shop.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Account.tsx
│   │   └── admin/        # Admin pages
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React Context (Auth, Cart, UI)
│   ├── services/         # API clients (axios, Supabase)
│   ├── stores/           # Zustand stores (cart, ui)
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Helpers, formatters
│   ├── styles/           # Tailwind config, global styles
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### State Management
- **TanStack Query**: Server state (products, orders, user data)
- **Zustand**: Client state (cart, UI modals, filters, toast)
- **Supabase Realtime**: Live subscriptions (cart, orders, chat)

### Styling
- **Tailwind CSS** matching the original design system:
  - Colors: `--bg:#ffffff`, `--accent:#6f4423`, `--gold:#6f4423`
  - Font: Inter (headline + body)
  - Roundness: 0px (flat design)
  - Light mode (white background, brown accent)

---

## 4. Database Schema (MongoDB)

### Collections

#### Users
```typescript
{
  _id: ObjectId,
  supabaseId: string,        // Supabase UUID (unique index)
  email: string,
  name: string,
  avatar?: string,
  role: 'user' | 'admin' | 'manager',
  addresses: Address[],
  preferences: {
    newsletter: boolean,
    notifications: boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Products
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string,              // unique index
  category: ObjectId,        // ref Category
  brand: string,             // "LARA CROFT"
  price: number,             // current price in INR (paise)
  originalPrice: number,     // original price in INR (paise)
  images: string[],          // Supabase Storage URLs
  sizes: string[],           // ["S", "M", "L", "XL", "2XL"]
  stock: number,             // total inventory
  stockBySize?: Record<string, number>,
  description: string,
  featured: boolean,
  tags: string[],
  createdAt: Date,
  updatedAt: Date
}
```

#### Categories
```typescript
{
  _id: ObjectId,
  name: string,              // "Shirts", "T-Shirts", "Trousers", "Jeans"
  slug: string,              // unique
  image?: string,
  order: number,
  active: boolean
}
```

#### Orders
```typescript
{
  _id: ObjectId,
  user: ObjectId,            // ref User
  items: OrderItem[],
  subtotal: number,
  shipping: number,
  tax: number,
  total: number,
  currency: 'INR',
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  razorpayOrderId?: string,
  razorpayPaymentId?: string,
  shippingAddress: Address,
  billingAddress?: Address,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}

OrderItem: {
  product: ObjectId,
  name: string,              // snapshot
  price: number,             // snapshot
  size: string,
  quantity: number,
  image: string
}
```

#### Cart
```typescript
{
  _id: ObjectId,
  user: ObjectId,            // ref User (unique)
  items: CartItem[],
  updatedAt: Date
}

CartItem: {
  product: ObjectId,
  size: string,
  quantity: number
}
```

#### Reviews
```typescript
{
  _id: ObjectId,
  product: ObjectId,
  user: ObjectId,
  rating: number,            // 1-5
  title: string,
  content: string,
  verified: boolean,
  createdAt: Date
}
```

### Indexes
- Products: `slug` (unique), `category`, `featured`, `price`
- Orders: `user`, `status`, `createdAt`
- Cart: `user` (unique)
- Users: `supabaseId` (unique), `email`

---

## 5. Real-time Features (Supabase Realtime)

### Channels & Events

| Feature | Channel | Event | Payload |
|---------|---------|-------|---------|
| **Cart Sync** | `cart:{userId}` | `cart:updated` | `{ items: CartItem[], updatedAt }` |
| **Order Tracking** | `order:{orderId}` | `order:status_changed` | `{ status, updatedAt }` |
| **Live Charts (Admin)** | `admin:dashboard` | `orders:insert`, `products:update` | `{ type, data }` |
| **Chat Support** | `chat:{conversationId}` | `message:new` | `{ id, sender, content, timestamp }` |

### Frontend Implementation
```typescript
// Cart sync example
const cartChannel = supabase.channel(`cart:${userId}`)
  .on('broadcast', { event: 'cart:updated' }, handleCartUpdate)
  .subscribe()

// Order tracking
const orderChannel = supabase.channel(`order:${orderId}`)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, handleOrderUpdate)
  .subscribe()
```

### Backend Broadcast
After cart/order mutations, backend broadcasts to Supabase Realtime:
```typescript
await supabase.channel(`cart:${userId}`).send({
  type: 'broadcast',
  event: 'cart:updated',
  payload: { items: cart.items, updatedAt: new Date() }
})
```

---

## 6. Admin Panel

### Route Structure
```
/admin                          # Dashboard (protected: admin/manager)
/admin/products                 # Product list + CRUD
/admin/products/new             # Create product
/admin/products/:id/edit        # Edit product
/admin/orders                   # Order management
/admin/orders/:id               # Order detail + status update
/admin/users                    # User management
/admin/analytics                # Revenue, conversion, top products
/admin/settings                 # Site config, Razorpay keys, email templates
```

### Dashboard Widgets
- Revenue chart (last 30 days) - Supabase Realtime updates
- Orders chart (status distribution)
- Top selling products
- Low stock alerts
- Recent orders feed

### Role-Based Access
| Role | Products | Orders | Users | Analytics | Settings |
|------|----------|--------|-------|-----------|----------|
| Admin | CRUD | CRUD | CRUD | Read | Write |
| Manager | CRUD | Read/Update | Read | Read | Read |
| User | - | - | - | - | - |

---

## 7. Payment Integration (Razorpay)

### Flow
1. User clicks checkout → Frontend calls `POST /api/orders/create-checkout-session`
2. Backend creates Razorpay Order with amount, currency, receipt
3. Backend returns `order_id` → Frontend opens Razorpay checkout modal
4. User pays on Razorpay modal
5. Razorpay returns success/failure response
6. Frontend calls `POST /api/orders/confirm/{orderId}` → Backend verifies with Razorpay, creates order
7. Razorpay webhook (`/api/webhooks/razorpay`) handles async events (payment.captured, payment.failed, etc.)

### Webhook Events Handled
- `payment.captured` → Create order, clear cart, send confirmation email
- `payment.failed` → Update order status, notify user
- `refund.created` → Update order status to refunded

---

## 8. Deployment & DevOps

### Environments
| Env | Frontend | Backend | Database |
|-----|----------|---------|----------|
| Local | Vite dev server (port 5173) | tsx watch (port 3001) | MongoDB Atlas (dev cluster) |
| Staging | Vercel/Netlify | Render/Railway | MongoDB Atlas (staging) |
| Production | Vercel/Netlify | Render/Railway | MongoDB Atlas (prod) |

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...        # For JWT verification
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

---

## 9. Security Considerations

- **Rate limiting**: Express-rate-limit on auth and API routes
- **CORS**: Restricted to frontend domain
- **Helmet**: Security headers
- **Input validation**: Zod schemas on all routes
- **JWT verification**: Supabase JWKS rotation handled automatically
- **Admin routes**: Role middleware + Supabase claims verification
- **Razorpay webhooks**: Signature verification required

---

## 10. Testing Strategy

- **Unit**: Vitest for utilities, services
- **Integration**: Supertest for API routes
- **E2E**: Playwright for critical flows (checkout, auth, admin)
- **Coverage target**: 70%+ for backend, 60%+ for frontend

---

## 11. MVP Scope (2-3 weeks)

### Week 1: Foundation
- [ ] Monorepo setup with shared types
- [ ] Backend: Express + TS + MongoDB connection
- [ ] Backend: Auth middleware (Supabase JWT verification)
- [ ] Backend: Products CRUD + Categories
- [ ] Frontend: Vite + React + TS + Tailwind
- [ ] Frontend: Supabase Auth (Google OAuth)
- [ ] Frontend: Product grid, filtering, product modal

### Week 2: Core Features
- [ ] Cart (Zustand + Supabase Realtime sync)
- [ ] Checkout flow with Razorpay
- [ ] Orders API + Order confirmation
- [ ] User account page (orders, profile)
- [ ] Admin: Product CRUD, Order management
- [ ] Admin: Dashboard with charts

### Week 3: Polish & Deploy
- [ ] Chat support widget (Supabase Realtime)
- [ ] Email notifications (Resend/SendGrid)
- [ ] Error tracking (Sentry)
- [ ] CI/CD pipelines
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Documentation

---

## 12. Future Enhancements (Post-MVP)

- Wishlist / Favorites
- Product reviews & ratings
- Multi-currency (Razorpay)
- Inventory management with low-stock alerts
- Discount codes / Coupons
- Affiliate / Referral program
- PWA support
- Advanced analytics (Mixpanel/PostHog)

---

## Approval

- [ ] Backend Architecture: **Approved**
- [ ] Frontend Architecture: **Approved**
- [ ] Database Schema: **Approved**
- [ ] Real-time Features: **Approved**
- [ ] Admin Panel: **Approved**

**Next Step:** Invoke `writing-plans` skill to create detailed implementation plan.