import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  Search,
  Filter,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Selected order for status update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Selected order for full view drawer/modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const { data, isLoading, error } = useQuery<{
    orders: Order[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>({
    queryKey: ['admin-orders', page, statusFilter, search],
    queryFn: async () => {
      const res = await api.get<{ data: Order[]; pagination: any }>('/admin/orders', {
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      return {
        orders: res.data,
        pagination: res.pagination || { total: res.data.length, page: 1, limit: 15, totalPages: 1 },
      };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder || !newStatus) return;
      setModalError(null);
      await api.patch(`/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setSelectedOrder(null);
      setNewStatus('');
      setNotes('');
    },
    onError: (err: any) => {
      setModalError(err.message || 'Failed to update order status.');
    },
  });

  const handleOpenStatusModal = (order: Order) => {
    setSelectedOrder(order);
    const permitted = VALID_TRANSITIONS[order.status as OrderStatus] || [];
    setNewStatus(permitted[0] || '');
    setNotes('');
    setModalError(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">Customer Orders</h1>
        <p className="text-xs text-stone-500 mt-1">
          Review placed orders, inspect immutable item snapshots, and execute compliant state transitions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order #, email, or customer name..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-hidden focus:border-amber-600"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-stone-400">Loading orders...</div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-600">Failed to load orders.</div>
        ) : !data?.orders || data.orders.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <ShoppingBag className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-medium text-stone-600">No matching orders</p>
            <p className="text-xs mt-1">Try resetting filters or searching with another term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Order Number</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Items</th>
                  <th className="py-3 px-4 font-semibold">Total Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.orders.map((order) => {
                  const permitted = VALID_TRANSITIONS[order.status as OrderStatus] || [];
                  const hasPermittedTransitions = permitted.length > 0;

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="font-mono font-bold text-stone-900 hover:text-amber-700 hover:underline flex items-center gap-1.5"
                        >
                          <span>{order.orderNumber}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </button>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-stone-900">
                          {order.shippingAddressSnapshot?.fullName || 'Customer'}
                        </p>
                        <p className="text-[11px] text-stone-400">{order.customerEmail}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-stone-700 line-clamp-1">
                          {order.items?.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {order.items?.length || 0} unique line item(s)
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900 font-mono">
                        ₹{Number(order.grandTotal).toLocaleString('en-IN')}
                        {order.couponCode && (
                          <span className="block text-[10px] text-emerald-700 font-normal">
                            Code: {order.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            order.status === 'DELIVERED'
                              ? 'success'
                              : order.status === 'CANCELLED' || order.status === 'REFUNDED'
                              ? 'danger'
                              : order.status === 'CONFIRMED' || order.status === 'SHIPPED'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingOrder(order)}
                            className="text-[11px] h-7 px-2"
                          >
                            Details
                          </Button>

                          {hasPermittedTransitions && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenStatusModal(order)}
                              className="text-[11px] h-7 px-2"
                            >
                              Update Status
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* State Machine Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Update Order Status
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  {selectedOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Current Status:</span>
                <span className="font-bold text-stone-900">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Payable:</span>
                <span className="font-semibold text-stone-900">
                  ₹{Number(selectedOrder.grandTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Permitted Next Transition *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-white focus:outline-hidden focus:border-amber-600 font-medium"
              >
                {(VALID_TRANSITIONS[selectedOrder.status as OrderStatus] || []).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-stone-400 mt-1">
                Transitions are governed by strict business rules. If cancelling, inventory is restored automatically.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Status Notes / Tracking Details
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dispatched via BlueDart AWB# 88472910..."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={updateStatusMutation.isPending || !newStatus}
                onClick={() => updateStatusMutation.mutate()}
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Execute Transition'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Drawer / Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Order Breakdown: {viewingOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-500">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery & Customer Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl">
              <div>
                <p className="font-bold text-stone-800 uppercase tracking-wider text-[10px] mb-1">
                  Customer Information
                </p>
                <p className="font-semibold text-stone-900">
                  {viewingOrder.shippingAddressSnapshot?.fullName}
                </p>
                <p className="text-stone-600">{viewingOrder.customerEmail}</p>
                <p className="text-stone-600">{viewingOrder.customerPhone}</p>
              </div>

              <div>
                <p className="font-bold text-stone-800 uppercase tracking-wider text-[10px] mb-1">
                  Shipping Destination
                </p>
                <p className="text-stone-700">
                  {viewingOrder.shippingAddressSnapshot?.streetAddress}
                  {viewingOrder.shippingAddressSnapshot?.apartment &&
                    `, ${viewingOrder.shippingAddressSnapshot?.apartment}`}
                </p>
                <p className="text-stone-700">
                  {viewingOrder.shippingAddressSnapshot?.city},{' '}
                  {viewingOrder.shippingAddressSnapshot?.state} -{' '}
                  {viewingOrder.shippingAddressSnapshot?.postalCode}
                </p>
                <p className="text-stone-700">{viewingOrder.shippingAddressSnapshot?.country}</p>
              </div>
            </div>

            {/* Items Table Snapshot */}
            <div>
              <h4 className="font-serif text-sm font-bold text-stone-900 mb-2">
                Purchased Line Items
              </h4>
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {viewingOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-medium text-stone-900">
                          {item.productName}
                          <span className="block text-[11px] text-stone-500">
                            Size: {item.size} • Colour: {item.colour}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-500">{item.sku}</td>
                        <td className="py-2.5 px-3">
                          ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-bold">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-stone-900">
                          ₹{Number(item.subtotal).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>₹{Number(viewingOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(viewingOrder.discountTotal) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({viewingOrder.couponCode}):</span>
                    <span>-₹{Number(viewingOrder.discountTotal).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping:</span>
                  <span>
                    {Number(viewingOrder.shippingTotal) === 0
                      ? 'FREE'
                      : `₹${Number(viewingOrder.shippingTotal).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between font-serif text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
                  <span>Grand Total:</span>
                  <span>₹{Number(viewingOrder.grandTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingOrder(null)}
              >
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrdersPage;
