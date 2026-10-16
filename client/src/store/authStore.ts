import { create } from 'zustand';
import { User } from '../types/index.js';
import { api, getGuestSessionId } from '../lib/api.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('vastra_auth_token'),
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  setAuth: (user: User, token: string) => {
    localStorage.setItem('vastra_auth_token', token);
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === 'ADMIN',
      isLoading: false,
    });

    // Merge guest cart upon login
    const guestSessionId = getGuestSessionId();
    if (guestSessionId) {
      api.post('/cart/merge', { guestSessionId }).catch(() => {});
    }
  },

  setUser: (user: User) => {
    set({
      user,
      isAdmin: user.role === 'ADMIN',
    });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('vastra_auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('vastra_auth_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null, isAdmin: false });
      return;
    }

    try {
      const res = await api.get<{ success: boolean; data: User }>('/auth/me');
      set({
        user: res.data,
        isAuthenticated: true,
        isAdmin: res.data.role === 'ADMIN',
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('vastra_auth_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  },
}));
