import { z } from 'zod';

// Auth — lenient for old data
export const syncUserSchema = z.object({
  email: z.string(),
  name: z.string().default('User'),
  supabaseId: z.string(),
}).passthrough();

export const adminLoginSchema = z.object({
  email: z.string(),
  password: z.string().min(1),
}).passthrough();

export const customerSignupSchema = z.object({
  email: z.string(),
  password: z.string().min(1),
  name: z.string().default('User'),
}).passthrough();

export const customerLoginSchema = z.object({
  email: z.string(),
  password: z.string().min(1),
}).passthrough();

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
}).passthrough();

export const addAddressSchema = z.object({
  label: z.string().default('Home'),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string().default('India'),
  phone: z.string().default(''),
}).passthrough();

// Cart
export const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
  size: z.string().optional(),
}).passthrough();

export const updateCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().int().min(0).max(100),
  size: z.string().optional(),
}).passthrough();

export const removeFromCartSchema = z.object({
  productId: z.string(),
  size: z.string().optional(),
}).passthrough();

// Orders
export const createCheckoutSessionSchema = z.object({
  shippingAddress: addAddressSchema,
}).passthrough();

export const confirmOrderSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
}).passthrough();

// Admin — Products
export const createProductSchema = z.object({
  name: z.string(),
  description: z.string().default(''),
  price: z.coerce.number().min(0),
  original_price: z.coerce.number().min(0).optional(),
  category_id: z.string(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  on_sale: z.boolean().default(false),
}).passthrough();

export const updateProductSchema = createProductSchema.partial();

// Admin — Orders
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
}).passthrough();

// Admin — Users
export const updateUserRoleSchema = z.object({
  role: z.enum(['customer', 'admin', 'manager', 'super_admin']),
}).passthrough();
