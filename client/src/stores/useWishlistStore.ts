import { create } from 'zustand';
import type { Product } from '../types';
import api from '../services/api';

interface WishlistState {
  items: Product[];
  loading: boolean;
  ids: Set<string>;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  ids: new Set<string>(),
  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/wishlist');
      const items: Product[] = res.data.data || [];
      set({ items, ids: new Set(items.map((p) => p.id)), loading: false });
    } catch {
      set({ loading: false });
    }
  },
  toggleWishlist: async (productId: string) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      if (get().ids.has(productId)) {
        await api.delete(`/wishlist/${productId}`);
      } else {
        await api.post(`/wishlist/${productId}`);
      }
      await get().fetchWishlist();
    } catch {
      set({ loading: false });
    }
  },
  isInWishlist: (productId: string) => get().ids.has(productId),
}));
