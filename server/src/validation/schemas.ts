import { z } from 'zod';

// ---------------------------------------------------------------------------
// Canonical schemas — strict on known business fields, unknown keys stripped
// (Zod default). These match controller + frontend + DB truth.
// ---------------------------------------------------------------------------

// Auth
export const syncUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  supabaseId: z.string().min(1),
  avatar: z.string().max(500).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const customerSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
});

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

// Canonical address — matches authController + Account/Checkout + stored docs
export const addressSchema = z.object({
  label: z.string().min(1).max(50),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
});

// Cart — productId strictly UUID (DB identifiers); quantity coerces numeric
// strings at the input boundary, then strict int-range checked.
export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(100),
  size: z.string().max(20).optional(),
});

export const updateCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(100),
  size: z.string().max(20).optional(),
});

export const removeFromCartSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().max(20).optional(),
});

// Orders — canonical wrapper key is `shippingAddress` (controller reads it,
// frontend sends it). Amount is NEVER taken from client: server recomputes
// from cart + catalog inside createCheckoutSession.
export const createCheckoutSessionSchema = z.object({
  shippingAddress: addressSchema,
});

export const confirmOrderSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// Admin — Products (internal clients only, no legacy mapping)
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  price: z.number().min(0),
  original_price: z.number().min(0).optional(),
  category_id: z.string().uuid(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  on_sale: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

// Admin — Orders
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
});

// Admin — Users
export const updateUserRoleSchema = z.object({
  role: z.enum(['customer', 'admin', 'manager', 'super_admin']),
});

// ---------------------------------------------------------------------------
// Legacy normalizers — TEMPORARY backward compat.
// Accept old request shapes at the API boundary, convert to canonical.
// Log usage via `legacyUsed` so removal can be verified in logs.
// Remove only after logs confirm old shapes are gone.
// ---------------------------------------------------------------------------

export interface Normalized<T = any> {
  data: T;
  legacyUsed: boolean;
}

/** Old address variants: `street` -> `line1`, `zip`/`postal_code` -> `postalCode`. */
export function normalizeAddress(raw: any): Normalized {
  if (!raw || typeof raw !== 'object') return { data: raw, legacyUsed: false };
  const legacyUsed = 'street' in raw || 'zip' in raw || 'postal_code' in raw;
  if (!legacyUsed) return { data: raw, legacyUsed: false };
  const data: any = { ...raw };
  if (data.line1 == null && typeof data.street === 'string') data.line1 = data.street;
  if (data.postalCode == null) {
    if (typeof data.zip === 'string') data.postalCode = data.zip;
    else if (typeof data.postal_code === 'string') data.postalCode = data.postal_code;
  }
  delete data.street;
  delete data.zip;
  delete data.postal_code;
  return { data, legacyUsed };
}

/** Old checkout wrapper `{ address }` -> canonical `{ shippingAddress }`. */
export function normalizeCheckout(raw: any): Normalized {
  if (!raw || typeof raw !== 'object') return { data: raw, legacyUsed: false };
  const data: any = { ...raw };
  let legacyUsed = false;
  if (data.shippingAddress == null && data.address != null) {
    data.shippingAddress = data.address;
    delete data.address;
    legacyUsed = true;
  }
  if (data.shippingAddress != null) {
    const n = normalizeAddress(data.shippingAddress);
    data.shippingAddress = n.data;
    legacyUsed = legacyUsed || n.legacyUsed;
  }
  return { data, legacyUsed };
}
