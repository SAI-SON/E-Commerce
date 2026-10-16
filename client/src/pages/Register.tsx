import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { api } from '../lib/api.js';
import { Button } from '../components/common/Button.js';
import { User as UserType } from '../types/index.js';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await api.post<{
        data: { user: UserType; token: string };
      }>('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });

      setAuth(res.data.user, res.data.token);
      navigate('/account/profile');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Registration failed');
    } finally {
      setIsLoading(false);
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
            Join the Vastra Collective
          </h1>
          <p className="text-xs text-vastra-muted mt-1">
            Experience mindful handcrafted living and private previews
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                First Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aarav"
                  className="w-full pl-8 pr-2.5 py-2.5 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                />
                <User className="w-3.5 h-3.5 text-vastra-muted absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full px-3 py-2.5 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
              />
            </div>
          </div>

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
                placeholder="aarav@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
              />
              <Mail className="w-4 h-4 text-vastra-muted absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
              />
              <Phone className="w-4 h-4 text-vastra-muted absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
              Create Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
              />
              <Lock className="w-4 h-4 text-vastra-muted absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-vastra-muted hover:text-vastra-charcoal"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-vastra-light mt-1">
              Must contain at least 8 characters, one uppercase letter, and one number.
            </p>
          </div>

          <Button type="submit" size="md" className="w-full mt-4" isLoading={isLoading}>
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-vastra-border/60 text-center text-xs text-vastra-muted">
          Already a patron?{' '}
          <Link to="/login" className="text-vastra-terracotta font-semibold hover:underline">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};
