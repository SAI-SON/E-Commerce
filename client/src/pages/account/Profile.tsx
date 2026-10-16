import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { api } from '../../lib/api.js';
import { Button } from '../../components/common/Button.js';
import { User } from '../../types/index.js';

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const res = await api.patch<{ data: User }>('/auth/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });

      setUser(res.data);
      setSuccessMessage('Profile details successfully updated.');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-vastra-border rounded-sm p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-vastra-border/60">
        <h2 className="font-serif text-xl font-semibold text-vastra-charcoal">Personal Profile</h2>
        <p className="text-xs text-vastra-muted mt-0.5">
          Update your contact details and account preferences
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
            Email Address (Read-only)
          </label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-3 py-2 text-xs bg-stone-100 border border-vastra-border rounded-sm text-vastra-muted cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
            Contact Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
            Account Role
          </label>
          <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-xs bg-vastra-surface text-vastra-charcoal border border-vastra-border">
            {user?.role}
          </span>
        </div>

        <div className="pt-2">
          <Button type="submit" size="sm" isLoading={isUpdating}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
