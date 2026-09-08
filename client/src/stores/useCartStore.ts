import { create } from 'zustand';
import type { CartItem } from '../types';
import api from '../services/api';

interface CartState {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, size: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, size: string, quantity: number) => Promise<void>;
  removeItem: (productId: string, size: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/cart');
      set({ items: res.data.data.items, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addItem: async (productId, size, quantity = 1) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await api.post('/cart/add', { productId, size, quantity });
      set({ items: res.data.data.items });
    } finally {
      set({ loading: false });
    }
  },
  updateItem: async (productId, size, quantity) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await api.put('/cart/update', { productId, size, quantity });
      set({ items: res.data.data.items });
    } finally {
      set({ loading: false });
    }
  },
  removeItem: async (productId, size) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await api.delete(`/cart/remove?productId=${encodeURIComponent(productId)}&size=${encodeURIComponent(size)}`);
      set({ items: res.data.data.items });
    } finally {
      set({ loading: false });
    }
  },
  clearCart: async () => {
    await api.delete('/cart/clear');
    set({ items: [] });
  },
  total: () => {
    return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  },
}));
