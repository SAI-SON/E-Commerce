import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Check,
  Search,
  X,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Product, ProductVariant } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';

interface InventoryMovement {
  id: string;
  variantId: string;
  changeQuantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
  variant: {
    sku: string;
    size: string;
    colour: string;
    product: {
      name: string;
      slug: string;
    };
  };
}

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'variants' | 'history'>('variants');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Selected variant for adjustment modal
  const [selectedVariant, setSelectedVariant] = useState<{
    id: string;
    productName: string;
    sku: string;
    size: string;
    colour: string;
    currentStock: number;
  } | null>(null);

  const [adjustmentInput, setAdjustmentInput] = useState<number>(5);
  const [reasonInput, setReasonInput] = useState<string>('RESTOCK_SHIPMENT');
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch products and their variants
  const { data: productsData, isLoading: isLoadingProducts } = useQuery<{
    products: Product[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>({
    queryKey: ['admin-products-inventory', page, search],
    queryFn: async () => {
      const res = await api.get<{ data: Product[]; pagination: any }>('/admin/products', {
        page,
        limit: 20,
        search: search || undefined,
      });
      return {
        products: res.data,
        pagination: res.pagination || { total: res.data.length, page: 1, limit: 20, totalPages: 1 },
      };
    },
    enabled: activeTab === 'variants',
  });

  // Fetch movements history
  const { data: movementsData, isLoading: isLoadingMovements } = useQuery<{
    movements: InventoryMovement[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>({
    queryKey: ['admin-inventory-movements', page],
    queryFn: async () => {
      const res = await api.get<{ data: InventoryMovement[]; pagination: any }>('/admin/inventory/movements', {
        page,
        limit: 25,
      });
      return {
        movements: res.data,
        pagination: res.pagination || { total: res.data.length, page: 1, limit: 25, totalPages: 1 },
      };
    },
    enabled: activeTab === 'history',
  });

  // Stock adjust mutation
  const adjustMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariant) return;
      setModalError(null);
      await api.patch(`/admin/variants/${selectedVariant.id}/stock`, {
        adjustment: Number(adjustmentInput),
        reason: reasonInput.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setSelectedVariant(null);
      setAdjustmentInput(5);
      setReasonInput('RESTOCK_SHIPMENT');
    },
    onError: (err: any) => {
      setModalError(err.message || 'Failed to adjust stock. Negative inventory is disallowed.');
    },
  });

  const handleOpenModal = (v: ProductVariant, productName: string) => {
    setSelectedVariant({
      id: v.id,
      productName,
      sku: v.sku,
      size: v.size,
      colour: v.colour,
      currentStock: v.stockQuantity,
    });
    setAdjustmentInput(5);
    setReasonInput('RESTOCK_SHIPMENT');
    setModalError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Inventory & Stock Audit
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time variant tracking with ACID concurrency controls and auditable movement history.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex p-1 bg-stone-200 rounded-lg text-xs font-medium">
          <button
            onClick={() => {
              setActiveTab('variants');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'variants'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stock Levels</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Movement Audit Log</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Variant Stock Levels */}
      {activeTab === 'variants' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by product name..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
            <span className="text-xs text-stone-500">
              {productsData?.products.length || 0} products listed
            </span>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            {isLoadingProducts ? (
              <div className="p-8 text-center text-xs text-stone-400">Loading variant inventory...</div>
            ) : !productsData?.products || productsData.products.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs">No products found.</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {productsData.products.map((product) => (
                  <div key={product.id} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-sm font-bold text-stone-900">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-stone-400">
                          Category: {product.category?.name} • /{product.slug}
                        </p>
                      </div>
                      <Badge variant={product.isPublished ? 'success' : 'default'}>
                        {product.isPublished ? 'Published' : 'Archived'}
                      </Badge>
                    </div>

                    {/* Variants Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {product.variants?.map((v) => {
                        const isLow = v.stockQuantity <= 5;
                        const isOut = v.stockQuantity === 0;

                        return (
                          <div
                            key={v.id}
                            className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                              isOut
                                ? 'bg-red-50/60 border-red-200'
                                : isLow
                                ? 'bg-amber-50/60 border-amber-200'
                                : 'bg-stone-50 border-stone-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-stone-900">{v.sku}</span>
                                {isOut ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                    Out of Stock
                                  </span>
                                ) : isLow ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                    Low Stock
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-stone-600 mt-1">
                                Size: <span className="font-semibold">{v.size}</span> • Colour:{' '}
                                <span className="font-semibold">{v.colour}</span>
                              </p>
                              <p className="text-stone-500 text-[11px] mt-0.5">
                                Price: ₹{Number(v.price).toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                              <span className="text-sm font-bold text-stone-900">
                                {v.stockQuantity} <span className="text-xs font-normal text-stone-500">units</span>
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenModal(v, product.name)}
                                className="text-[11px] h-7 px-2 py-0 border-stone-300 hover:border-amber-600 hover:text-amber-800"
                              >
                                Adjust Stock
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Movement Audit Log */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          {isLoadingMovements ? (
            <div className="p-8 text-center text-xs text-stone-400">Loading movement audit log...</div>
          ) : !movementsData?.movements || movementsData.movements.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              No inventory movements recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Item & SKU</th>
                    <th className="py-3 px-4 font-semibold">Previous</th>
                    <th className="py-3 px-4 font-semibold">Change</th>
                    <th className="py-3 px-4 font-semibold">New Stock</th>
                    <th className="py-3 px-4 font-semibold">Audit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {movementsData.movements.map((m) => {
                    const isPositive = m.changeQuantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-stone-900">
                            {m.variant?.product?.name || 'Product'}
                          </p>
                          <p className="text-[11px] font-mono text-stone-400">
                            SKU: {m.variant?.sku} ({m.variant?.size} / {m.variant?.colour})
                          </p>
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-mono">{m.previousStock}</td>
                        <td className="py-3 px-4 font-bold font-mono">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPositive ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {isPositive ? `+${m.changeQuantity}` : m.changeQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-900 font-bold font-mono">
                          {m.newStock}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                            {m.reason}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {movementsData && movementsData.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Page {movementsData.pagination.page} of {movementsData.pagination.totalPages}
              </span>
              <Pagination
                currentPage={movementsData.pagination.page}
                totalPages={movementsData.pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Adjust Inventory Level
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  {selectedVariant.sku} • {selectedVariant.size} • {selectedVariant.colour}
                </p>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Product:</span>
                <span className="font-medium text-stone-900">{selectedVariant.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Current Authoritative Stock:</span>
                <span className="font-bold text-stone-900">{selectedVariant.currentStock} units</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-1 mt-1 font-semibold">
                <span className="text-stone-700">Projected New Stock:</span>
                <span
                  className={
                    selectedVariant.currentStock + Number(adjustmentInput) < 0
                      ? 'text-red-600'
                      : 'text-amber-700'
                  }
                >
                  {selectedVariant.currentStock + Number(adjustmentInput)} units
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Adjustment Units (positive to restock, negative to reduce)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentInput((prev) => prev - 1)}
                    className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustmentInput}
                    onChange={(e) => setAdjustmentInput(Number(e.target.value))}
                    className="flex-1 px-3 py-2 text-center text-sm font-bold border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustmentInput((prev) => prev + 1)}
                    className="p-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mandatory Audit Reason *
                </label>
                <input
                  type="text"
                  required
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. RESTOCK_SHIPMENT_VARA_02 or DAMAGED_GOODS"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVariant(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={
                  adjustMutation.isPending ||
                  !reasonInput.trim() ||
                  selectedVariant.currentStock + Number(adjustmentInput) < 0
                }
                onClick={() => adjustMutation.mutate()}
                className="gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{adjustMutation.isPending ? 'Logging Audit...' : 'Confirm Adjustment'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InventoryPage;
