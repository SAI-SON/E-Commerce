import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Truck } from 'lucide-react';
import { Order } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { formatPrice, formatDate } from '../../lib/utils.js';
import { Badge } from '../../components/common/Badge.js';
import { EmptyState } from '../../components/common/EmptyState.js';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        const res = await api.get<{ data: Order[] }>('/orders');
        setOrders(res.data);
      } catch (err: unknown) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'success';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'info';
      case 'PENDING_PAYMENT':
        return 'warning';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-white border border-vastra-border rounded-sm p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-vastra-border/60">
        <h2 className="font-serif text-xl font-semibold text-vastra-charcoal">Your Order History</h2>
        <p className="text-xs text-vastra-muted mt-0.5">
          Track packages, review item details, and download purchase receipts
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-vastra-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-10 h-10 text-vastra-muted" />}
          title="No Orders Found"
          description="You have not placed any orders with us yet. Our artisanal pieces are woven and ready for you."
          actionText="Browse Collection"
          onAction={() => window.location.assign('/products')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-vastra-border rounded-sm overflow-hidden hover:border-vastra-charcoal/40 transition-colors"
            >
              {/* Header */}
              <div className="p-4 bg-vastra-surface/60 border-b border-vastra-border/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-vastra-muted block">Order ID</span>
                    <span className="font-mono font-bold text-vastra-charcoal text-xs">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-vastra-muted block">Date</span>
                    <span className="text-vastra-charcoal font-medium">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-vastra-muted block">Total</span>
                    <span className="text-vastra-charcoal font-semibold">
                      {formatPrice(order.grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                  <Link
                    to={`/account/orders/${order.orderNumber}`}
                    className="inline-flex items-center gap-1 font-semibold text-vastra-terracotta hover:underline"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items Preview */}
              <div className="p-4 divide-y divide-vastra-border/40">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-vastra-charcoal">{item.productName}</h4>
                      <p className="text-vastra-muted">
                        Qty: {item.quantity} • Size: {item.size} • Colour: {item.colour}
                      </p>
                    </div>
                    <span className="font-medium text-vastra-charcoal">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Carrier status footer if shipped */}
              {order.shipment && (
                <div className="px-4 py-2 bg-stone-50 border-t border-vastra-border/40 text-[11px] text-vastra-muted flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-vastra-olive" />
                  <span>
                    Carrier: {order.shipment.carrier} • Tracking:{' '}
                    <strong className="font-mono text-vastra-charcoal">
                      {order.shipment.trackingNumber}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
