import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Sparkles, Mail, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-vastra-surface border-t border-vastra-border text-vastra-charcoal">
      {/* Brand Values Banner */}
      <div className="border-b border-vastra-border/60 py-10 bg-vastra-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-vastra-terracotta-light text-vastra-terracotta flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide">100% Organic & Pure</h4>
                <p className="text-xs text-vastra-muted">GOTS cotton & natural wild silks</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-vastra-olive-light text-vastra-olive flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide">Complimentary Shipping</h4>
                <p className="text-xs text-vastra-muted">On all orders above ₹1,999</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-vastra-sand-light text-vastra-sand flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide">Mindful 7-Day Exchange</h4>
                <p className="text-xs text-vastra-muted">Hassle-free size adjustments</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-vastra-indigo-light text-vastra-indigo flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide">Artisan Empowered</h4>
                <p className="text-xs text-vastra-muted">Direct pit-loom weaver support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-widest text-vastra-charcoal">
                VASTRA
              </span>
            </Link>
            <p className="text-sm text-vastra-muted leading-relaxed max-w-sm">
              Vastra honors the sacred heritage of Indian handlooms, Ayurvedic natural dyes, and
              temple metalcraft. Designed for pure living, mindful meditation, and effortless modern grace.
            </p>
            <div className="pt-2 text-xs text-vastra-light space-y-1">
              <p>Handcrafted across Tamil Nadu, Bengal, Varanasi & Kashmir</p>
              <p>support@vastrastore.com | +91 (80) 4123-8900</p>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-vastra-charcoal">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-vastra-muted">
              <li>
                <Link to="/products?category=mens-wear" className="hover:text-vastra-terracotta transition-colors">
                  Men's Handloom Kurtas
                </Link>
              </li>
              <li>
                <Link to="/products?category=womens-wear" className="hover:text-vastra-terracotta transition-colors">
                  Chanderi & Silk Sarees
                </Link>
              </li>
              <li>
                <Link to="/products?category=dhotis" className="hover:text-vastra-terracotta transition-colors">
                  Pleated Linen Dhotis
                </Link>
              </li>
              <li>
                <Link to="/products?category=jewellery" className="hover:text-vastra-terracotta transition-colors">
                  Temple Silver Jewellery
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="hover:text-vastra-terracotta transition-colors">
                  Himalayan Pashmina
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-vastra-charcoal">
              Customer Care
            </h4>
            <ul className="space-y-2 text-sm text-vastra-muted">
              <li>
                <Link to="/account/orders" className="hover:text-vastra-terracotta transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-vastra-terracotta transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <span className="cursor-default">Natural Fabric Care Guide</span>
              </li>
              <li>
                <span className="cursor-default">Shipping & Delivery Policy</span>
              </li>
              <li>
                <span className="cursor-default">Privacy & Terms</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-vastra-charcoal">
              The Artisan Chronicle
            </h4>
            <p className="text-xs text-vastra-muted leading-relaxed">
              Receive mindful notes on traditional weaves, natural dye seasons, and private preview access.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-sm">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you. Welcome to our mindful collective.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-3 pr-9 py-2 bg-white border border-vastra-border text-xs rounded-sm focus:outline-none focus:border-vastra-terracotta"
                  />
                  <Mail className="w-4 h-4 text-vastra-muted absolute right-3 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-vastra-charcoal text-white text-xs font-semibold tracking-wider uppercase hover:bg-vastra-terracotta transition-colors rounded-sm"
                >
                  Join Circle
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-vastra-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-vastra-light gap-4">
          <p>© {new Date().getFullYear()} Vastra — Clothing & Accessories Store. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Verified Secure Checkout</span>
            <span>Handmade with Devotion in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
