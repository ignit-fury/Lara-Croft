import { create } from 'zustand';
import api from '../services/api';

export interface GuestCartItem {
  product_id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

interface GuestCartState {
  items: GuestCartItem[];
  loading: boolean;
  setItems: (items: GuestCartItem[]) => void;
  fetchCart: (sessionId: string) => Promise<void>;
  addItem: (sessionId: string, item: GuestCartItem) => Promise<void>;
  updateItem: (sessionId: string, productId: string, size: string, quantity: number) => Promise<void>;
  removeItem: (sessionId: string, productId: string, size: string) => Promise<void>;
  clearCart: () => void;
  total: () => number;
}

export const useGuestCartStore = create<GuestCartState>((set, get) => ({
  items: JSON.parse(localStorage.getItem('guest_cart') || '[]'),
  loading: false,
  setItems: (items) => {
    localStorage.setItem('guest_cart', JSON.stringify(items));
    set({ items });
  },
  fetchCart: async (sessionId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/cart/guest/${sessionId}`);
      const items = res.data.data.items || [];
      localStorage.setItem('guest_cart', JSON.stringify(items));
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addItem: async (sessionId, item) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await api.post(`/cart/guest/${sessionId}`, {
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
        image: item.image,
      });
      const items = res.data.data.items || [];
      localStorage.setItem('guest_cart', JSON.stringify(items));
      set({ items });
    } finally {
      set({ loading: false });
    }
  },
  updateItem: async (sessionId, productId, size, quantity) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await api.put(`/cart/guest/${sessionId}`, {
        product_id: productId,
        size,
        quantity,
      });
      const items = res.data.data.items || [];
      localStorage.setItem('guest_cart', JSON.stringify(items));
      set({ items });
    } finally {
      set({ loading: false });
    }
  },
  removeItem: async (sessionId, productId, size) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await api.delete(`/cart/guest/${sessionId}?product_id=${encodeURIComponent(productId)}&size=${encodeURIComponent(size)}`);
      const items = res.data.data.items || [];
      localStorage.setItem('guest_cart', JSON.stringify(items));
      set({ items });
    } finally {
      set({ loading: false });
    }
  },
  clearCart: () => {
    localStorage.removeItem('guest_cart');
    set({ items: [] });
  },
  total: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
