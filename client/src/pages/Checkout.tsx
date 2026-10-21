import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
  QrCode,
  Shield,
} from 'lucide-react';
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
    'ONLINE_GATEWAY' | 'SIMULATED_UPI' | 'SIMULATED_CARD' | 'SIMULATED_NET_BANKING' | 'CASH_ON_DELIVERY'
  >('ONLINE_GATEWAY');

  // Interactive Payment Gateway Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [gatewaySubMethod, setGatewaySubMethod] = useState<'upi' | 'card' | 'qr'>('upi');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [testUpiId, setTestUpiId] = useState('patron@oksbi');
  const [testCardNumber, setTestCardNumber] = useState('4532 •••• •••• 8892');

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
        .catch(() => { });
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

  const executePlaceOrder = async (chosenMethod: string) => {
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
        paymentMethod: chosenMethod,
      };

      const res = await api.post<{ data: Order }>('/orders', orderPayload);

      // Refresh cart state to 0 after purchase
      await fetchCart();

      // Navigate to verified Order Confirmation route
      navigate(`/order-confirmation/${res.data.orderNumber}`);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to place order. Please review your details.');
      setIsPaymentModalOpen(false);
      setPaymentProcessing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check mandatory address fields
    if (!fullName.trim() || !phone.trim() || !streetAddress.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setErrorMessage('Please complete all mandatory shipping address fields.');
      return;
    }

    if (paymentMethod === 'ONLINE_GATEWAY') {
      // Launch interactive payment modal
      setIsPaymentModalOpen(true);
      setPaymentProcessing(false);
      setPaymentSuccess(false);
    } else {
      await executePlaceOrder(paymentMethod);
    }
  };

  const handleAuthorizeGatewayPayment = async () => {
    setPaymentProcessing(true);
    // Simulate real gateway latency & 3D secure verification
    setTimeout(async () => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setTimeout(async () => {
        await executePlaceOrder('ONLINE_GATEWAY');
      }, 700);
    }, 1200);
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
                    className={`block p-3 border rounded-sm cursor-pointer text-xs transition-colors ${selectedAddressId === addr.id
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
                  className={`block p-3 border rounded-sm cursor-pointer text-xs transition-colors ${selectedAddressId === 'new'
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
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'ONLINE_GATEWAY'
                    ? 'border-vastra-terracotta bg-vastra-terracotta-light/30 ring-1 ring-vastra-terracotta'
                    : 'border-vastra-border hover:bg-vastra-surface'
                  }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE_GATEWAY'}
                  onChange={() => setPaymentMethod('ONLINE_GATEWAY')}
                  className="mt-0.5 text-vastra-terracotta focus:ring-vastra-terracotta"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-vastra-terracotta" />
                    <span className="text-xs font-bold text-vastra-charcoal">
                      Online Payment Gateway (Razorpay / Cards / UPI / NetBanking)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Instant & Fast
                    </span>
                  </div>
                  <p className="text-[11px] text-vastra-muted mt-0.5">
                    Pay securely using Google Pay, PhonePe, Paytm, Visa, Mastercard, RuPay, or Net Banking.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'SIMULATED_UPI'
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
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'SIMULATED_CARD'
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
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'SIMULATED_NET_BANKING'
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
                className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'CASH_ON_DELIVERY'
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

      {/* Interactive Online Payment Gateway Modal */}
      {isPaymentModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !paymentProcessing && setIsPaymentModalOpen(false)}
        >
          <div
            className="bg-white border border-vastra-border max-w-md w-full rounded-sm shadow-2xl relative overflow-hidden text-vastra-charcoal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-vastra-surface px-6 py-4 border-b border-vastra-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-vastra-terracotta text-white flex items-center justify-center text-xs font-serif font-bold">
                  V
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-vastra-charcoal">
                    Vastra Payment Gateway
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                    <Shield className="w-3 h-3" />
                    <span>256-Bit SSL Encrypted & PCI-DSS Compliant</span>
                  </div>
                </div>
              </div>

              {!paymentProcessing && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1 text-vastra-muted hover:text-vastra-charcoal rounded-sm"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Amount Banner */}
            <div className="px-6 py-3 bg-vastra-bg border-b border-vastra-border/60 flex items-center justify-between">
              <span className="text-xs text-vastra-muted">Total Payable Amount</span>
              <span className="font-serif text-lg font-bold text-vastra-charcoal">
                {formatPrice(cart.grandTotal)}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {paymentProcessing ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-vastra-terracotta border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="font-serif text-sm font-semibold text-vastra-charcoal">
                    Connecting to Payment Gateway...
                  </h4>
                  <p className="text-xs text-vastra-muted max-w-xs mx-auto">
                    Securely communicating with bank server & verifying 3D Secure / UPI mandate.
                  </p>
                </div>
              ) : paymentSuccess ? (
                <div className="py-10 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="font-serif text-base font-bold text-vastra-charcoal">
                    Payment Authorized Successfully!
                  </h4>
                  <p className="text-xs text-vastra-muted">
                    Finalizing your order and generating verified invoice...
                  </p>
                </div>
              ) : (
                <>
                  {/* Gateway Method Selector */}
                  <div className="grid grid-cols-3 gap-2 border-b border-vastra-border pb-3">
                    <button
                      type="button"
                      onClick={() => setGatewaySubMethod('upi')}
                      className={`py-2 text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${gatewaySubMethod === 'upi'
                          ? 'bg-vastra-terracotta text-white'
                          : 'bg-vastra-surface text-vastra-charcoal hover:bg-stone-100'
                        }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGatewaySubMethod('card')}
                      className={`py-2 text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${gatewaySubMethod === 'card'
                          ? 'bg-vastra-terracotta text-white'
                          : 'bg-vastra-surface text-vastra-charcoal hover:bg-stone-100'
                        }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGatewaySubMethod('qr')}
                      className={`py-2 text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 ${gatewaySubMethod === 'qr'
                          ? 'bg-vastra-terracotta text-white'
                          : 'bg-vastra-surface text-vastra-charcoal hover:bg-stone-100'
                        }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan QR</span>
                    </button>
                  </div>

                  {/* UPI Form */}
                  {gatewaySubMethod === 'upi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                          Enter UPI ID / VPA
                        </label>
                        <input
                          type="text"
                          value={testUpiId}
                          onChange={(e) => setTestUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi"
                          className="w-full px-3 py-2 text-xs border border-vastra-border rounded-xs bg-vastra-surface focus:outline-none focus:border-vastra-terracotta"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['@okaxis', '@okhdfcbank', '@oksbi', '@paytm'].map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => setTestUpiId(`patron${handle}`)}
                            className="text-[10px] px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-xs text-vastra-charcoal transition-colors"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-vastra-muted">
                        Supported: Google Pay, PhonePe, Paytm, CRED, BHIM.
                      </p>
                    </div>
                  )}

                  {/* Card Form */}
                  {gatewaySubMethod === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={testCardNumber}
                          onChange={(e) => setTestCardNumber(e.target.value)}
                          placeholder="4532 •••• •••• 8892"
                          className="w-full px-3 py-2 text-xs border border-vastra-border rounded-xs bg-vastra-surface focus:outline-none focus:border-vastra-terracotta"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                            Expiry
                          </label>
                          <input
                            type="text"
                            defaultValue="12/28"
                            className="w-full px-3 py-2 text-xs border border-vastra-border rounded-xs bg-vastra-surface"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            defaultValue="849"
                            maxLength={4}
                            className="w-full px-3 py-2 text-xs border border-vastra-border rounded-xs bg-vastra-surface"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QR Scan Form */}
                  {gatewaySubMethod === 'qr' && (
                    <div className="text-center space-y-2 py-2">
                      <div className="w-36 h-36 mx-auto bg-stone-50 border-2 border-dashed border-vastra-border rounded-sm flex flex-col items-center justify-center p-3">
                        <QrCode className="w-20 h-20 text-vastra-charcoal" />
                        <span className="text-[10px] text-vastra-muted mt-1">BHIM UPI QR</span>
                      </div>
                      <p className="text-xs text-vastra-muted">
                        Scan with any UPI app on your phone to approve {formatPrice(cart.grandTotal)}
                      </p>
                    </div>
                  )}

                  {/* Authorize Button */}
                  <button
                    type="button"
                    onClick={handleAuthorizeGatewayPayment}
                    className="w-full py-3 bg-vastra-charcoal text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-vastra-terracotta transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize & Pay {formatPrice(cart.grandTotal)}</span>
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-vastra-muted pt-1">
                    <span>Zero Transaction Fee</span>
                    <span>•</span>
                    <span>Instant Refund Protected</span>
                    <span>•</span>
                    <span>RBI Compliant</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
