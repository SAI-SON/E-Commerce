import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardStats } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get<{ data: DashboardStats }>('/admin/dashboard');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-stone-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-stone-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        Failed to load dashboard metrics. Ensure you have administrator privileges.
      </div>
    );
  }

  const statCards = [
    {
      label: 'Gross Store Sales',
      value: `₹${(stats.totalSales || 0).toLocaleString('en-IN')}`,
      subtext: 'Paid & confirmed orders',
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders || 0,
      subtext: `${stats.pendingOrders || 0} awaiting fulfillment`,
      icon: ShoppingBag,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Completed Orders',
      value: stats.completedOrders || 0,
      subtext: 'Successfully delivered',
      icon: CheckCircle2,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      label: 'Customer Accounts',
      value: stats.totalCustomers || 0,
      subtext: 'Registered buyers',
      icon: Users,
      color: 'text-stone-700 bg-stone-100 border-stone-200',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">Store Performance Overview</h1>
        <p className="text-xs text-stone-500 mt-1">
          Real-time metrics calculated directly from PostgreSQL orders, inventory movements, and customers.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-serif font-bold text-stone-900 mt-1">{card.value}</p>
                <p className="text-xs text-stone-400 mt-1">{card.subtext}</p>
              </div>
              <div className={`p-3 rounded-lg border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {stats.lowStockVariants && stats.lowStockVariants.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Stock Alerts ({stats.lowStockVariants.length} variants below threshold)</span>
            </div>
            <Link
              to="/admin/inventory"
              className="text-xs font-medium text-amber-900 hover:underline flex items-center gap-1"
            >
              Manage Inventory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockVariants.slice(0, 6).map((variant) => (
              <div
                key={variant.id}
                className="bg-white p-3 rounded-lg border border-amber-200/60 text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-stone-900 line-clamp-1">{variant.productName}</p>
                  <p className="text-stone-500 text-[11px]">
                    Size: {variant.size} • Colour: {variant.colour} • SKU: {variant.sku}
                  </p>
                </div>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-xs ml-2">
                  {variant.stockQuantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two column: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders - 2 Columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <h2 className="font-serif text-base font-bold text-stone-900">Recent Customer Orders</h2>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Order #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.slice(0, 7).map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                        <Link to={`/admin/orders`} className="hover:text-amber-700 hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-stone-900">
                          {order.shippingAddressSnapshot?.fullName || 'Customer'}
                        </p>
                        <p className="text-[11px] text-stone-400">{order.customerEmail}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            order.status === 'DELIVERED'
                              ? 'success'
                              : order.status === 'CANCELLED'
                              ? 'danger'
                              : order.status === 'CONFIRMED' || order.status === 'SHIPPED'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        ₹{Number(order.grandTotal).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 text-right">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products - 1 Column */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="font-serif text-base font-bold text-stone-900">Top Performing Products</h2>
          </div>

          <div className="space-y-4">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-stone-900 line-clamp-1">{p.name}</p>
                      <p className="text-[11px] text-stone-400">{p.totalSold} units purchased</p>
                    </div>
                  </div>
                  <span className="font-semibold text-stone-900">
                    ₹{Number(p.revenue).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 text-center py-6">
                Sufficient sales volume required for leaderboards.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
