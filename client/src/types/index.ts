export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category | string;
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
  id: string;
  name: string;
  slug: string;
  image?: string;
  order: number;
  active: boolean;
}

export interface User {
  id: string;
  supabaseId: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager' | 'super_admin';
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
  productId: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  user: User | string;
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
  productId: string;
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
