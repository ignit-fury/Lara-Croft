# Lara Croft MERN Stack — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully dynamic MERN stack e-commerce app for Prima Facie — LARA CROFT with Supabase auth, Razorpay payments, real-time features, and admin dashboard.

**Architecture:** Express + TypeScript backend with MongoDB Atlas (Mongoose), React + Vite + TypeScript frontend with Tailwind CSS. Supabase handles Google OAuth, realtime subscriptions, and file storage. Razorpay for checkout sessions and webhooks. Monorepo with `/client` and `/server` folders.

**Tech Stack:** Express, MongoDB/Mongoose, Supabase JS, Razorpay, React 18, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, React Router v6, Vitest, Supertest.

## Global Constraints

- Node.js >= 18, npm >= 9
- TypeScript strict mode in both client and server
- MongoDB Atlas free tier (M0) for development
- Supabase free tier for auth, realtime, storage
- Razorpay test mode for development
- Tailwind CSS light mode (white background, brown accent #6f4423)
- Brand name: "LARA CROFT" (not "Lara Croft Edition")
- Currency: INR (paise for storage, display as ₹X,XXX)
- No comments in code unless explicitly requested
- All API responses follow `{ success: boolean, data?: T, error?: string }` envelope

---

## File Structure

```
Lara Croft/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/ui/           # Button, Input, Modal, Toast, Badge
│   │   ├── components/layout/       # Header, Footer, CartDrawer, MobileMenu
│   │   ├── components/products/     # ProductCard, ProductGrid, ProductModal
│   │   ├── components/cart/         # CartItem, CartSummary
│   │   ├── components/admin/        # AdminLayout, Sidebar, StatsCard, DataTable
│   │   ├── pages/                   # Home, Shop, ProductDetail, Checkout, Account, Auth
│   │   ├── pages/admin/             # Dashboard, Products, Orders, Users, Settings
│   │   ├── hooks/                   # useProducts, useCart, useOrders, useAuth
│   │   ├── stores/                  # cartStore, uiStore
│   │   ├── services/                # api.ts (axios), supabase.ts, razorpay.ts
│   │   ├── types/                   # index.ts (shared types)
│   │   ├── utils/                   # formatters, validators
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/                  # db.ts, supabase.ts, razorpay.ts, env.ts
│   │   ├── middleware/              # auth.ts, errorHandler.ts, validate.ts, admin.ts
│   │   ├── models/                  # User, Product, Category, Order, Cart, Review, Conversation, Message
│   │   ├── routes/                  # auth, products, categories, orders, cart, users, admin, webhooks
│   │   ├── controllers/            # One per route file
│   │   ├── services/               # razorpayService.ts, emailService.ts, realtimeService.ts
│   │   ├── utils/                   # helpers, constants
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── package.json                      # Root workspace config
```

---

## Phase 1: Foundation (Week 1)

### Task 1: Monorepo Scaffold + Root Config

**Files:**
- Create: `package.json` (root)
- Create: `client/` (Vite React TS scaffold)
- Create: `server/` (Express TS scaffold)

**Step 1: Init root workspace**

```bash
npm init -y
```

Edit `package.json`:
```json
{
  "name": "prima-facie",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "npm run build --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**Step 2: Scaffold client with Vite**

```bash
npm create vite@latest client -- --template react-ts
cd client && npm install
npm install -D tailwindcss @tailwindcss/vite
npm install axios @tanstack/react-query zustand react-router-dom @supabase/supabase-js razorpay react-hot-toast
```

**Step 3: Scaffold server with Express**

```bash
mkdir -p server/src/{config,middleware,models,routes,controllers,services,utils}
cd server
npm init -y
npm install express cors helmet dotenv mongoose morgan express-rate-limit
npm install -D typescript @types/express @types/cors @types/morgan @types/node tsx nodemon vitest supertest @types/supertest zod
```

**Step 4: Configure TypeScript for server**

Create `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Create `server/src/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Create `server/.env`:
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://placeholder.mongodb.net/prima-facie?retryWrites=true&w=majority
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_ANON_KEY=placeholder-anon-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key
SUPABASE_JWT_SECRET=placeholder-jwt-secret
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder
RAZORPAY_WEBHOOK_SECRET=placeholder
FRONTEND_URL=http://localhost:5173
```

Add server scripts to `server/package.json`:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest"
  }
}
```

**Step 5: Verify both servers start**

```bash
cd server && npm run dev
# Should print: Server running on port 3001
# curl http://localhost:3001/api/health → {"success":true,"data":{"status":"ok"}}
```

**Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold monorepo with Express + Vite React TS"
```

---

### Task 2: Shared Types

**Files:**
- Create: `client/src/types/index.ts`

**Step 1: Define shared TypeScript interfaces**

```typescript
export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: Category;
  brand: string;
  price: number;
  originalPrice: number;
  images: string[];
  sizes: string[];
  stock: number;
  stockBySize?: Record<string, number>;
  description: string;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  order: number;
  active: boolean;
}

export interface User {
  _id: string;
  supabaseId: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager';
  addresses: Address[];
  preferences: { newsletter: boolean; notifications: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

**Step 2: Commit**

```bash
git add client/src/types/
git commit -m "feat: add shared TypeScript types"
```

---

### Task 3: Backend Config (DB, Supabase, Razorpay)

**Files:**
- Create: `server/src/config/db.ts`
- Create: `server/src/config/supabase.ts`
- Create: `server/src/config/razorpay.ts`
- Create: `server/src/config/env.ts`

**Step 1: Create env config with Zod validation**

```typescript
// server/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

**Step 2: Create MongoDB connection**

```typescript
// server/src/config/db.ts
import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
```

**Step 3: Create Supabase admin client**

```typescript
// server/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
```

**Step 4: Create Razorpay client**

```typescript
// server/src/config/razorpay.ts
import Razorpay from 'razorpay';
import { env } from './env';

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});
```

**Step 5: Update server/src/index.ts to use configs**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { env } from './config/env';
import { connectDB } from './config/db';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start().catch(console.error);
```

**Step 6: Commit**

```bash
git add server/src/
git commit -m "feat: add backend config for MongoDB, Supabase, Razorpay"
```

---

### Task 4: Mongoose Models

**Files:**
- Create: `server/src/models/User.ts`
- Create: `server/src/models/Product.ts`
- Create: `server/src/models/Category.ts`
- Create: `server/src/models/Order.ts`
- Create: `server/src/models/Cart.ts`
- Create: `server/src/models/Review.ts`

**Step 1: User model**

```typescript
// server/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  supabaseId: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager';
  addresses: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  }[];
  preferences: { newsletter: boolean; notifications: boolean };
}

const UserSchema = new Schema<IUser>({
  supabaseId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  role: { type: String, enum: ['user', 'admin', 'manager'], default: 'user' },
  addresses: [{
    label: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'IN' },
    phone: String,
  }],
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
  },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
```

**Step 2: Category model**

```typescript
// server/src/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  order: number;
  active: boolean;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: String,
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
```

**Step 3: Product model**

```typescript
// server/src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  price: number;
  originalPrice: number;
  images: string[];
  sizes: string[];
  stock: number;
  stockBySize: Record<string, number>;
  description: string;
  featured: boolean;
  tags: string[];
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, default: 'LARA CROFT' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  images: [{ type: String }],
  sizes: [{ type: String }],
  stock: { type: Number, default: 0 },
  stockBySize: { type: Map, of: Number },
  description: { type: String, required: true },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

ProductSchema.index({ category: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
```

**Step 4: Order model**

```typescript
// server/src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  notes?: string;
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    size: String,
    quantity: Number,
    image: String,
  }],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  shippingAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'IN' },
    phone: String,
  },
  notes: String,
}, { timestamps: true });

OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
```

**Step 5: Cart model**

```typescript
// server/src/models/Cart.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  size: string;
  quantity: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
}

const CartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    size: String,
    quantity: { type: Number, default: 1 },
  }],
}, { timestamps: true });

export default mongoose.model<ICart>('Cart', CartSchema);
```

**Step 6: Review model**

```typescript
// server/src/models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
}

const ReviewSchema = new Schema<IReview>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  content: { type: String, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
```

**Step 7: Commit**

```bash
git add server/src/models/
git commit -m "feat: add Mongoose models for User, Product, Category, Order, Cart, Review"
```

---

### Task 5: Auth Middleware (Supabase JWT Verification)

**Files:**
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/middleware/admin.ts`

**Step 1: Auth middleware**

```typescript
// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
    }) as { sub: string; email: string; name?: string };

    const user = await User.findOne({ supabaseId: decoded.sub });
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
    }) as { sub: string; email: string };

    User.findOne({ supabaseId: decoded.sub }).then((user) => {
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
      next();
    }).catch(() => next());
  } catch {
    next();
  }
}
```

**Step 2: Error handler middleware**

```typescript
// server/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: err.errors.map(e => e.message).join(', '),
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ success: false, error: 'Invalid ID format' });
    return;
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json({ success: false, error: 'Duplicate entry' });
    return;
  }

  res.status(500).json({ success: false, error: 'Internal server error' });
}
```

**Step 3: Admin middleware**

```typescript
// server/src/middleware/admin.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  next();
}

export function managerOrAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
    res.status(403).json({ success: false, error: 'Manager or admin access required' });
    return;
  }
  next();
}
```

**Step 4: Install jsonwebtoken types**

```bash
cd server && npm install jsonwebtoken && npm install -D @types/jsonwebtoken
```

**Step 5: Update index.ts to use error handler**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start().catch(console.error);
```

**Step 6: Commit**

```bash
git add server/src/middleware/ server/src/index.ts
git commit -m "feat: add auth, admin, and error handler middleware"
```

---

### Task 6: Auth Routes + Sync User

**Files:**
- Create: `server/src/routes/auth.ts`
- Create: `server/src/controllers/authController.ts`

**Step 1: Auth controller**

```typescript
// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { z } from 'zod';

const syncSchema = z.object({
  supabaseId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
});

export async function syncUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = syncSchema.parse(req.body);
    const { supabaseId, email, name, avatar } = data;

    let user = await User.findOne({ supabaseId });

    if (user) {
      user.name = name;
      if (avatar) user.avatar = avatar;
      await user.save();
    } else {
      user = await User.create({ supabaseId, email, name, avatar });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to sync user' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }
  res.json({ success: true, data: req.user });
}

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  const { name, avatar, addresses, preferences } = req.body;

  if (name) req.user.name = name;
  if (avatar) req.user.avatar = avatar;
  if (addresses) req.user.addresses = addresses;
  if (preferences) req.user.preferences = { ...req.user.preferences, ...preferences };

  await req.user.save();
  res.json({ success: true, data: req.user });
}
```

**Step 2: Auth routes**

```typescript
// server/src/routes/auth.ts
import { Router } from 'express';
import { syncUser, getMe, updateMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/sync', syncUser);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);

export default router;
```

**Step 3: Mount in index.ts**

Add to `server/src/index.ts` before error handler:
```typescript
import authRoutes from './routes/auth';

// ... existing code ...
app.use('/api/auth', authRoutes);
app.use(errorHandler);
```

**Step 4: Commit**

```bash
git add server/src/routes/auth.ts server/src/controllers/authController.ts server/src/index.ts
git commit -m "feat: add auth routes with user sync and profile"
```

---

### Task 7: Product & Category Controllers + Routes

**Files:**
- Create: `server/src/controllers/productController.ts`
- Create: `server/src/controllers/categoryController.ts`
- Create: `server/src/routes/products.ts`
- Create: `server/src/routes/categories.ts`

**Step 1: Product controller**

```typescript
// server/src/controllers/productController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Product from '../models/Product';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string(),
  brand: z.string().default('LARA CROFT'),
  price: z.number().positive(),
  originalPrice: z.number().positive(),
  images: z.array(z.string().url()).min(1),
  sizes: z.array(z.string()).min(1),
  stock: z.number().min(0),
  stockBySize: z.record(z.number()).optional(),
  description: z.string().min(1),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export async function getProducts(req: Request, res: Response): Promise<void> {
  const { category, featured, page = '1', limit = '12', sort = '-createdAt' } = req.query;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort as string).skip(skip).limit(limitNum).populate('category'),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
}

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category');
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, data: product });
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, data: product });
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  const data = productSchema.parse(req.body);
  const product = await Product.create(data);
  res.status(201).json({ success: true, data: product });
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  const data = productSchema.partial().parse(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, data: product });
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, data: { deleted: true } });
}
```

**Step 2: Category controller**

```typescript
// server/src/controllers/categoryController.ts
import { Request, Response } from 'express';
import Category from '../models/Category';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().url().optional(),
  order: z.number().default(0),
  active: z.boolean().default(true),
});

export async function getCategories(_req: Request, res: Response): Promise<void> {
  const categories = await Category.find({ active: true }).sort('order');
  res.json({ success: true, data: categories });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const data = categorySchema.parse(req.body);
  const category = await Category.create(data);
  res.status(201).json({ success: true, data: category });
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const data = categorySchema.partial().parse(req.body);
  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!category) {
    res.status(404).json({ success: false, error: 'Category not found' });
    return;
  }
  res.json({ success: true, data: category });
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404).json({ success: false, error: 'Category not found' });
    return;
  }
  res.json({ success: true, data: { deleted: true } });
}
```

**Step 3: Product routes**

```typescript
// server/src/routes/products.ts
import { Router } from 'express';
import { getProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.post('/', authMiddleware, adminOnly, createProduct);
router.put('/:id', authMiddleware, adminOnly, updateProduct);
router.delete('/:id', authMiddleware, adminOnly, deleteProduct);

export default router;
```

**Step 4: Category routes**

```typescript
// server/src/routes/categories.ts
import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';

const router = Router();

router.get('/', getCategories);
router.post('/', authMiddleware, adminOnly, createCategory);
router.put('/:id', authMiddleware, adminOnly, updateCategory);
router.delete('/:id', authMiddleware, adminOnly, deleteCategory);

export default router;
```

**Step 5: Mount in index.ts**

```typescript
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
```

**Step 6: Commit**

```bash
git add server/src/controllers/ server/src/routes/ server/src/index.ts
git commit -m "feat: add product and category CRUD routes"
```

---

### Task 8: Cart Controller + Routes

**Files:**
- Create: `server/src/controllers/cartController.ts`
- Create: `server/src/routes/cart.ts`

**Step 1: Cart controller**

```typescript
// server/src/controllers/cartController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { z } from 'zod';

const addItemSchema = z.object({
  productId: z.string(),
  size: z.string(),
  quantity: z.number().min(1).default(1),
});

const updateItemSchema = z.object({
  productId: z.string(),
  size: z.string(),
  quantity: z.number().min(1),
});

export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
  res.json({ success: true, data: cart || { items: [] } });
}

export async function addToCart(req: AuthRequest, res: Response): Promise<void> {
  const { productId, size, quantity } = addItemSchema.parse(req.body);

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    cart = await Cart.create({ user: req.userId, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({ product: product._id, size, quantity });
  }

  await cart.save();
  await cart.populate('items.product');

  res.json({ success: true, data: cart });
}

export async function updateCartItem(req: AuthRequest, res: Response): Promise<void> {
  const { productId, size, quantity } = updateItemSchema.parse(req.body);

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    res.status(404).json({ success: false, error: 'Cart not found' });
    return;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (itemIndex === -1) {
    res.status(404).json({ success: false, error: 'Item not in cart' });
    return;
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate('items.product');

  res.json({ success: true, data: cart });
}

export async function removeFromCart(req: AuthRequest, res: Response): Promise<void> {
  const { productId, size } = req.body;

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    res.status(404).json({ success: false, error: 'Cart not found' });
    return;
  }

  cart.items = cart.items.filter(
    (item) => !(item.product.toString() === productId && item.size === size)
  );

  await cart.save();
  await cart.populate('items.product');

  res.json({ success: true, data: cart });
}

export async function clearCart(req: AuthRequest, res: Response): Promise<void> {
  const cart = await Cart.findOne({ user: req.userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ success: true, data: { items: [] } });
}
```

**Step 2: Cart routes**

```typescript
// server/src/routes/cart.ts
import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);

export default router;
```

**Step 3: Mount in index.ts**

```typescript
import cartRoutes from './routes/cart';

app.use('/api/cart', cartRoutes);
```

**Step 4: Commit**

```bash
git add server/src/controllers/cartController.ts server/src/routes/cart.ts server/src/index.ts
git commit -m "feat: add cart CRUD routes"
```

---

### Task 9: Order Controller + Routes

**Files:**
- Create: `server/src/controllers/orderController.ts`
- Create: `server/src/routes/orders.ts`

**Step 1: Order controller**

```typescript
// server/src/controllers/orderController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { razorpay } from '../config/razorpay';
import { env } from '../config/env';
import { z } from 'zod';

const checkoutSchema = z.object({
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string().default('IN'),
    phone: z.string(),
  }),
});

export async function createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
  const { shippingAddress } = checkoutSchema.parse(req.body);

  const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400).json({ success: false, error: 'Cart is empty' });
    return;
  }

  const lineItems = cart.items.map((item) => {
    const product = item.product as any;
    return {
      price_data: {
        currency: 'inr',
        product_data: {
          name: `${product.name} (${item.size})`,
          images: [product.images[0]],
        },
        unit_amount: product.price,
      },
      quantity: item.quantity,
    };
  });

  const subtotal = cart.items.reduce((sum, item) => {
    const product = item.product as any;
    return sum + product.price * item.quantity;
  }, 0);

  const shipping = subtotal >= 100000 ? 0 : 5000;
  const tax = Math.round(subtotal * 0.18);

  const razorpayOrder = await razorpay.orders.create({
    amount: totalAmount,
    currency: 'INR',
    receipt: `order_${Date.now()}`,
  });

  const order = await Order.create({
    user: req.userId,
    items: cart.items.map((item) => {
      const product = item.product as any;
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
        image: product.images[0],
      };
    }),
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
    status: 'pending',
    paymentStatus: 'pending',
    razorpayOrderId: razorpayOrder.id,
    shippingAddress,
  });

  res.json({ success: true, data: { orderId: razorpayOrder.id, amount: totalAmount } });
}

export async function confirmOrder(req: AuthRequest, res: Response): Promise<void> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Verify payment signature
  const crypto = await import('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400).json({ success: false, error: 'Invalid payment signature' });
    return;
  }

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();

  await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });

  res.json({ success: true, data: order });
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.userId }).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
    Order.countDocuments({ user: req.userId }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
}

export async function getOrder(req: AuthRequest, res: Response): Promise<void> {
  const order = await Order.findOne({ _id: req.params.id, user: req.userId });
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
}
```

**Step 2: Order routes**

```typescript
// server/src/routes/orders.ts
import { Router } from 'express';
import { createCheckoutSession, confirmOrder, getOrders, getOrder } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/create-checkout-session', createCheckoutSession);
router.get('/confirm/:razorpayOrderId', confirmOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);

export default router;
```

**Step 3: Mount in index.ts**

```typescript
import orderRoutes from './routes/orders';

app.use('/api/orders', orderRoutes);
```

**Step 4: Commit**

```bash
git add server/src/controllers/orderController.ts server/src/routes/orders.ts server/src/index.ts
git commit -m "feat: add order creation with Razorpay checkout"
```

---

### Task 10: Razorpay Webhook Handler

**Files:**
- Create: `server/src/routes/webhooks.ts`

**Step 1: Razorpay webhook handler**

```typescript
// server/src/routes/webhooks.ts
import { Router, Request, Response } from 'express';
import { razorpay } from '../config/razorpay';
import { env } from '../config/env';
import Order from '../models/Order';
import crypto from 'crypto';

const router = Router();

router.post('/razorpay', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['x-razorpay-signature'];
  if (!sig) {
    res.status(400).json({ success: false, error: 'Missing signature' });
    return;
  }

  let event: any;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body.toString())
      .digest('hex');

    if (expectedSignature !== sig) {
      res.status(400).json({ success: false, error: 'Invalid signature' });
      return;
    }

    event = JSON.parse(req.body.toString());
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).json({ success: false, error: 'Invalid signature' });
    return;
  }

  switch (event.event) {
    case 'payment.captured': {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.razorpayPaymentId = payment.id;
        await order.save();
      }
      break;
    }
    case 'payment.failed': {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });
      if (order) {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();
      }
      break;
    }
    case 'refund.created': {
      const refund = event.payload.refund.entity;
      const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
      if (order) {
        order.paymentStatus = 'refunded';
        order.status = 'refunded';
        await order.save();
      }
      break;
    }
  }

  res.json({ success: true });
});

export default router;
```

**Step 2: Update index.ts - webhook route must use raw body**

Move webhook route to top (before json parser):

```typescript
import webhookRoutes from './routes/webhooks';

// Mount webhook BEFORE json parser
app.use('/api/webhooks', webhookRoutes);

// Then json parser
app.use(express.json());

// Then other routes...
app.use('/api/auth', authRoutes);
// ...
```

**Step 3: Commit**

```bash
git add server/src/routes/webhooks.ts server/src/index.ts
git commit -m "feat: add Razorpay webhook handler"
```

---

### Task 11: Admin Controller + Routes

**Files:**
- Create: `server/src/controllers/adminController.ts`
- Create: `server/src/routes/admin.ts`

**Step 1: Admin controller**

```typescript
// server/src/controllers/adminController.ts
import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalOrders, totalUsers, totalProducts, recentOrders, revenue, lowStock] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments(),
    Product.countDocuments(),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Product.find({ stock: { $lte: 5 } }).sort('stock').limit(10),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalUsers,
      totalProducts,
      revenue30d: revenue[0]?.total || 0,
      orders30d: revenue[0]?.count || 0,
      recentOrders,
      lowStock,
    },
  });
}

export async function getAllOrders(req: Request, res: Response): Promise<void> {
  const { status, page = '1', limit = '20' } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum).populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [users, total] = await Promise.all([
    User.find().sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
}
```

**Step 2: Admin routes**

```typescript
// server/src/routes/admin.ts
import { Router } from 'express';
import { getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers, updateUserRole } from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';
import { adminOnly, managerOrAdmin } from '../middleware/admin';

const router = Router();

router.use(authMiddleware);
router.use(managerOrAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', adminOnly, updateOrderStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/role', adminOnly, updateUserRole);

export default router;
```

**Step 3: Mount in index.ts**

```typescript
import adminRoutes from './routes/admin';

app.use('/api/admin', adminRoutes);
```

**Step 4: Commit**

```bash
git add server/src/controllers/adminController.ts server/src/routes/admin.ts server/src/index.ts
git commit -m "feat: add admin dashboard and management routes"
```

---

### Task 12: Seed Database with Sample Products

**Files:**
- Create: `server/src/utils/seed.ts`

**Step 1: Seed script**

```typescript
// server/src/utils/seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';
import Product from '../models/Product';

dotenv.config();

const categories = [
  { name: 'Shirts', slug: 'shirts', order: 1, active: true },
  { name: 'T-Shirts', slug: 't-shirts', order: 2, active: true },
  { name: 'Trousers', slug: 'trousers', order: 3, active: true },
  { name: 'Jeans', slug: 'jeans', order: 4, active: true },
];

const products = [
  {
    name: "Explorer's Linen Shirt",
    slug: 'explorers-linen-shirt',
    brand: 'LARA CROFT',
    price: 129900,
    originalPrice: 189900,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 50,
    description: 'Crafted from breathable linen with a relaxed explorer cut.',
    featured: true,
    tags: ['linen', 'explorer', 'featured'],
  },
  {
    name: 'Nameless Adventurer Tee',
    slug: 'nameless-adventurer-tee',
    brand: 'LARA CROFT',
    price: 79900,
    originalPrice: 119900,
    images: ['https://images.unsplash.com/photo-1521223890158-e322e2b6f96d?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 100,
    description: 'Heavyweight cotton tee with the iconic Primal Logo print.',
    featured: false,
    tags: ['cotton', 'tee'],
  },
  {
    name: 'Tomb Raider Cargo Trousers',
    slug: 'tomb-raider-cargo-trousers',
    brand: 'LARA CROFT',
    price: 99900,
    originalPrice: 149900,
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 75,
    description: 'Multi-pocket cargo trousers in durable cotton canvas.',
    featured: true,
    tags: ['cargo', 'trousers'],
  },
  {
    name: 'Croft Classic Denim Jeans',
    slug: 'croft-classic-denim',
    brand: 'LARA CROFT',
    price: 149900,
    originalPrice: 219900,
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 60,
    description: 'Classic straight-fit denim with a subtle sand-wash finish.',
    featured: false,
    tags: ['denim', 'jeans'],
  },
  {
    name: 'Pasha Silk Shirt',
    slug: 'pasha-silk-shirt',
    brand: 'LARA CROFT',
    price: 159900,
    originalPrice: 229900,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30,
    description: 'Luxurious silk-blend shirt with an iridescent finish.',
    featured: true,
    tags: ['silk', 'shirt'],
  },
  {
    name: 'Relic Hunter Tee',
    slug: 'relic-hunter-tee',
    brand: 'LARA CROFT',
    price: 69900,
    originalPrice: 99900,
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 120,
    description: 'Vintage-wash cotton tee with a distressed Relic Hunter screen print.',
    featured: false,
    tags: ['vintage', 'tee'],
  },
  {
    name: 'Expedition Chinos',
    slug: 'expedition-chinos',
    brand: 'LARA CROFT',
    price: 119900,
    originalPrice: 169900,
    images: ['https://images.unsplash.com/photo-1624378439575-d87e5ad7ae80?w=600&q=80'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    stock: 80,
    description: 'Stretch cotton chinos in earth tones.',
    featured: false,
    tags: ['chinos', 'trousers'],
  },
  {
    name: 'Tiered Pocket Jeans',
    slug: 'tiered-pocket-jeans',
    brand: 'LARA CROFT',
    price: 129900,
    originalPrice: 179900,
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 45,
    description: 'Five-pocket jeans with a faded acid wash.',
    featured: false,
    tags: ['jeans', 'denim'],
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Category.deleteMany({});
  await Product.deleteMany({});

  const createdCategories = await Category.insertMany(categories);
  console.log(`Seeded ${createdCategories.length} categories`);

  const catMap = Object.fromEntries(createdCategories.map((c) => [c.slug, c._id]));

  const productsWithCategory = products.map((p) => ({
    ...p,
    category: catMap[p.tags.includes('shirt') || p.tags.includes('silk') ? 'shirts'
      : p.tags.includes('tee') ? 't-shirts'
      : p.tags.includes('trousers') || p.tags.includes('cargo') || p.tags.includes('chinos') ? 'trousers'
      : 'jeans'],
  }));

  const createdProducts = await Product.insertMany(productsWithCategory);
  console.log(`Seeded ${createdProducts.length} products`);

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
```

**Step 2: Add seed script to server package.json**

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "test": "vitest",
  "seed": "tsx src/utils/seed.ts"
}
```

**Step 3: Run seed (when MongoDB URI is configured)**

```bash
cd server && npm run seed
```

**Step 4: Commit**

```bash
git add server/src/utils/seed.ts server/package.json
git commit -m "feat: add database seed script with sample products"
```

---

## Phase 2: Frontend (Week 1-2)

### Task 13: Vite + React + Tailwind Setup

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/main.tsx`
- Modify: `client/tailwind.config.js`
- Modify: `client/vite.config.ts`

**Step 1: Configure Vite with proxy**

```typescript
// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

**Step 2: Configure Tailwind with design system**

```javascript
// client/tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#ffffff', 2: '#f5f5f5' },
        card: { DEFAULT: '#fafafa', 2: '#efefef' },
        accent: { DEFAULT: '#6f4423', 2: '#8a5a30' },
        gold: '#6f4423',
        border: '#e0e0e0',
        text: '#000000',
        muted: '#333333',
        green: '#333333',
        cream: '#f7f2ec',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
```

**Step 3: Create Tailwind CSS file**

Create `client/src/index.css`:
```css
@import 'tailwindcss';

@layer base {
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', sans-serif;
    background: #ffffff;
    color: #000000;
    line-height: 1.6;
    overflow-x: hidden;
  }
}
```

**Step 4: Setup React Query and Supabase in main.tsx**

```typescript
// client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#fafafa', color: '#000000', border: '1px solid #e0e0e0' } }} />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

**Step 5: Create basic App.tsx**

```typescript
// client/src/App.tsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-2xl">Prima Facie - Coming Soon</div>} />
    </Routes>
  );
}

export default App;
```

**Step 6: Verify frontend starts**

```bash
cd client && npm run dev
# Should open http://localhost:5173
```

**Step 7: Commit**

```bash
git add client/
git commit -m "feat: setup Vite + React + Tailwind with design system"
```

---

### Task 14: Supabase Client + Auth Setup

**Files:**
- Create: `client/src/services/supabase.ts`
- Create: `client/src/services/api.ts`
- Create: `client/src/hooks/useAuth.ts`

**Step 1: Supabase client**

```typescript
// client/src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 2: Axios API client with auth interceptor**

```typescript
// client/src/services/api.ts
import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
```

**Step 3: Auth hook**

```typescript
// client/src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import api from '../services/api';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const res: any = await api.post('/auth/sync', {
            supabaseId: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
            avatar: session.user.user_metadata.avatar_url,
          });
          setUser(res.data);
        } catch (err) {
          console.error('Failed to sync user:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const res: any = await api.post('/auth/sync', {
            supabaseId: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
            avatar: session.user.user_metadata.avatar_url,
          });
          setUser(res.data);
        } catch (err) {
          console.error('Failed to sync user:', err);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signInWithGoogle, signOut };
}
```

**Step 4: Create .env file for client**

```
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder-anon-key
```

**Step 5: Commit**

```bash
git add client/src/services/ client/src/hooks/ client/.env
git commit -m "feat: add Supabase auth with Google OAuth"
```

---

### Task 15: Cart Store (Zustand)

**Files:**
- Create: `client/src/stores/cartStore.ts`
- Create: `client/src/stores/uiStore.ts`

**Step 1: Cart store**

```typescript
// client/src/stores/cartStore.ts
import { create } from 'zustand';
import api from '../services/api';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, size: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, size: string, quantity: number) => Promise<void>;
  removeItem: (productId: string, size: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res: any = await api.get('/cart');
      set({ items: res.data?.items || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, size, quantity = 1) => {
    try {
      const res: any = await api.post('/cart/add', { productId, size, quantity });
      set({ items: res.data?.items || [] });
    } catch (err) {
      throw err;
    }
  },

  updateItem: async (productId, size, quantity) => {
    try {
      const res: any = await api.put('/cart/update', { productId, size, quantity });
      set({ items: res.data?.items || [] });
    } catch (err) {
      throw err;
    }
  },

  removeItem: async (productId, size) => {
    try {
      const res: any = await api.delete('/cart/remove', { data: { productId, size } });
      set({ items: res.data?.items || [] });
    } catch (err) {
      throw err;
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ items: [] });
    } catch (err) {
      throw err;
    }
  },

  total: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
```

**Step 2: UI store**

```typescript
// client/src/stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));
```

**Step 3: Commit**

```bash
git add client/src/stores/
git commit -m "feat: add Zustand stores for cart and UI state"
```

---

### Task 16: Layout Components (Header, Footer, CartDrawer)

**Files:**
- Create: `client/src/components/layout/Header.tsx`
- Create: `client/src/components/layout/Footer.tsx`
- Create: `client/src/components/layout/CartDrawer.tsx`
- Create: `client/src/components/layout/MobileMenu.tsx`

**Step 1: Header component**

```typescript
// client/src/components/layout/Header.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { useEffect } from 'react';

export default function Header() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { fetchCart, itemCount } = useCartStore();
  const { openCart, openMobileMenu } = useUIStore();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        <Link to="/" className="text-2xl font-black tracking-[3px] uppercase text-text no-underline whitespace-nowrap">
          PRIMA<span className="text-accent">FACIE</span>
        </Link>

        <nav className="hidden md:flex gap-8 list-none">
          {['Shop', 'Collection', 'Sale', 'About'].map((item) => (
            <li key={item}>
              <a
                href={item === 'Shop' ? '/shop' : `/#${item.toLowerCase()}`}
                className="text-muted text-[13px] font-medium no-underline uppercase tracking-[1px] hover:text-text transition-colors"
              >
                {item}
              </a>
            </li>
          ))}
        </nav>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => user ? openCart() : signInWithGoogle()}
            className="relative bg-transparent border-none text-muted text-lg cursor-pointer p-1 hover:text-text transition-colors"
            title="Cart"
          >
            🛒
            {user && itemCount() > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-accent text-cream text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {itemCount()}
              </span>
            )}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
              <button onClick={signOut} className="text-muted text-[13px] hover:text-text transition-colors">
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="bg-accent text-cream px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] rounded cursor-pointer hover:bg-accent-2 transition-colors">
              Sign In
            </button>
          )}
          <button onClick={openMobileMenu} className="md:hidden bg-transparent border-none text-text text-2xl cursor-pointer p-1">
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
```

**Step 2: Footer component**

```typescript
// client/src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white pt-14 pb-7 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-9 mb-9">
        <div>
          <div className="text-2xl font-black tracking-[3px] uppercase mb-4">
            PRIMA<span className="text-accent">FACIE</span>
          </div>
          <p className="text-muted text-[13px] max-w-[280px] leading-relaxed">
            Premium replica apparel inspired by the world's greatest explorer.
          </p>
        </div>
        {[
          { title: 'Shop', links: ['Shirts', 'T-Shirts', 'Trousers', 'Jeans', 'New Arrivals', 'Sale'] },
          { title: 'Help', links: ['Shipping Info', 'Returns & Exchanges', 'Size Guide', 'FAQ', 'Contact Us'] },
          { title: 'Company', links: ['About', 'Careers', 'Privacy Policy', 'Terms of Service'] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-[11px] font-bold uppercase tracking-[2px] mb-4">{col.title}</h4>
            <ul className="list-none space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted text-[13px] no-underline hover:text-text transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1400px] mx-auto px-6 pt-5 border-t border-border flex flex-wrap justify-between items-center gap-3">
        <p className="text-muted text-[12px]">© 2026 Prima Facie. All rights reserved.</p>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Sitemap'].map((link) => (
            <a key={link} href="#" className="text-muted text-[12px] no-underline hover:text-text transition-colors">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

**Step 3: CartDrawer component**

```typescript
// client/src/components/layout/CartDrawer.tsx
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const { items, removeItem, clearCart, total, itemCount } = useCartStore();
  const { cartOpen, closeCart } = useUIStore();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[190]" onClick={closeCart} />
      <div className="fixed top-0 right-0 bottom-0 w-[400px] max-w-full bg-bg-2 border-l border-border z-[195] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-[1px]">Shopping Cart ({itemCount()})</h3>
          <button onClick={closeCart} className="bg-transparent border-none text-muted text-2xl cursor-pointer hover:text-text">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <div className="text-5xl mb-4 opacity-40">🛒</div>
              <p className="text-sm">Your cart is empty.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.product._id}-${item.size}`} className="grid grid-cols-[80px_1fr_auto] gap-3 items-center py-3.5 border-b border-border">
                <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover bg-card2 rounded" />
                <div>
                  <div className="text-[10px] uppercase tracking-[1px] text-accent font-semibold">{item.product.brand}</div>
                  <div className="text-[13px] font-semibold my-0.5">{item.product.name}</div>
                  <div className="text-[11px] text-muted">Size: {item.size}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-[15px] font-bold">₹{(item.product.price / 100).toLocaleString()}</div>
                  <button onClick={() => removeItem(item.product._id, item.size)} className="bg-transparent border-none text-muted text-lg cursor-pointer hover:text-accent">
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border">
            <div className="flex justify-between items-baseline mb-3.5">
              <span className="text-[11px] uppercase tracking-[1.5px] text-muted font-semibold">Total</span>
              <span className="text-xl font-bold">₹{(total() / 100).toLocaleString()}</span>
            </div>
            <button
              onClick={() => { closeCart(); navigate('/checkout'); }}
              className="w-full bg-accent text-cream border-none py-3.5 text-[12px] font-bold uppercase tracking-[2px] cursor-pointer rounded hover:bg-accent-2 transition-colors"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => { clearCart(); toast.success('Cart cleared'); }}
              className="w-full bg-transparent border border-border text-muted py-2.5 text-[11px] font-semibold uppercase tracking-[1px] cursor-pointer rounded mt-2.5 hover:border-accent hover:text-accent transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

**Step 4: MobileMenu component**

```typescript
// client/src/components/layout/MobileMenu.tsx
import { useUIStore } from '../../stores/uiStore';

export default function MobileMenu() {
  const { mobileMenuOpen, closeMobileMenu } = useUIStore();

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/97 z-[99] flex flex-col items-center justify-center gap-8">
      <button onClick={closeMobileMenu} className="absolute top-5 right-5 bg-transparent border-none text-text text-2xl cursor-pointer">✕</button>
      {['Shop', 'Collection', 'Sale', 'About', 'Contact'].map((item) => (
        <a
          key={item}
          href={item === 'Shop' ? '/shop' : `/#${item.toLowerCase()}`}
          onClick={closeMobileMenu}
          className="text-text no-underline text-2xl font-bold uppercase tracking-[2px] hover:text-accent transition-colors"
        >
          {item}
        </a>
      ))}
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add client/src/components/layout/
git commit -m "feat: add Header, Footer, CartDrawer, MobileMenu components"
```

---

### Task 17: Product Components (Card, Grid, Modal)

**Files:**
- Create: `client/src/components/products/ProductCard.tsx`
- Create: `client/src/components/products/ProductGrid.tsx`
- Create: `client/src/components/products/ProductModal.tsx`
- Create: `client/src/hooks/useProducts.ts`

**Step 1: Products hook**

```typescript
// client/src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { Product, ApiResponse } from '../types';

export function useProducts(filters: { category?: string; featured?: boolean; page?: number } = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.featured) params.set('featured', 'true');
      if (filters.page) params.set('page', String(filters.page));
      const res: any = await api.get(`/products?${params.toString()}`);
      return res as ApiResponse<Product[]>;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res: any = await api.get(`/products/slug/${slug}`);
      return res as ApiResponse<Product>;
    },
    enabled: !!slug,
  });
}
```

**Step 2: ProductCard component**

```typescript
// client/src/components/products/ProductCard.tsx
import type { Product } from '../../types';
import { useState } from 'react';

interface Props {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: Props) {
  const [hovered, setHovered] = useState(false);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent hover:-translate-y-1.5 hover:shadow-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square bg-card2 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
        />
        <span className="absolute top-3 left-3 bg-accent text-cream px-3 py-1 text-[10px] font-bold uppercase tracking-[1px] z-10">
          Sale {discount}% OFF
        </span>
        {hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[1px] cursor-pointer hover:bg-black/20 transition-all whitespace-nowrap"
          >
            Quick View
          </button>
        )}
      </div>
      <div className="p-3.5">
        <div className="text-[10px] uppercase tracking-[1.5px] text-accent font-semibold mb-0.5">{product.brand}</div>
        <div className="text-sm font-semibold text-text mb-1.5 leading-snug">{product.name}</div>
        <div className="flex gap-1.25 mb-2 flex-wrap">
          {product.sizes.slice(0, 4).map((s) => (
            <span key={s} className="bg-bg-2 text-muted px-1.75 py-0.5 text-[10px] font-semibold rounded border border-border">{s}</span>
          ))}
          {product.sizes.length > 4 && (
            <span className="text-accent text-[10px] font-semibold">+{product.sizes.length - 4}</span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-extrabold">₹{(product.price / 100).toLocaleString()}</span>
          <span className="text-[13px] text-muted line-through">₹{(product.originalPrice / 100).toLocaleString()}</span>
        </div>
        <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold mt-1.5 ${product.stock > 0 ? 'text-muted' : 'text-muted'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-muted' : 'bg-muted'}`} />
          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: ProductGrid component**

```typescript
// client/src/components/products/ProductGrid.tsx
import ProductCard from './ProductCard';
import type { Product } from '../../types';

interface Props {
  products: Product[];
  loading: boolean;
  onQuickView: (product: Product) => void;
}

export default function ProductGrid({ products, loading, onQuickView }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-card2" />
            <div className="p-3.5 space-y-2">
              <div className="h-3 bg-border rounded w-1/3" />
              <div className="h-4 bg-border rounded w-2/3" />
              <div className="h-5 bg-border rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-sm">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} onQuickView={onQuickView} />
      ))}
    </div>
  );
}
```

**Step 4: ProductModal component**

```typescript
// client/src/components/products/ProductModal.tsx
import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import type { Product } from '../../types';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const [selectedSize, setSelectedSize] = useState('');
  const [adding, setAdding] = useState(false);
  const { addItem } = useCartStore();
  const { user, signInWithGoogle } = useAuth();

  if (!product) return null;

  const handleAddToCart = async () => {
    if (!user) { signInWithGoogle(); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    setAdding(true);
    try {
      await addItem(product._id, selectedSize);
      toast.success(`${product.name} (${selectedSize}) added to cart!`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white border border-border rounded-xl max-w-[880px] w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 relative"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'mtin 0.3s ease' }}
      >
        <style>{`@keyframes mtin { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
        <button onClick={onClose} className="absolute top-3.5 right-3.5 bg-black/6 border-none text-text w-9 h-9 rounded-full text-lg cursor-pointer flex items-center justify-center hover:bg-black/12 z-10">✕</button>

        <div className="bg-card2 min-h-[320px] flex items-center justify-center p-8">
          <img src={product.images[0]} alt={product.name} className="max-w-full max-h-[380px] object-contain" />
        </div>

        <div className="p-7">
          <div className="text-[11px] uppercase tracking-[1.5px] text-accent font-semibold">{product.brand}</div>
          <h2 className="text-xl font-bold mt-1 mb-2.5 uppercase tracking-[0.5px]">{product.name}</h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-extrabold">₹{(product.price / 100).toLocaleString()}</span>
            <span className="text-[13px] text-muted line-through">₹{(product.originalPrice / 100).toLocaleString()}</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold mb-4 ${product.stock > 0 ? 'text-muted' : 'text-muted'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-muted' : 'bg-muted'}`} />
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </div>

          <div className="text-[11px] uppercase tracking-[1.5px] text-muted font-semibold mb-3">Select Size</div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`w-10 h-10 border rounded flex items-center justify-center text-[12px] font-semibold cursor-pointer transition-all ${
                  selectedSize === s
                    ? 'bg-accent text-cream border-accent'
                    : 'bg-white border-border text-muted hover:border-accent hover:text-text'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.stock || adding}
            className="w-full bg-accent text-cream border-none py-3.5 text-[13px] font-bold uppercase tracking-[2px] cursor-pointer rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-2"
          >
            {!product.stock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
          </button>

          <p className="mt-4 pt-4 border-t border-border text-muted text-[13px] leading-relaxed">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add client/src/components/products/ client/src/hooks/useProducts.ts
git commit -m "feat: add ProductCard, ProductGrid, ProductModal components"
```

---

### Task 18: Home Page

**Files:**
- Create: `client/src/pages/Home.tsx`
- Modify: `client/src/App.tsx`

**Step 1: Home page**

```typescript
// client/src/pages/Home.tsx
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/products/ProductGrid';
import ProductModal from '../components/products/ProductModal';
import type { Product } from '../types';

const filters = ['all', 'shirts', 't-shirts', 'trousers', 'jeans'] as const;

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data, isLoading } = useProducts({ category: activeFilter === 'all' ? undefined : activeFilter });
  const products = data?.data || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[540px] bg-gradient-to-br from-white via-bg-2 to-white flex items-center justify-center overflow-hidden">
        <div className="absolute inset-[-50%] bg-[radial-gradient(ellipse_at_center,rgba(111,68,35,.08)_0%,transparent_60%)] animate-pulse" />
        <div className="text-center z-10 px-6 relative">
          <div className="inline-block bg-accent text-cream px-4 py-1.5 text-[11px] font-bold uppercase tracking-[2px] mb-5">New Season Drop</div>
          <h1 className="text-[clamp(32px,6vw,70px)] font-black leading-[1.05] uppercase tracking-[2px] mb-3.5">
            PRIMA <span className="text-accent">FACIE</span><br />LARA CROFT
          </h1>
          <p className="text-[15px] text-muted max-w-[480px] mx-auto mb-7 tracking-[0.4px]">
            Authentic replicas, premium craftsmanship. The explorer's wardrobe — built for adventure, styled for legacy.
          </p>
          <a href="#products" className="inline-block bg-accent text-cream px-9 py-3.5 text-[13px] font-bold uppercase tracking-[2px] no-underline rounded hover:bg-accent-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30">
            Shop The Collection
          </a>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden bg-bg-2 border-y border-border py-3.5">
        <div className="flex gap-12 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
          <span className="text-[13px] font-semibold uppercase tracking-[2px] text-muted inline-flex items-center gap-12">
            Trending Now <span className="text-accent">●</span> Explorer's Linen Shirt <span className="text-accent">●</span> Tomb Raider Cargo Trousers <span className="text-accent">●</span> Relic Hunter Tee <span className="text-accent">●</span> Pasha Silk Shirt <span className="text-accent">●</span> Croft Classic Denim
          </span>
          <span className="text-[13px] font-semibold uppercase tracking-[2px] text-muted inline-flex items-center gap-12">
            Trending Now <span className="text-accent">●</span> Explorer's Linen Shirt <span className="text-accent">●</span> Tomb Raider Cargo Trousers <span className="text-accent">●</span> Relic Hunter Tee <span className="text-accent">●</span> Pasha Silk Shirt <span className="text-accent">●</span> Croft Classic Denim
          </span>
        </div>
      </div>

      <style>{`@keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>

      {/* Filters */}
      <div className="flex gap-2.5 px-6 pb-7 max-w-[1400px] mx-auto flex-wrap mt-14" id="products">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`bg-card border px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[1px] cursor-pointer rounded transition-all ${
              activeFilter === f
                ? 'bg-accent text-cream border-accent'
                : 'border-border text-muted hover:bg-accent hover:text-cream hover:border-accent'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="max-w-[1400px] mx-auto px-6 pb-15">
        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-5">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[3px] text-accent">Browse</div>
            <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold uppercase tracking-[1px]">The Collection</h2>
          </div>
        </div>
        <ProductGrid products={products} loading={isLoading} onQuickView={setSelectedProduct} />
      </div>

      {/* Promo Banner */}
      <section className="bg-gradient-to-br from-bg-2 to-white py-14 text-center border-y border-border">
        <h2 className="text-[clamp(22px,4vw,36px)] font-extrabold uppercase tracking-[1px] mb-2.5">
          Summer <span className="text-accent">Adventure</span> Sale
        </h2>
        <p className="text-muted text-[15px] mb-5.5 max-w-[380px] mx-auto">
          Up to 40% off on all LARA CROFT expedition wear. Limited stock — once they're gone, they're gone.
        </p>
        <a href="#products" className="inline-block bg-gold text-cream px-9 py-3.5 text-[13px] font-bold uppercase tracking-[2px] no-underline rounded hover:bg-accent-2 transition-all hover:shadow-lg hover:shadow-accent/30">
          Grab The Deal
        </a>
      </section>

      {/* Newsletter */}
      <section className="bg-bg-2 py-14 text-center border-t border-border" id="about">
        <h2 className="text-2xl font-extrabold uppercase tracking-[1px] mb-1.5">Join The Expedition</h2>
        <p className="text-muted text-[13px] mb-5">Be the first to know about new drops, exclusive offers, and LARA CROFT updates.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success('Welcome to the team!'); (e.target as HTMLFormElement).reset(); }}
          className="flex max-w-[420px] mx-auto border border-border rounded overflow-hidden"
        >
          <input type="email" placeholder="Enter your email" required className="flex-1 px-4 py-3.5 bg-white border-none text-text text-sm outline-none placeholder:text-muted" />
          <button type="submit" className="bg-accent text-cream border-none px-6 py-3.5 text-[12px] font-bold uppercase tracking-[1.5px] cursor-pointer hover:bg-accent-2 transition-colors">
            Subscribe
          </button>
        </form>
      </section>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
```

**Step 2: Update App.tsx with routes**

```typescript
// client/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import MobileMenu from './components/layout/MobileMenu';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <CartDrawer />
      <MobileMenu />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

**Step 3: Verify home page renders**

```bash
cd client && npm run dev
# Visit http://localhost:5173 — should see full home page with products
```

**Step 4: Commit**

```bash
git add client/src/pages/Home.tsx client/src/App.tsx
git commit -m "feat: add Home page with hero, products, promo, newsletter"
```

---

## Phase 3: Checkout & Orders (Week 2)

### Task 19: Checkout Page + Razorpay Integration

**Files:**
- Create: `client/src/pages/Checkout.tsx`
- Create: `client/src/pages/CheckoutSuccess.tsx`
- Create: `client/src/services/razorpay.ts`

**Step 1: Razorpay config**

```typescript
// client/src/services/razorpay.ts
export const loadRazorpay = () => {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

**Step 2: Checkout page**

```typescript
// client/src/pages/Checkout.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { Address } from '../types';

export default function Checkout() {
  const { items, total } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
    line1: '', line2: '', city: '', state: '', postalCode: '', country: 'IN', phone: '',
  });

  const handleCheckout = async () => {
    if (!address.line1 || !address.city || !address.state || !address.postalCode || !address.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res: any = await api.post('/orders/create-checkout-session', { shippingAddress: address });
      const { orderId, amount } = res.data;

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load Razorpay');
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Prima Facie',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await api.post('/orders/confirm', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate('/checkout/success');
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: address.phone,
        },
        theme: {
          color: '#6f4423',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-16 text-center text-muted">
        <p>Your cart is empty.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-accent underline cursor-pointer bg-transparent border-none">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold uppercase tracking-[1px] mb-6">Checkout</h1>

      <div className="space-y-4 mb-6">
        <div className="text-[11px] uppercase tracking-[1.5px] text-muted font-semibold">Shipping Address</div>
        {[
          { key: 'line1', label: 'Address Line 1', required: true },
          { key: 'line2', label: 'Address Line 2', required: false },
          { key: 'city', label: 'City', required: true },
          { key: 'state', label: 'State', required: true },
          { key: 'postalCode', label: 'Postal Code', required: true },
          { key: 'phone', label: 'Phone', required: true },
        ].map(({ key, label, required }) => (
          <input
            key={key}
            type="text"
            placeholder={`${label}${required ? ' *' : ''}`}
            required={required}
            value={address[key as keyof Address] || ''}
            onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
            className="w-full px-4 py-3 bg-card border border-border rounded text-text text-sm outline-none focus:border-accent transition-colors"
          />
        ))}
      </div>

      <div className="border-t border-border pt-4 mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted font-semibold">Subtotal</span>
          <span className="font-bold">₹{(total() / 100).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted font-semibold">Shipping</span>
          <span className="font-bold">{total() >= 100000 ? 'Free' : '₹50'}</span>
        </div>
        <div className="flex justify-between items-baseline border-t border-border pt-2 mt-2">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted font-semibold">Total</span>
          <span className="text-xl font-extrabold">₹{((total() + (total() >= 100000 ? 0 : 5000)) / 100).toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-accent text-cream border-none py-3.5 text-[13px] font-bold uppercase tracking-[2px] cursor-pointer rounded hover:bg-accent-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Pay with Razorpay'}
      </button>
    </div>
  );
}
```

**Step 3: Checkout success page**

```typescript
// client/src/pages/CheckoutSuccess.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../stores/cartStore';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { fetchCart } = useCartStore();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) { setStatus('error'); return; }

    api.get(`/orders/confirm/${sessionId}`)
      .then(() => { setStatus('success'); fetchCart(); })
      .catch(() => setStatus('error'));
  }, [searchParams, fetchCart]);

  return (
    <div className="max-w-[500px] mx-auto px-6 py-16 text-center">
      {status === 'loading' && <div className="text-muted text-sm">Verifying payment...</div>}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-extrabold uppercase tracking-[1px] mb-2">Order Confirmed!</h1>
          <p className="text-muted text-sm mb-6">Thank you for your purchase. Your order is being processed.</p>
          <Link to="/" className="inline-block bg-accent text-cream px-6 py-3 text-[12px] font-bold uppercase tracking-[1px] rounded no-underline hover:bg-accent-2 transition-colors">
            Continue Shopping
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="text-2xl font-extrabold uppercase tracking-[1px] mb-2">Payment Issue</h1>
          <p className="text-muted text-sm mb-6">Something went wrong. Please contact support.</p>
          <Link to="/" className="text-accent underline">Return Home</Link>
        </>
      )}
    </div>
  );
}
```

**Step 4: Add routes to App.tsx**

```typescript
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';

// Inside Routes:
<Route path="/checkout" element={<Checkout />} />
<Route path="/checkout/success" element={<CheckoutSuccess />} />
```

**Step 5: Commit**

```bash
git add client/src/pages/Checkout.tsx client/src/pages/CheckoutSuccess.tsx client/src/services/razorpay.ts client/src/App.tsx
git commit -m "feat: add checkout page with Razorpay integration"
```

---

### Task 20: Admin Dashboard + Products Management

**Files:**
- Create: `client/src/components/admin/AdminLayout.tsx`
- Create: `client/src/pages/admin/Dashboard.tsx`
- Create: `client/src/pages/admin/AdminProducts.tsx`
- Create: `client/src/hooks/useAdmin.ts`

**Step 1: Admin hook**

```typescript
// client/src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res: any = await api.get('/admin/stats');
      return res.data;
    },
  });
}

export function useAdminOrders(status?: string) {
  return useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const res: any = await api.get(`/admin/orders${params}`);
      return res.data;
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res: any = await api.get('/admin/users');
      return res.data;
    },
  });
}
```

**Step 2: AdminLayout component**

```typescript
// client/src/components/admin/AdminLayout.tsx
import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Products', icon: '📦' },
  { path: '/admin/orders', label: 'Orders', icon: '🧾' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-60px)]">
      <aside className="w-[240px] bg-bg-2 border-r border-border p-5 shrink-0">
        <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-5">Admin Panel</h3>
        <nav className="space-y-1">
          {links.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-[13px] no-underline transition-colors ${
                location.pathname === path
                  ? 'bg-accent text-white'
                  : 'text-muted hover:bg-card hover:text-text'
              }`}
            >
              <span>{icon}</span> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
```

**Step 3: Dashboard page**

```typescript
// client/src/pages/admin/Dashboard.tsx
import { useDashboardStats } from '../../hooks/useAdmin';
import AdminLayout from '../../components/admin/AdminLayout';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-extrabold uppercase tracking-[1px] mb-6">Dashboard</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '🧾' },
              { label: 'Revenue (30d)', value: `₹${((stats?.revenue30d || 0) / 100).toLocaleString()}`, icon: '💰' },
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥' },
              { label: 'Products', value: stats?.totalProducts || 0, icon: '📦' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[1px] text-muted">{label}</span>
                  <span className="text-xl">{icon}</span>
                </div>
                <div className="text-2xl font-extrabold">{value}</div>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-bold uppercase tracking-[1px] mb-4">Recent Orders</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Order</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Customer</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Total</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders || []).map((order: any) => (
                  <tr key={order._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-sm font-mono">#{order._id.slice(-8)}</td>
                    <td className="px-4 py-3 text-sm">{order.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-bold">₹{(order.total / 100).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        order.status === 'delivered' ? 'bg-muted/10 text-muted' :
                        order.status === 'cancelled' ? 'bg-accent/10 text-accent' :
                        'bg-accent/10 text-accent'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
```

**Step 4: Admin Products page**

```typescript
// client/src/pages/admin/AdminProducts.tsx
import { useProducts } from '../../hooks/useProducts';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { data, isLoading } = useProducts();
  const products = data?.data || [];
  const qc = useQueryClient();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold uppercase tracking-[1px]">Products</h1>
        <button className="bg-accent text-cream px-4 py-2 text-[12px] font-bold uppercase tracking-[1px] rounded cursor-pointer hover:bg-accent-2 transition-colors">
          + Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-card border border-border rounded h-14 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Product</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Category</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Price</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Stock</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover bg-card2" />
                      <div>
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="text-[10px] text-muted uppercase tracking-[1px]">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{(p.category as any)?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-bold">₹{(p.price / 100).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold ${p.stock > 0 ? 'text-muted' : 'text-accent'}`}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-accent text-[11px] font-semibold uppercase bg-transparent border-none cursor-pointer hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
```

**Step 5: Add admin routes to App.tsx**

```typescript
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';

// Inside Routes:
<Route path="/admin" element={<Dashboard />} />
<Route path="/admin/products" element={<AdminProducts />} />
```

**Step 6: Commit**

```bash
git add client/src/components/admin/ client/src/pages/admin/ client/src/hooks/useAdmin.ts client/src/App.tsx
git commit -m "feat: add admin dashboard and products management"
```

---

### Task 21: Admin Orders Management

**Files:**
- Create: `client/src/pages/admin/AdminOrders.tsx`

**Step 1: Admin Orders page**

```typescript
// client/src/pages/admin/AdminOrders.tsx
import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '../../hooks/useAdmin';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function AdminOrders() {
  const [filter, setFilter] = useState<string>('all');
  const { data: orders, isLoading } = useAdminOrders(filter === 'all' ? undefined : filter);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success('Order status updated');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-extrabold uppercase tracking-[1px] mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[1px] rounded border cursor-pointer transition-all ${
              filter === s
                ? 'bg-accent text-cream border-accent'
                : 'bg-card border-border text-muted hover:border-accent'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-card border border-border rounded h-14 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Order ID</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Customer</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Total</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Payment</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[1px] text-muted">Update</th>
              </tr>
            </thead>
            <tbody>
              {(orders || []).map((order: any) => (
                <tr key={order._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-mono">#{order._id.slice(-8)}</td>
                  <td className="px-4 py-3 text-sm">{order.user?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-bold">₹{(order.total / 100).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase ${
                      order.paymentStatus === 'paid' ? 'text-muted' : order.paymentStatus === 'failed' ? 'text-accent' : 'text-accent'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      order.status === 'delivered' ? 'bg-muted/10 text-muted' :
                      order.status === 'cancelled' || order.status === 'refunded' ? 'bg-accent/10 text-accent' :
                      'bg-accent/10 text-accent'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="bg-card border border-border rounded px-2 py-1 text-[11px] text-text cursor-pointer"
                    >
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
```

**Step 2: Add route to App.tsx**

```typescript
import AdminOrders from './pages/admin/AdminOrders';

<Route path="/admin/orders" element={<AdminOrders />} />
```

**Step 3: Commit**

```bash
git add client/src/pages/admin/AdminOrders.tsx client/src/App.tsx
git commit -m "feat: add admin orders management page"
```

---

### Task 22: User Account Page

**Files:**
- Create: `client/src/pages/Account.tsx`
- Create: `client/src/hooks/useOrders.ts`

**Step 1: Orders hook**

```typescript
// client/src/hooks/useOrders.ts
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { Order, ApiResponse } from '../types';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res: any = await api.get('/orders');
      return res as ApiResponse<Order[]>;
    },
  });
}
```

**Step 2: Account page**

```typescript
// client/src/pages/Account.tsx
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, signOut } = useAuth();
  const { data, isLoading } = useOrders();
  const navigate = useNavigate();
  const orders = data?.data || [];

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-16 text-center text-muted">
        <p>Please sign in to view your account.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-accent underline bg-transparent border-none cursor-pointer">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-[1px]">My Account</h1>
          <p className="text-muted text-sm mt-1">{user.name} · {user.email}</p>
        </div>
        <button
          onClick={() => { signOut(); navigate('/'); }}
          className="bg-transparent border border-border text-muted px-4 py-2 text-[12px] font-semibold uppercase tracking-[1px] rounded cursor-pointer hover:border-accent hover:text-accent transition-colors"
        >
          Sign Out
        </button>
      </div>

      <h2 className="text-lg font-bold uppercase tracking-[1px] mb-4">Order History</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-card border border-border rounded h-20 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted text-sm">
          No orders yet. Time to gear up!
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-muted">#{order._id.slice(-8)}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  order.status === 'delivered' ? 'bg-muted/10 text-muted' :
                  order.status === 'cancelled' ? 'bg-accent/10 text-accent' :
                  'bg-accent/10 text-accent'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm font-bold">₹{(order.total / 100).toLocaleString()}</div>
              <div className="text-[11px] text-muted mt-1">
                {new Date(order.createdAt).toLocaleDateString('en-IN')} · {order.items.length} item(s)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Add route to App.tsx**

```typescript
import Account from './pages/Account';

<Route path="/account" element={<Account />} />
```

**Step 4: Update Header to link to account**

Add to Header.tsx icons section:
```typescript
<Link to="/account" className="text-muted text-lg hover:text-text transition-colors" title="Account">👤</Link>
```

**Step 5: Commit**

```bash
git add client/src/pages/Account.tsx client/src/hooks/useOrders.ts client/src/App.tsx client/src/components/layout/Header.tsx
git commit -m "feat: add user account page with order history"
```

---

### Task 23: Final Integration Test + Polish

**Files:**
- Verify all routes work
- Verify all API endpoints respond
- Verify Supabase auth flow
- Verify Razorpay checkout flow

**Step 1: Start both servers**

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

**Step 2: Test API endpoints**

```bash
# Health check
curl http://localhost:3001/api/health

# Products (should return seeded data)
curl http://localhost:3001/api/products

# Categories
curl http://localhost:3001/api/categories
```

**Step 3: Test frontend pages**

- Visit http://localhost:5173 — Home page with products
- Click product card → Product modal opens
- Click "Sign In" → Redirects to Supabase Google OAuth
- After auth → Cart operations work
- Visit /checkout → Razorpay checkout form
- Visit /admin → Admin dashboard (for admin users)

**Step 4: Verify all tasks are complete**

Checklist:
- [x] Monorepo scaffold
- [x] Shared types
- [x] Backend config
- [x] Mongoose models
- [x] Auth middleware
- [x] Auth routes
- [x] Product/Category routes
- [x] Cart routes
- [x] Order routes + Razorpay
- [x] Webhook handler
- [x] Admin routes
- [x] Database seed
- [x] Frontend setup (Vite + Tailwind)
- [x] Supabase auth
- [x] Zustand stores
- [x] Layout components
- [x] Product components
- [x] Home page
- [x] Checkout + Razorpay
- [x] Admin dashboard
- [x] Admin products
- [x] Admin orders
- [x] Account page

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete MERN stack e-commerce with auth, payments, admin"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| **Phase 1** | 1-12 | Backend foundation: Express, MongoDB, Auth, Models, Routes |
| **Phase 2** | 13-18 | Frontend: Vite, React, Tailwind, Components, Home Page |
| **Phase 3** | 19-23 | Checkout, Admin, Orders, Integration |

**Total tasks:** 23
**Estimated time:** 2-3 weeks for MVP

**Dependencies:**
- MongoDB Atlas account (free tier)
- Supabase project (free tier) with Google OAuth enabled
- Razorpay test account
- Node.js 18+ installed locally
