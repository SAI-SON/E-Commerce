import { create } from 'zustand';
import { User } from '../types/index.js';
import { api, getGuestSessionId } from '../lib/api.js';
import { supabase, isSupabaseConfigured, SupabaseUser } from '../lib/supabase.js';

interface AuthState {
  user: User | null;
  token: string | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  syncSupabaseUser: (sbUser: SupabaseUser) => Promise<User>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('vastra_auth_token'),
  supabaseUser: null,
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

  syncSupabaseUser: async (sbUser: SupabaseUser) => {
    const email = sbUser.email || '';
    const metadata = sbUser.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || '';
    const parts = fullName.trim().split(' ');
    const firstName = metadata.first_name || parts[0] || email.split('@')[0] || 'Patron';
    const lastName = metadata.last_name || parts.slice(1).join(' ') || '';

    const res = await api.post<{
      data: { user: User; token: string };
    }>('/auth/supabase', {
      email,
      firstName,
      lastName,
      provider: sbUser.app_metadata?.provider || 'supabase',
    });

    set({ supabaseUser: sbUser });
    get().setAuth(res.data.user, res.data.token);
    return res.data.user;
  },

  logout: async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut().catch(() => {});
      }
      await api.post('/auth/logout').catch(() => {});
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('vastra_auth_token');
      set({
        user: null,
        token: null,
        supabaseUser: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  },

  initialize: async () => {
    // 1. Setup real-time listener for Supabase Auth state changes if configured
    if (isSupabaseConfigured) {
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const sbUser = session?.user || null;
        set({ supabaseUser: sbUser });
        if (sbUser && !get().isAuthenticated) {
          try {
            await get().syncSupabaseUser(sbUser);
          } catch {
            // Fall back to backend token
          }
        }
      });
    }

    // 2. Validate existing backend JWT session
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
