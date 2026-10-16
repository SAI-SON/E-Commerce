import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Smartphone, Building, Banknote, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { api } from '../lib/api.js';
import { formatPrice } from '../lib/utils.js';
import { Button } from '../components/common/Button.js';
import { Address, Order } from '../types/index.js';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Contact & Address fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country] = useState('India');

  const [paymentMethod, setPaymentMethod] = useState<
    'SIMULATED_UPI' | 'SIMULATED_CARD' | 'SIMULATED_NET_BANKING' | 'CASH_ON_DELIVERY'
  >('SIMULATED_UPI');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Load saved customer addresses if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user) {
        setEmail(user.email);
        setPhone(user.phone || '');
        setFullName(`${user.firstName} ${user.lastName}`);
      }

      api
        .get<{ data: Address[] }>('/addresses')
        .then((res) => {
          setSavedAddresses(res.data);
          const defaultShip = res.data.find((a) => a.isDefaultShipping) || res.data[0];
          if (defaultShip) {
            setSelectedAddressId(defaultShip.id);
            setFullName(defaultShip.fullName);
            setPhone(defaultShip.phone);
            setStreetAddress(defaultShip.streetAddress);
            setApartment(defaultShip.apartment || '');
            setCity(defaultShip.city);
            setState(defaultShip.state);
            setPostalCode(defaultShip.postalCode);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleSelectSavedAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === 'new') {
      setStreetAddress('');
      setApartment('');
      setCity('');
      setState('');
      setPostalCode('');
    } else {
      const addr = savedAddresses.find((a) => a.id === addressId);
      if (addr) {
        setFullName(addr.fullName);
        setPhone(addr.phone);
        setStreetAddress(addr.streetAddress);
        setApartment(addr.apartment || '');
        setCity(addr.city);
        setState(addr.state);
        setPostalCode(addr.postalCode);
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const orderPayload = {
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          streetAddress: streetAddress.trim(),
          apartment: apartment.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country,
        },
        items: cart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        couponCode: cart.appliedCoupon?.code || undefined,
        paymentMethod,
      };

      const res = await api.post<{ data: Order }>('/orders', orderPayload);

      // Refresh cart state to 0 after purchase
      await fetchCart();

      // Navigate to verified Order Confirmation route
      navigate(`/order-confirmation/${res.data.orderNumber}`);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to place order. Please review your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-vastra-charcoal mb-4">Your Bag is Empty</h2>
        <p className="text-sm text-vastra-muted mb-6">Add pieces to your bag before checking out.</p>
        <Link to="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 pb-4 border-b border-vastra-border">
        <h1 className="font-serif text-3xl font-bold text-vastra-charcoal">Secure Checkout</h1>
        <div className="flex items-center gap-2 text-xs text-vastra-olive mt-1">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit Encrypted Simulated Checkout Process</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Contact Information */}
          <div className="p-6 bg-white border border-vastra-border rounded-sm space-y-4">
            <h2 className="font-serif text-lg font-semibold text-vastra-charcoal pb-2 border-b border-vastra-border/60">
              1. Customer Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@example.com"
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="p-6 bg-white border border-vastra-border rounded-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-vastra-border/60">
              <h2 className="font-serif text-lg font-semibold text-vastra-charcoal">
                2. Delivery Address
              </h2>
              {isAuthenticated && savedAddresses.length > 0 && (
                <span className="text-xs text-vastra-muted">
                  {savedAddresses.length} saved address(es) available
                </span>
              )}
            </div>

            {/* Saved Address Radio Cards */}
            {isAuthenticated && savedAddresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-3 border rounded-sm cursor-pointer text-xs transition-colors ${
                      selectedAddressId === addr.id
                        ? 'border-vastra-terracotta bg-vastra-terracotta-light/40'
                        : 'border-vastra-border hover:bg-vastra-surface'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => handleSelectSavedAddress(addr.id)}
                        className="mt-0.5 text-vastra-terracotta focus:ring-vastra-terracotta"
                      />
                      <div>
                        <span className="font-semibold text-vastra-charcoal block">
                          {addr.fullName} ({addr.phone})
                        </span>
                        <span className="text-vastra-muted block">
                          {addr.streetAddress}, {addr.apartment && `${addr.apartment}, `}
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}

                <label
                  className={`block p-3 border rounded-sm cursor-pointer text-xs transition-colors ${
                    selectedAddressId === 'new'
                      ? 'border-vastra-terracotta bg-vastra-terracotta-light/40'
                      : 'border-vastra-border hover:bg-vastra-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === 'new'}
                      onChange={() => handleSelectSavedAddress('new')}
                      className="text-vastra-terracotta focus:ring-vastra-terracotta"
                    />
                    <span className="font-semibold text-vastra-charcoal">
                      Deliver to a new address
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Address Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Nair"
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Street Address & House / Flat No. *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. 42, Lotus Boulevard, Green Glen Layout"
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Apartment, Suite, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="e.g. Tower B, Flat 402, Near Shivalaya"
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 560103"
                    className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Method Selection (Simulated) */}
          <div className="p-6 bg-white border border-vastra-border rounded-sm space-y-4">
            <div className="pb-2 border-b border-vastra-border/60">
              <h2 className="font-serif text-lg font-semibold text-vastra-charcoal">
                3. Payment Method
              </h2>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs inline-block mt-1">
                Notice: Test Mode Simulated Gateway Active (No Real Money Charged)
              </span>
            </div>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${
                  paymentMethod === 'SIMULATED_UPI'
                    ? 'border-vastra-terracotta bg-vastra-terracotta-light/30 ring-1 ring-vastra-terracotta'
                    : 'border-vastra-border hover:bg-vastra-surface'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'SIMULATED_UPI'}
                  onChange={() => setPaymentMethod('SIMULATED_UPI')}
                  className="mt-0.5 text-vastra-terracotta focus:ring-vastra-terracotta"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-vastra-terracotta" />
                    <span className="text-xs font-bold text-vastra-charcoal">
                      Instant UPI (Google Pay, PhonePe, Paytm, BHIM)
                    </span>
                  </div>
                  <p className="text-[11px] text-vastra-muted mt-0.5">
                    Simulates immediate one-click approval via UPI deep-link.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${
                  paymentMethod === 'SIMULATED_CARD'
                    ? 'border-vastra-terracotta bg-vastra-terracotta-light/30 ring-1 ring-vastra-terracotta'
                    : 'border-vastra-border hover:bg-vastra-surface'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'SIMULATED_CARD'}
                  onChange={() => setPaymentMethod('SIMULATED_CARD')}
                  className="mt-0.5 text-vastra-terracotta focus:ring-vastra-terracotta"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-vastra-terracotta" />
                    <span className="text-xs font-bold text-vastra-charcoal">
                      Credit / Debit Card (Visa, Mastercard, RuPay)
                    </span>
                  </div>
                  <p className="text-[11px] text-vastra-muted mt-0.5">
                    Simulates sandbox 3D Secure approval.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${
                  paymentMethod === 'SIMULATED_NET_BANKING'
                    ? 'border-vastra-terracotta bg-vastra-terracotta-light/30 ring-1 ring-vastra-terracotta'
                    : 'border-vastra-border hover:bg-vastra-surface'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'SIMULATED_NET_BANKING'}
                  onChange={() => setPaymentMethod('SIMULATED_NET_BANKING')}
                  className="mt-0.5 text-vastra-terracotta focus:ring-vastra-terracotta"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-vastra-terracotta" />
                    <span className="text-xs font-bold text-vastra-charcoal">
                      Net Banking (All Indian Major Banks)
                    </span>
                  </div>
                  <p className="text-[11px] text-vastra-muted mt-0.5">
                    HDFC, ICICI, SBI, Axis, Kotak simulated authentication.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-vastra-terracotta bg-vastra-terracotta-light/30 ring-1 ring-vastra-terracotta'
                    : 'border-vastra-border hover:bg-vastra-surface'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="mt-0.5 text-vastra-terracotta focus:ring-vastra-terracotta"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-vastra-terracotta" />
                    <span className="text-xs font-bold text-vastra-charcoal">
                      Pay on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-[11px] text-vastra-muted mt-0.5">
                    Pay safely at your doorstep upon arrival.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white border border-vastra-border rounded-sm space-y-4 sticky top-28">
            <h2 className="font-serif text-lg font-semibold text-vastra-charcoal pb-3 border-b border-vastra-border/60">
              Review Bag Items ({cart.itemCount})
            </h2>

            {/* Line items mini list */}
            <div className="max-h-64 overflow-y-auto divide-y divide-vastra-border/40 pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.primaryImage}
                      alt={item.productName}
                      className="w-10 h-12 object-cover rounded-xs border border-vastra-border/40 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-vastra-charcoal line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-vastra-muted">
                        Qty: {item.quantity} × {item.size} ({item.colour})
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-vastra-charcoal">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-3 border-t border-vastra-border/60 text-xs text-vastra-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-vastra-charcoal">{formatPrice(cart.subtotal)}</span>
              </div>

              {cart.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon ({cart.appliedCoupon?.code})</span>
                  <span>-{formatPrice(cart.discountTotal)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-vastra-charcoal">
                  {cart.shippingTotal === 0 ? (
                    <span className="text-vastra-olive font-semibold">Complimentary Free</span>
                  ) : (
                    formatPrice(cart.shippingTotal)
                  )}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-vastra-border text-base font-bold text-vastra-charcoal">
                <span>Grand Total</span>
                <span className="font-serif text-lg text-vastra-charcoal">
                  {formatPrice(cart.grandTotal)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full shadow-sm"
              isLoading={isSubmitting}
            >
              <span>Place Order ({formatPrice(cart.grandTotal)})</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-vastra-muted">
              <ShieldCheck className="w-4 h-4 text-vastra-olive" />
              <span>Concurrently Protected Transactional Verification</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
