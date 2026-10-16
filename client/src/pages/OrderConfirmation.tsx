import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, Printer, ArrowRight } from 'lucide-react';
import { Order } from '../types/index.js';
import { api } from '../lib/api.js';
import { formatPrice, formatDate } from '../lib/utils.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';

export const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setIsLoading(true);
        const res = await api.get<{ data: Order }>(`/orders/${orderNumber}`);
        setOrder(res.data);
      } catch (err: unknown) {
        setErrorMessage((err as Error).message || 'Failed to load order confirmation');
      } finally {
        setIsLoading(false);
      }
    }

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vastra-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-vastra-charcoal mb-4">
          Order Confirmation Unavailable
        </h2>
        <p className="text-sm text-vastra-muted mb-6">{errorMessage || 'Order not found.'}</p>
        <Link to="/">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    );
  }

  const shippingAddr = order.shippingAddressSnapshot;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Celebration Banner */}
      <div className="p-8 bg-white border border-vastra-border rounded-sm text-center space-y-4 mb-8 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-widest text-vastra-terracotta">
          Thank you for patronizing authentic Indian craft
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-vastra-charcoal">
          Your Order is Confirmed
        </h1>

        <p className="text-xs sm:text-sm text-vastra-muted max-w-lg mx-auto">
          We have received your order{' '}
          <strong className="text-vastra-charcoal font-mono">{order.orderNumber}</strong>. A receipt
          and tracking updates have been sent to{' '}
          <strong className="text-vastra-charcoal">{order.customerEmail}</strong>.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-vastra-border rounded-sm hover:border-vastra-charcoal transition-colors"
          >
            <Printer className="w-4 h-4 text-vastra-muted" />
            <span>Print Receipt</span>
          </button>
          <Link to="/products">
            <Button size="sm">
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Verified Order Receipt Details */}
      <div className="bg-white border border-vastra-border rounded-sm divide-y divide-vastra-border/60">
        {/* Receipt Header */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-vastra-muted block">Order Number</span>
            <span className="font-mono font-bold text-vastra-charcoal text-sm">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-vastra-muted block">Date Placed</span>
            <span className="font-medium text-vastra-charcoal">{formatDate(order.createdAt)}</span>
          </div>
          <div>
            <span className="text-vastra-muted block">Status</span>
            <Badge variant="success" className="mt-1">
              {order.status}
            </Badge>
          </div>
          <div>
            <span className="text-vastra-muted block">Payment Method</span>
            <span className="font-medium text-vastra-charcoal">
              {order.payment?.paymentMethod || 'Simulated'}
            </span>
          </div>
        </div>

        {/* Shipment Info */}
        {order.shipment && (
          <div className="p-6 bg-vastra-surface/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-vastra-olive-light text-vastra-olive flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-vastra-charcoal block">
                  Carrier: {order.shipment.carrier}
                </span>
                <span className="text-vastra-muted">
                  Tracking Code: <strong className="font-mono">{order.shipment.trackingNumber}</strong>
                </span>
              </div>
            </div>
            <Badge variant="info">{order.shipment.status}</Badge>
          </div>
        )}

        {/* Itemized Order Lines */}
        <div className="p-6 space-y-4">
          <h3 className="font-serif text-sm font-semibold text-vastra-charcoal uppercase tracking-wider">
            Purchased Creations
          </h3>

          <div className="divide-y divide-vastra-border/40">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-vastra-charcoal">{item.productName}</h4>
                  <p className="text-vastra-muted">
                    Size: <strong>{item.size}</strong> • Colour: <strong>{item.colour}</strong> • Qty: <strong>{item.quantity}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-vastra-light">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-vastra-charcoal block">
                    {formatPrice(item.subtotal)}
                  </span>
                  <span className="text-[11px] text-vastra-muted">
                    ({formatPrice(item.unitPrice)} each)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Pricing Breakdown */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div>
            <h4 className="font-semibold text-vastra-charcoal uppercase tracking-wider mb-2">
              Delivery Destination
            </h4>
            <div className="text-vastra-muted space-y-1">
              <p className="font-semibold text-vastra-charcoal">{shippingAddr.fullName}</p>
              <p>{shippingAddr.streetAddress}</p>
              {shippingAddr.apartment && <p>{shippingAddr.apartment}</p>}
              <p>
                {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postalCode}
              </p>
              <p>{shippingAddr.country}</p>
              <p className="pt-1">Phone: {shippingAddr.phone}</p>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <h4 className="font-semibold text-vastra-charcoal uppercase tracking-wider mb-2 text-right">
              Payment Summary
            </h4>
            <div className="flex justify-between text-vastra-muted">
              <span>Subtotal</span>
              <span className="font-medium text-vastra-charcoal">{formatPrice(order.subtotal)}</span>
            </div>

            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount ({order.couponCode})</span>
                <span>-{formatPrice(order.discountTotal)}</span>
              </div>
            )}

            <div className="flex justify-between text-vastra-muted">
              <span>Shipping Charges</span>
              <span className="font-medium text-vastra-charcoal">
                {Number(order.shippingTotal) === 0 ? 'Complimentary' : formatPrice(order.shippingTotal)}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-vastra-border text-sm font-bold text-vastra-charcoal">
              <span>Amount Paid</span>
              <span className="font-serif text-base text-vastra-charcoal">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
