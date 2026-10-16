import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Ticket,
  Plus,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Coupon } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const CouponsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<string>('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');

  const { data: coupons, isLoading, error } = useQuery<Coupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get<{ data: Coupon[] }>('/coupons');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      setModalError(null);
      await api.post('/admin/coupons', {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setModalError(err.message || 'Failed to create promotional coupon.');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.patch(`/admin/coupons/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setMinPurchaseAmount('');
    setMaxDiscountAmount('');
    setUsageLimit('');
    setExpiryDate('');
    setModalError(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Promotional Coupons & Discounts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure server-authoritative discount rules, minimum thresholds, caps, and expirations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon Campaign</span>
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-stone-400">Loading coupons...</div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-600">Failed to load coupons.</div>
        ) : !coupons || coupons.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Ticket className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-medium text-stone-600">No coupons active</p>
            <p className="text-xs mt-1">Create a promotional campaign to offer seasonal discounts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Coupon Code</th>
                  <th className="py-3 px-4 font-semibold">Benefit</th>
                  <th className="py-3 px-4 font-semibold">Conditions</th>
                  <th className="py-3 px-4 font-semibold">Redemptions</th>
                  <th className="py-3 px-4 font-semibold">Validity</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                  const isLimitReached =
                    coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;

                  return (
                    <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-amber-900">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <p className="font-sans font-normal text-[11px] text-stone-500 mt-1">
                            {coupon.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900">
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${Number(coupon.discountValue).toLocaleString('en-IN')} FLAT OFF`}
                        </span>
                        {coupon.maxDiscountAmount && (
                          <p className="text-[10px] text-stone-400">
                            Up to ₹{Number(coupon.maxDiscountAmount).toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {coupon.minPurchaseAmount ? (
                          <span>
                            Min cart ₹{Number(coupon.minPurchaseAmount).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-stone-400">No minimum</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-800 font-mono">
                          {coupon.usageCount}
                        </span>
                        <span className="text-stone-400 font-mono">
                          {' '}
                          / {coupon.usageLimit ?? '∞'}
                        </span>
                        {isLimitReached && (
                          <span className="block text-[10px] text-red-600 font-semibold">
                            Limit Reached
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {coupon.expiryDate ? (
                          <span className={isExpired ? 'text-red-600 font-semibold' : ''}>
                            {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {isExpired && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="text-stone-400">No Expiration</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            coupon.isActive && !isExpired && !isLimitReached
                              ? 'success'
                              : 'default'
                          }
                        >
                          {coupon.isActive && !isExpired && !isLimitReached ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: coupon.id,
                              isActive: !coupon.isActive,
                            })
                          }
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                        >
                          {coupon.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Create Promotional Coupon
                </h3>
                <p className="text-xs text-stone-500">
                  Configure discount formula and eligibility constraints.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DIWALI20"
                    className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-white focus:outline-hidden focus:border-amber-600"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Rupee Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Discount Value * ({discountType === 'PERCENTAGE' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="e.g. 1000 (Optional)"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Public Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% off on all festive kurtas and silk dupattas"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Min Subtotal Required (₹)
                  </label>
                  <input
                    type="number"
                    value={minPurchaseAmount}
                    onChange={(e) => setMinPurchaseAmount(e.target.value)}
                    placeholder="e.g. 1999 (Optional)"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Usage Cap Limit
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="e.g. 100 (Optional)"
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Expiry Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={createMutation.isPending || !code.trim() || discountValue <= 0}
                onClick={() => createMutation.mutate()}
                className="gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{createMutation.isPending ? 'Deploying...' : 'Deploy Coupon'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CouponsPage;
