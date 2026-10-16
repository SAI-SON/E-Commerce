import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ExternalLink,
  Package,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { Pagination } from '../../components/ui/Pagination';

interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const res = await api.get<{ data: Product[]; pagination: any }>('/admin/products', {
        page,
        limit: 15,
        search: search || undefined,
      });
      return {
        products: res.data,
        pagination: res.pagination || { total: res.data.length, page: 1, limit: 15, totalPages: 1 },
      };
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      await api.patch(`/admin/products/${id}`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & New Product CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Catalogue Management</h1>
          <p className="text-xs text-stone-500 mt-1">
            Create, modify, publish, or configure variants and pricing for all products.
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Create New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product title or slug..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </form>

        <span className="text-xs text-stone-500">
          Showing {data?.products.length || 0} of {data?.pagination.total || 0} items
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-stone-400">Loading catalogue...</div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-red-600">Failed to load products.</div>
        ) : !data?.products || data.products.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Package className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-medium text-stone-600">No products found</p>
            <p className="text-xs mt-1">Try adjusting your search criteria or add a new piece.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Base Price</th>
                  <th className="py-3 px-4 font-semibold">Total Stock</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.products.map((p) => {
                  const primaryImg = p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url;
                  const totalStock = p.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;
                  const lowestPrice = p.variants?.[0]?.price;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                            <ImageWithFallback
                              src={primaryImg}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900 line-clamp-1">{p.name}</p>
                            <p className="text-[11px] font-mono text-stone-400 mt-0.5">/{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        {p.category?.name || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        {lowestPrice ? `₹${Number(lowestPrice).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            totalStock <= 5 ? 'text-amber-700' : 'text-stone-800'
                          }`}
                        >
                          {totalStock} units
                        </span>
                        <span className="block text-[10px] text-stone-400">
                          {p.variants?.length || 0} variant(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={p.isPublished ? 'success' : 'default'}>
                          {p.isPublished ? 'Published' : 'Draft / Archived'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/products/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Storefront"
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() =>
                              togglePublishMutation.mutate({
                                id: p.id,
                                isPublished: !p.isPublished,
                              })
                            }
                            title={p.isPublished ? 'Unpublish Product' : 'Publish Product'}
                            className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-stone-100 rounded transition-colors"
                          >
                            {p.isPublished ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            title="Edit Details"
                            className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-stone-100 rounded transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to unpublish and archive "${p.name}"?`
                                )
                              ) {
                                deleteMutation.mutate(p.id);
                              }
                            }}
                            title="Archive Product"
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
};
export default ProductsPage;
