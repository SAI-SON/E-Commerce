import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { useAuthStore } from '../store/authStore.js';
import { AccountLayout } from '../components/layout/AccountLayout.js';
import { Login } from '../pages/Login.js';
import { Register } from '../pages/Register.js';

describe('Supabase Authentication & Security Best Practices', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      supabaseUser: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    });
  });

  it('initializes Supabase client without exposing service role or database password', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(isSupabaseConfigured).toBe(true);
    // Verify client has public URL configured
    expect(typeof supabase.auth.signUp).toBe('function');
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signInWithOAuth).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');

    // Security check: Ensure service role secret or DB connection string is never present in client env
    expect(import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    expect(import.meta.env.DATABASE_URL).toBeUndefined();
  });

  it('manages authentication state and session persistence in authStore', async () => {
    const mockUser = {
      id: 'cust-123',
      email: 'patron@vastrastore.com',
      firstName: 'Priya',
      lastName: 'Nair',
      role: 'CUSTOMER' as const,
      createdAt: '2026-10-20T00:00:00.000Z',
    };
    const mockToken = 'mock-jwt-token-vastra';

    // 1. Initial unauthenticated state
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();

    // 2. setAuth stores token and marks user authenticated
    useAuthStore.getState().setAuth(mockUser, mockToken);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('patron@vastrastore.com');
    expect(localStorage.getItem('vastra_auth_token')).toBe(mockToken);

    // 3. logout clears token and resets user state
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('vastra_auth_token')).toBeNull();
  });

  it('protects account routes and redirects unauthenticated users to /login', () => {
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/account/orders']}>
        <Routes>
          <Route path="/account" element={<AccountLayout />}>
            <Route path="orders" element={<div>Protected Orders Page</div>} />
          </Route>
          <Route path="/login" element={<div>Sign In Required</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should NOT render protected page
    expect(screen.queryByText('Protected Orders Page')).not.toBeInTheDocument();
    // Should redirect to login
    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
  });

  it('allows authenticated users to access protected account routes', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'cust-456',
        email: 'priya@vastra.com',
        firstName: 'Priya',
        lastName: 'Nair',
        role: 'CUSTOMER',
        createdAt: '2026-10-20T00:00:00.000Z',
      },
    });

    render(
      <MemoryRouter initialEntries={['/account/orders']}>
        <Routes>
          <Route path="/account" element={<AccountLayout />}>
            <Route path="orders" element={<div>Protected Orders Page</div>} />
          </Route>
          <Route path="/login" element={<div>Sign In Required</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Orders Page')).toBeInTheDocument();
    expect(screen.getByText(/Namaste, Priya/i)).toBeInTheDocument();
  });

  it('renders Material UI Login interface with credentials demo and Google option', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('VASTRA ATELIER')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password \*/i)).toBeInTheDocument();
    expect(screen.getByText('Quick Demo Credentials')).toBeInTheDocument();
    expect(screen.getByText('Demo Customer')).toBeInTheDocument();
    expect(screen.getByText('Store Admin')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders Material UI Register interface with name, email, and password strength', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText('Join the Vastra Collective')).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Create Password/i)).toBeInTheDocument();
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });
});
