import { create } from 'zustand';
import { Cart } from '../types/index.js';
import { api } from '../lib/api.js';

interface CartState {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  setCart: (cart: Cart) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemCount: 0,
  isLoading: false,
  isCartDrawerOpen: false,

  setCart: (cart: Cart) => {
    set({
      cart,
      itemCount: cart.itemCount,
    });
  },

  openDrawer: () => set({ isCartDrawerOpen: true }),
  closeDrawer: () => set({ isCartDrawerOpen: false }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<{ success: boolean; data: Cart }>('/cart');
      set({
        cart: res.data,
        itemCount: res.data.itemCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
