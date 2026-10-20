import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Sparkles, Mail, Check, X, BookOpen, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState<'care' | 'shipping' | 'privacy' | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <Link to="/" onClick={scrollToTop} className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-widest text-vastra-charcoal">
                TANTUVI
              </span>
            </Link>
            <p className="text-sm text-vastra-muted leading-relaxed max-w-sm">
              Tantuvi Atelier honors the sacred heritage of Indian handlooms, Ayurvedic natural dyes, and
              temple metalcraft. Designed for pure living, mindful meditation, and effortless modern grace.
            </p>
            <div className="pt-2 text-xs text-vastra-light space-y-1">
              <p>Handcrafted across Tamil Nadu, Bengal, Varanasi & Kashmir</p>
              <p>support@tantuvi.com | +91 (80) 4123-8900</p>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-vastra-charcoal">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-vastra-muted">
              <li>
                <Link
                  to="/products?category=mens-wear"
                  onClick={scrollToTop}
                  className="hover:text-vastra-terracotta transition-colors"
                >
                  Men's Handloom Kurtas
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=womens-wear"
                  onClick={scrollToTop}
                  className="hover:text-vastra-terracotta transition-colors"
                >
                  Chanderi & Silk Sarees
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=dhotis"
                  onClick={scrollToTop}
                  className="hover:text-vastra-terracotta transition-colors"
                >
                  Pleated Linen Dhotis
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=jewellery"
                  onClick={scrollToTop}
                  className="hover:text-vastra-terracotta transition-colors"
                >
                  Temple Silver Jewellery
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=accessories"
                  onClick={scrollToTop}
                  className="hover:text-vastra-terracotta transition-colors"
                >
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
                <Link
                  to="/account/orders"
                  onClick={scrollToTop}
                  className="hover:text-vastra-terracotta transition-colors"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  onClick={scrollToTop}
                  className="hover:text-vastra-terracotta transition-colors"
                >
                  Shopping Bag
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('care')}
                  className="hover:text-vastra-terracotta transition-colors text-left"
                >
                  Natural Fabric Care Guide
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('shipping')}
                  className="hover:text-vastra-terracotta transition-colors text-left"
                >
                  Shipping & Delivery Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-vastra-terracotta transition-colors text-left"
                >
                  Privacy & Terms
                </button>
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
          <p>© {new Date().getFullYear()} Tantuvi Atelier — Handcrafted Clothing & Living. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Verified Secure Checkout</span>
            <span>Handmade with Devotion in India</span>
          </div>
        </div>
      </div>

      {/* Customer Care Modal Dialogs */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-vastra-bg border border-vastra-border max-w-lg w-full p-6 sm:p-8 rounded-sm shadow-2xl relative text-vastra-charcoal max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-vastra-muted hover:text-vastra-charcoal rounded-sm hover:bg-stone-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'care' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-vastra-border pb-3">
                  <div className="w-9 h-9 rounded-full bg-vastra-terracotta-light text-vastra-terracotta flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-vastra-charcoal">
                      Natural Fabric Care Guide
                    </h3>
                    <p className="text-xs text-vastra-muted">
                      Honoring handloom weaves & Ayurvedic dyes
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-vastra-charcoal/90">
                  <div>
                    <h4 className="font-semibold text-vastra-terracotta uppercase tracking-wider text-[11px]">
                      Pure Handloom Silks & Chanderi
                    </h4>
                    <p>
                      Dry clean is strongly advised for first three washes. Steam iron on low heat
                      from the reverse side. Avoid spraying perfume or alcohol directly on natural
                      silk fibers.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-vastra-terracotta uppercase tracking-wider text-[11px]">
                      Khadi, Linen & Organic Cotton
                    </h4>
                    <p>
                      Hand wash separately in cold water with mild, pH-neutral detergent or soapnuts
                      (reetha). Dry in shaded open breeze; never wring harshly or tumble dry.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-vastra-terracotta uppercase tracking-wider text-[11px]">
                      Temple Silver & Brass Adornments
                    </h4>
                    <p>
                      Store in an airtight cloth pouch away from moisture and humidity. Polish gently
                      with a soft dry cotton flannel; avoid chemical liquid silver dips.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2.5 bg-vastra-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-vastra-terracotta transition-colors"
                  >
                    Close Guide
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'shipping' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-vastra-border pb-3">
                  <div className="w-9 h-9 rounded-full bg-vastra-olive-light text-vastra-olive flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-vastra-charcoal">
                      Shipping & Delivery Policy
                    </h3>
                    <p className="text-xs text-vastra-muted">
                      Conscious packaging & reliable dispatch
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-vastra-charcoal/90">
                  <div>
                    <h4 className="font-semibold text-vastra-olive uppercase tracking-wider text-[11px]">
                      Complimentary Domestic Shipping
                    </h4>
                    <p>
                      We offer free insured delivery on all domestic orders above ₹1,999. For orders
                      below ₹1,999, a nominal flat rate of ₹99 is applied at checkout.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-vastra-olive uppercase tracking-wider text-[11px]">
                      Dispatch & Transit Timelines
                    </h4>
                    <p>
                      Every piece is mindfully inspected and packed in plastic-free recycled paper.
                      Orders dispatch within 24–48 business hours. Expected delivery is 3–5 working
                      days for tier-1 cities, and 5–7 days for pan-India destinations.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-vastra-olive uppercase tracking-wider text-[11px]">
                      Live Order Tracking
                    </h4>
                    <p>
                      Once your parcel leaves our artisan hub, a tracking number and courier link
                      are instantly dispatched to your registered SMS and email address.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2.5 bg-vastra-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-vastra-terracotta transition-colors"
                  >
                    Got It
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-vastra-border pb-3">
                  <div className="w-9 h-9 rounded-full bg-vastra-sand-light text-vastra-sand flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-vastra-charcoal">
                      Privacy & Terms of Heritage
                    </h3>
                    <p className="text-xs text-vastra-muted">
                      Security, fair trade & data protection
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-vastra-charcoal/90">
                  <div>
                    <h4 className="font-semibold text-vastra-terracotta uppercase tracking-wider text-[11px]">
                      100% Artisan Provenance Guarantee
                    </h4>
                    <p>
                      Every garment is accompanied by an authenticity promise guaranteeing fair
                      wages directly paid to weaver clusters in Varanasi, Bengal, and Tamil Nadu.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-vastra-terracotta uppercase tracking-wider text-[11px]">
                      Mindful 7-Day Exchange
                    </h4>
                    <p>
                      If a fit does not suit your comfort, return or exchange unwashed garments with
                      original tags intact within 7 calendar days from delivery.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-vastra-terracotta uppercase tracking-wider text-[11px]">
                      Confidentiality & Payment Safety
                    </h4>
                    <p>
                      Your data is protected under 256-bit encryption. We never rent or monetize
                      your email, address, or purchase history with third-party advertising brokers.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2.5 bg-vastra-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-vastra-terracotta transition-colors"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
