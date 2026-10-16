import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';
import { WishlistItem } from '../../types';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { EmptyState } from '../../components/ui/EmptyState';

export const WishlistPage: React.FC = () => {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { data: items, isLoading, error } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get<{ data: WishlistItem[] }>('/wishlist');
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.post(`/wishlist/toggle/${productId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#EBE7DF] pb-5">
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-charcoal">
          My Wishlist
        </h1>
        <p className="text-sm text-charcoal-muted mt-1">
          Curated pieces you've saved to inspect, contemplate, or purchase later.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-sand/20 rounded-xl h-72"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-terracotta/10 text-terracotta border border-terracotta/20 rounded-xl text-sm">
          Unable to load your wishlist. Please try again.
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-vastra-muted/80 stroke-1" />}
          title="Your wishlist is empty"
          description="You haven't saved any heirloom garments or accessories yet. Explore our handcrafted collection to find pieces you love."
          actionText="Discover Catalogue"
          onAction={() => navigate('/products')}
        />
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const hasDiscount = item.salePrice && item.salePrice < item.price;
              return (
                <div
                  key={item.id}
                  className="group relative bg-white border border-[#EBE7DF] rounded-xl overflow-hidden hover:shadow-subtle transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
                    <Link to={`/products/${item.productSlug}`}>
                      <ImageWithFallback
                        src={item.primaryImage}
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <button
                      onClick={() => toggleMutation.mutate(item.productId)}
                      disabled={toggleMutation.isPending}
                      aria-label="Remove from wishlist"
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-charcoal-muted hover:text-terracotta hover:bg-white shadow-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {!item.isPublished && (
                      <span className="absolute bottom-3 left-3 px-2 py-0.5 text-xs bg-charcoal/80 text-white rounded">
                        Archived
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/products/${item.productSlug}`}>
                        <h3 className="font-serif text-base font-medium text-charcoal group-hover:text-terracotta transition-colors line-clamp-1">
                          {item.productName}
                        </h3>
                      </Link>
                      <div className="mt-2 flex items-baseline gap-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-base font-medium text-terracotta">
                              ₹{item.salePrice?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-charcoal-muted line-through">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          </>
                        ) : (
                          <span className="text-base font-medium text-charcoal">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EBE7DF]/60 flex items-center justify-between">
                      <Link
                        to={`/products/${item.productSlug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal hover:text-terracotta transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Select Size & Buy</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
};
export default WishlistPage;
