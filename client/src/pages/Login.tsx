import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { api } from '../lib/api.js';
import { Button } from '../components/common/Button.js';
import { User } from '../types/index.js';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/account/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await api.post<{
        data: { user: User; token: string };
      }>('/auth/login', {
        email: email.trim(),
        password,
      });

      setAuth(res.data.user, res.data.token);

      // If user is Admin and logging in, optionally direct to /admin
      if (res.data.user.role === 'ADMIN' && from === '/account/profile') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillDemo = (demoType: 'customer' | 'admin') => {
    if (demoType === 'customer') {
      setEmail('customer@vastrastore.com');
      setPassword('Customer@12345');
    } else {
      setEmail('admin@vastrastore.com');
      setPassword('Admin@12345');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-vastra-border rounded-sm p-8 shadow-xs">
        <div className="text-center mb-8">
          <span className="font-serif text-2xl font-bold tracking-widest text-vastra-charcoal">
            VASTRA
          </span>
          <h1 className="font-serif text-xl font-semibold text-vastra-charcoal mt-3">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-vastra-muted mt-1">
            Access your saved wishlist, orders, and addresses
          </p>
        </div>

        {/* Demo Credentials Fast-Access Bar */}
        <div className="mb-6 p-3 bg-vastra-surface border border-vastra-border/80 rounded-sm text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-vastra-terracotta font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Quick Demo Credentials</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAutofillDemo('customer')}
              className="flex-1 py-1.5 px-2 bg-white border border-vastra-border hover:border-vastra-charcoal text-[11px] rounded-xs text-center font-medium transition-colors"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleAutofillDemo('admin')}
              className="flex-1 py-1.5 px-2 bg-white border border-vastra-border hover:border-vastra-charcoal text-[11px] rounded-xs text-center font-medium transition-colors"
            >
              Store Admin
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
              />
              <Mail className="w-4 h-4 text-vastra-muted absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-vastra-charcoal">
                Password *
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-vastra-terracotta hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
              />
              <Lock className="w-4 h-4 text-vastra-muted absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-vastra-muted hover:text-vastra-charcoal"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="md" className="w-full mt-2" isLoading={isLoading}>
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-vastra-border/60 text-center text-xs text-vastra-muted">
          New to Vastra?{' '}
          <Link to="/register" className="text-vastra-terracotta font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
