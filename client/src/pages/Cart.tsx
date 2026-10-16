import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag, Truck } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { api } from '../lib/api.js';
import { formatPrice } from '../lib/utils.js';
import { ImageWithFallback } from '../components/common/ImageWithFallback.js';
import { Button } from '../components/common/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, setCart, fetchCart, isLoading } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    try {
      setUpdatingItemId(cartItemId);
      const res = await api.patch<{ data: typeof cart }>(`/cart/items/${cartItemId}`, {
        quantity: newQuantity,
      });
      if (res.data) setCart(res.data);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      setUpdatingItemId(cartItemId);
      const res = await api.delete<{ data: typeof cart }>(`/cart/items/${cartItemId}`);
      if (res.data) setCart(res.data);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to remove item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setIsApplyingCoupon(true);
      setCouponError(null);
      setCouponSuccess(null);

      // Validate coupon with backend
      const res = await api.post<{
        data: {
          code: string;
          discountAmount: number;
          description?: string;
        };
      }>('/coupons/validate', {
        code: couponCode.trim().toUpperCase(),
        subtotal: cart?.subtotal || 0,
      });

      // Reload cart with applied coupon query
      const cartRes = await api.get<{ data: typeof cart }>(
        `/cart?coupon=${encodeURIComponent(res.data.code)}`
      );
      if (cartRes.data) {
        setCart(cartRes.data);
        setCouponSuccess(`Coupon ${res.data.code} applied! Saved ₹${res.data.discountAmount}`);
        setCouponCode('');
      }
    } catch (err: unknown) {
      setCouponError((err as Error).message || 'Invalid or expired coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const res = await api.get<{ data: typeof cart }>('/cart');
      if (res.data) {
        setCart(res.data);
        setCouponSuccess(null);
        setCouponError(null);
      }
    } catch {
      // ignore
    }
  };

  if (isLoading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vastra-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 text-vastra-muted" />}
          title="Your Shopping Bag is Empty"
          description="You haven't selected any artisanal pieces yet. Explore our handcrafted kurtas, sarees, and temple jewellery."
          actionText="Explore Collection"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 pb-4 border-b border-vastra-border">
        <h1 className="font-serif text-3xl font-bold text-vastra-charcoal">
          Your Shopping Bag ({cart.itemCount})
        </h1>
        <p className="text-xs text-vastra-muted mt-1">
          Review your chosen pieces before proceeding to safe, insured checkout.
        </p>
      </div>

      {/* Free Shipping Meter */}
      <div className="mb-8 p-4 bg-vastra-surface border border-vastra-border/60 rounded-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-vastra-olive" />
            {cart.amountNeededForFreeShipping > 0 ? (
              <span>
                Add{' '}
                <strong className="text-vastra-terracotta">
                  {formatPrice(cart.amountNeededForFreeShipping)}
                </strong>{' '}
                more to unlock <strong className="text-vastra-olive">Free Shipping</strong>!
              </span>
            ) : (
              <span className="text-vastra-olive font-semibold flex items-center gap-1.5">
                🎉 Congratulations! You have unlocked Complimentary Free Shipping.
              </span>
            )}
          </div>
          <span className="text-vastra-muted font-medium">Goal: ₹1,999</span>
        </div>
        <div className="w-full bg-vastra-border/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-vastra-olive h-full transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(100, (cart.subtotal / cart.freeShippingThreshold) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-vastra-border rounded-sm bg-white divide-y divide-vastra-border/60">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-opacity"
                style={{ opacity: updatingItemId === item.id ? 0.5 : 1 }}
              >
                {/* Product thumbnail & basic info */}
                <div className="flex gap-4 items-center">
                  <Link
                    to={`/products/${item.productSlug}`}
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-sm bg-vastra-surface overflow-hidden shrink-0 border border-vastra-border/40"
                  >
                    <ImageWithFallback
                      src={item.primaryImage}
                      alt={item.productName}
                      fallbackText={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="space-y-1">
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="font-serif text-sm sm:text-base font-semibold text-vastra-charcoal hover:text-vastra-terracotta transition-colors line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    <div className="flex flex-wrap gap-2 text-xs text-vastra-muted">
                      <span>Size: <strong>{item.size}</strong></span>
                      <span>•</span>
                      <span>Colour: <strong>{item.colour}</strong></span>
                    </div>
                    <div className="text-xs font-mono text-vastra-light">SKU: {item.sku}</div>

                    <div className="sm:hidden pt-2 flex items-baseline gap-2">
                      <span className="font-semibold text-sm text-vastra-charcoal">
                        {formatPrice(item.unitPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Subtotal */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                  <div className="flex items-center gap-4">
                    {/* Stepper */}
                    <div className="flex items-center border border-vastra-border rounded-sm bg-vastra-surface">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItemId === item.id}
                        className="px-2.5 py-1 text-xs text-vastra-charcoal hover:bg-vastra-border/40 disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-vastra-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stockQuantity || updatingItemId === item.id}
                        className="px-2.5 py-1 text-xs text-vastra-charcoal hover:bg-vastra-border/40 disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-vastra-light hover:text-red-600 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="font-semibold text-sm text-vastra-charcoal block">
                      {formatPrice(item.subtotal)}
                    </span>
                    <span className="text-[11px] text-vastra-light">
                      ({formatPrice(item.unitPrice)} each)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/products"
              className="text-xs font-semibold uppercase tracking-wider text-vastra-terracotta hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Input Form */}
          <div className="p-6 bg-white border border-vastra-border rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-vastra-charcoal uppercase tracking-wider">
              <Tag className="w-4 h-4 text-vastra-terracotta" />
              <span>Apply Promotional Code</span>
            </div>

            {cart.appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-emerald-800">
                    {cart.appliedCoupon.code}
                  </span>
                  <p className="text-[11px] text-emerald-700">
                    Discount Applied: -{formatPrice(cart.appliedCoupon.discountApplied)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-600 text-xs font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. VASTRA10"
                    className="flex-1 px-3 py-2 text-xs bg-vastra-surface border border-vastra-border uppercase tracking-wider font-mono rounded-sm focus:outline-none focus:border-vastra-terracotta"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    isLoading={isApplyingCoupon}
                  >
                    Apply
                  </Button>
                </div>
                {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                {couponSuccess && <p className="text-xs text-emerald-700">{couponSuccess}</p>}
                <p className="text-[11px] text-vastra-light">
                  Try test coupons: <span className="font-mono font-medium text-vastra-charcoal">VASTRA10</span> (10% off) or <span className="font-mono font-medium text-vastra-charcoal">WELCOME500</span> (₹500 flat)
                </p>
              </form>
            )}
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="p-6 bg-white border border-vastra-border rounded-sm space-y-4">
            <h3 className="font-serif text-lg font-semibold text-vastra-charcoal pb-3 border-b border-vastra-border/60">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-vastra-muted">
              <div className="flex justify-between">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium text-vastra-charcoal">{formatPrice(cart.subtotal)}</span>
              </div>

              {cart.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(cart.discountTotal)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-medium text-vastra-charcoal">
                  {cart.shippingTotal === 0 ? (
                    <span className="text-vastra-olive font-semibold">Free</span>
                  ) : (
                    formatPrice(cart.shippingTotal)
                  )}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-vastra-border/60 text-sm font-semibold text-vastra-charcoal">
                <span>Estimated Grand Total</span>
                <span className="font-serif text-base text-vastra-charcoal">
                  {formatPrice(cart.grandTotal)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              size="lg"
              className="w-full shadow-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="pt-4 flex items-center justify-center gap-2 text-[11px] text-vastra-muted">
              <ShieldCheck className="w-4 h-4 text-vastra-olive" />
              <span>Safe & Insured Delivery by Vastra Express</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
