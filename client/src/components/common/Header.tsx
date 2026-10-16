import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { itemCount } = useCartStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'All Collection', href: '/products' },
    { name: "Men's Wear", href: '/products?category=mens-wear' },
    { name: "Women's Wear", href: '/products?category=womens-wear' },
    { name: 'Temple Jewellery', href: '/products?category=jewellery' },
    { name: 'Living & Accessories', href: '/products?category=accessories' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-vastra-bg/95 backdrop-blur-md border-b border-vastra-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-vastra-charcoal hover:text-vastra-terracotta focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <Link to="/" className="inline-block group">
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-vastra-charcoal group-hover:text-vastra-terracotta transition-colors">
                  VASTRA
                </span>
                <span className="text-[9px] tracking-[0.25em] text-vastra-muted uppercase -mt-1 font-sans">
                  Artisanal Wear & Living
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium tracking-wide text-vastra-charcoal hover:text-vastra-terracotta transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-vastra-terracotta after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-vastra-charcoal hover:text-vastra-terracotta transition-colors focus:outline-none"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to={isAuthenticated ? '/account/wishlist' : '/login'}
              className="p-2 text-vastra-charcoal hover:text-vastra-terracotta transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="p-2 text-vastra-charcoal hover:text-vastra-terracotta transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-vastra-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 p-2 text-vastra-charcoal hover:text-vastra-terracotta focus:outline-none"
                    aria-label="Account menu"
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-vastra-border shadow-elevated rounded-sm py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-vastra-border/60">
                        <p className="text-xs text-vastra-muted">Signed in as</p>
                        <p className="text-sm font-semibold text-vastra-charcoal truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <span className="text-[10px] text-vastra-terracotta uppercase font-bold tracking-wider">
                          {user?.role}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-vastra-charcoal hover:bg-vastra-surface/80 hover:text-vastra-terracotta"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2.5 text-vastra-terracotta" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-vastra-charcoal hover:bg-vastra-surface/80"
                      >
                        <Package className="w-4 h-4 mr-2.5 text-vastra-muted" />
                        My Orders
                      </Link>

                      <Link
                        to="/account/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-vastra-charcoal hover:bg-vastra-surface/80"
                      >
                        <UserIcon className="w-4 h-4 mr-2.5 text-vastra-muted" />
                        Account Settings
                      </Link>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left border-t border-vastra-border/60 mt-1"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center justify-center text-xs tracking-wider uppercase font-semibold px-4 py-2 border border-vastra-border hover:border-vastra-charcoal transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="py-3 pb-5 border-t border-vastra-border/60 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kurtas, raw silk sarees, temple jewellery, accessories..."
                className="w-full pl-11 pr-24 py-2.5 bg-vastra-surface border border-vastra-border text-sm text-vastra-charcoal placeholder-vastra-light focus:outline-none focus:border-vastra-terracotta rounded-sm"
                autoFocus
              />
              <Search className="w-4 h-4 text-vastra-muted absolute left-4 top-3.5" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-vastra-terracotta text-white text-xs px-4 py-1.5 font-medium rounded-sm hover:bg-vastra-terracotta-hover transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-vastra-border py-4 space-y-3 animate-fade-in bg-vastra-bg">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-vastra-charcoal hover:bg-vastra-surface hover:text-vastra-terracotta rounded-sm"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-vastra-border px-3 space-y-2">
              {!isAuthenticated ? (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold border border-vastra-border rounded-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold bg-vastra-terracotta text-white rounded-sm"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-vastra-terracotta"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/account/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm text-vastra-charcoal"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="block w-full text-left py-2 text-sm text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
