import { z } from 'zod';

// Auth
export const syncUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  supabaseId: z.string().min(1),
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

export const addAddressSchema = z.object({
  label: z.string().min(1).max(50),
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  zip: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
});

// Cart
export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100).default(1),
  size: z.string().max(20).optional(),
});

export const updateCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(0).max(100),
  size: z.string().max(20).optional(),
});

export const removeFromCartSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().max(20).optional(),
});

// Orders
export const createCheckoutSessionSchema = z.object({
  shippingAddress: addAddressSchema,
});

export const confirmOrderSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// Admin — Products
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  price: z.number().min(0),
  original_price: z.number().min(0).optional(),
  category_id: z.string().uuid(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
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
