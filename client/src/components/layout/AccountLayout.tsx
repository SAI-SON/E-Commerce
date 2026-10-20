import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User, MapPin, Package, Heart, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export const AccountLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vastra-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { name: 'My Profile', href: '/account/profile', icon: User },
    { name: 'Order History', href: '/account/orders', icon: Package },
    { name: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
    { name: 'My Wishlist', href: '/account/wishlist', icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 pb-4 border-b border-vastra-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-vastra-charcoal">
          Namaste, {user?.firstName}
        </h1>
        <p className="text-xs text-vastra-muted mt-1">
          Manage your personal details, tracked orders, delivery addresses, and saved pieces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Account Sidebar Navigation */}
        <aside className="md:col-span-1 space-y-1">
          <nav className="bg-white border border-vastra-border rounded-sm p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-sm transition-colors ${
                      isActive
                        ? 'bg-vastra-terracotta-light text-vastra-terracotta font-semibold'
                        : 'text-vastra-charcoal hover:bg-vastra-surface'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-sm transition-colors text-left border-t border-vastra-border/60 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Account Content Area */}
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
