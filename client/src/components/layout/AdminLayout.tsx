import React, { useEffect } from 'react';
import { NavLink, Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Ticket,
  ArrowLeft,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isLoading, initialize, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-200">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Strict role check: require ADMIN role!
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', end: true, icon: LayoutDashboard },
    { name: 'Product Catalogue', href: '/admin/products', end: false, icon: Package },
    { name: 'Inventory & Stock Audit', href: '/admin/inventory', end: false, icon: Layers },
    { name: 'Customer Orders', href: '/admin/orders', end: false, icon: ShoppingBag },
    { name: 'Promotional Coupons', href: '/admin/coupons', end: false, icon: Ticket },
  ];

  return (
    <div className="min-h-screen flex bg-stone-100 text-stone-900 font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 border-r border-stone-800">
        <div className="p-6 border-b border-stone-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-600/20 text-amber-500 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-wider text-white block">
              VASTRA
            </span>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 block -mt-1">
              Store Control Panel
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>

          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-stone-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Logged in as
            </span>
            <span className="text-xs font-bold text-stone-900">
              {user?.firstName} {user?.lastName} ({user?.email})
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
              Admin Access Active
            </span>
          </div>
        </header>

        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
