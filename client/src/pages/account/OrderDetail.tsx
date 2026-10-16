import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Printer } from 'lucide-react';
import { Order } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { formatPrice, formatDate } from '../../lib/utils.js';
import { Badge } from '../../components/common/Badge.js';
import { Button } from '../../components/common/Button.js';

export const OrderDetail: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ data: Order }>(`/orders/${orderNumber}`);
      setOrder(res.data);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (
      !window.confirm(
        `Are you sure you wish to cancel order ${order.orderNumber}? The items will be returned to stock.`
      )
    ) {
      return;
    }

    try {
      setIsCancelling(true);
      setErrorMessage(null);
      await api.post(`/orders/${order.orderNumber}/cancel`);
      setCancelSuccessMessage('Order has been cancelled and inventory restored.');
      await fetchOrder();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center bg-white border border-vastra-border rounded-sm">
        <div className="w-6 h-6 border-2 border-vastra-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMessage && !order) {
    return (
      <div className="bg-white border border-vastra-border rounded-sm p-8 text-center space-y-4">
        <h3 className="font-serif text-lg font-semibold text-vastra-charcoal">
          Unable to Load Order
        </h3>
        <p className="text-xs text-vastra-muted">{errorMessage}</p>
        <Link to="/account/orders">
          <Button variant="outline" size="sm">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const shippingAddr = order.shippingAddressSnapshot;
  const canCancel = order.status === 'PENDING_PAYMENT' || order.status === 'CONFIRMED';

  return (
    <div className="bg-white border border-vastra-border rounded-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vastra-border/60">
        <div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs text-vastra-muted hover:text-vastra-charcoal font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders List</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-vastra-charcoal">
              Order {order.orderNumber}
            </h2>
            <Badge variant="success">{order.status}</Badge>
          </div>
          <p className="text-xs text-vastra-muted mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-vastra-border hover:border-vastra-charcoal text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-vastra-muted" />
            <span>Print</span>
          </button>

          {canCancel && (
            <Button
              onClick={handleCancelOrder}
              variant="danger"
              size="sm"
              isLoading={isCancelling}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {cancelSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm">
          {cancelSuccessMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {errorMessage}
        </div>
      )}

      {/* Shipment details if available */}
      {order.shipment && (
        <div className="p-4 bg-vastra-surface/50 border border-vastra-border/60 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-vastra-olive-light text-vastra-olive flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-vastra-charcoal">
                Logistics Carrier: {order.shipment.carrier}
              </p>
              <p className="text-vastra-muted">
                Tracking Code: <strong className="font-mono">{order.shipment.trackingNumber}</strong>
              </p>
            </div>
          </div>
          <Badge variant="info">{order.shipment.status}</Badge>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        <h3 className="font-serif text-sm font-semibold text-vastra-charcoal uppercase tracking-wider">
          Ordered Creations
        </h3>
        <div className="border border-vastra-border rounded-sm divide-y divide-vastra-border/60">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <h4 className="font-semibold text-vastra-charcoal text-sm">{item.productName}</h4>
                <div className="text-vastra-muted">
                  Size: <strong>{item.size}</strong> • Colour: <strong>{item.colour}</strong> • Qty:{' '}
                  <strong>{item.quantity}</strong>
                </div>
                <div className="text-[11px] font-mono text-vastra-light">SKU: {item.sku}</div>
              </div>
              <div className="text-right">
                <span className="font-semibold text-sm text-vastra-charcoal block">
                  {formatPrice(item.subtotal)}
                </span>
                <span className="text-[11px] text-vastra-muted">({formatPrice(item.unitPrice)} each)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Payment Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        <div className="p-4 border border-vastra-border rounded-sm space-y-2 text-xs">
          <h4 className="font-semibold text-vastra-charcoal uppercase tracking-wider">
            Delivery Destination
          </h4>
          <div className="text-vastra-muted space-y-0.5">
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

        <div className="p-4 border border-vastra-border rounded-sm space-y-2 text-xs">
          <h4 className="font-semibold text-vastra-charcoal uppercase tracking-wider">
            Payment & Breakdown
          </h4>
          <div className="space-y-1 text-vastra-muted">
            <div className="flex justify-between">
              <span>Payment Provider:</span>
              <span className="font-medium text-vastra-charcoal">
                {order.payment?.provider || 'SIMULATED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono text-vastra-charcoal text-[11px]">
                {order.payment?.transactionId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium text-vastra-charcoal">{formatPrice(order.subtotal)}</span>
            </div>
            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon ({order.couponCode}):</span>
                <span>-{formatPrice(order.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Charges:</span>
              <span className="font-medium text-vastra-charcoal">
                {Number(order.shippingTotal) === 0 ? 'Free' : formatPrice(order.shippingTotal)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-vastra-border text-sm font-bold text-vastra-charcoal">
              <span>Grand Total:</span>
              <span className="font-serif">{formatPrice(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
