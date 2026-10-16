import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '../../types/index.js';
import { formatPrice } from '../../lib/utils.js';
import { ImageWithFallback } from '../common/ImageWithFallback.js';
import { Badge } from '../common/Badge.js';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

interface ProductCardProps {
  product: Product;
  inWishlist?: boolean;
  onWishlistToggle?: (productId: string, inWishlist: boolean) => void;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inWishlist: initialInWishlist = false,
  onWishlistToggle,
  viewMode = 'grid',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [inWishlist, setInWishlist] = React.useState(initialInWishlist);
  const [isHovered, setIsHovered] = React.useState(false);

  // Compute lowest effective price and availability
  const activeVariants = product.variants.filter((v) => v.isActive);
  const totalStock = activeVariants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const isOutOfStock = totalStock === 0;

  const lowestVariant = activeVariants.reduce((prev, curr) => {
    const prevPrice = Number(prev.salePrice || prev.price);
    const currPrice = Number(curr.salePrice || curr.price);
    return currPrice < prevPrice ? curr : prev;
  }, activeVariants[0]);

  const regularPrice = lowestVariant ? Number(lowestVariant.price) : 0;
  const salePrice = lowestVariant?.salePrice ? Number(lowestVariant.salePrice) : null;
  const discountPercent =
    salePrice && regularPrice > salePrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : null;

  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
  const secondaryImage = product.images.find((img) => !img.isPrimary)?.url || primaryImage;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.post<{ data: { inWishlist: boolean } }>(
        `/wishlist/toggle/${product.id}`
      );
      setInWishlist(res.data.inWishlist);
      onWishlistToggle?.(product.id, res.data.inWishlist);
    } catch {
      // Handle error
    }
  };

  // Distinct colours for quick preview
  const uniqueColours = Array.from(
    new Map(activeVariants.filter((v) => v.colourHex).map((v) => [v.colour, v.colourHex])).entries()
  );

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col sm:flex-row bg-white border border-vastra-border hover:border-vastra-charcoal/30 transition-all rounded-sm overflow-hidden group">
        <Link
          to={`/products/${product.slug}`}
          className="relative sm:w-64 h-64 sm:h-auto overflow-hidden bg-vastra-surface shrink-0"
        >
          <ImageWithFallback
            src={primaryImage}
            alt={product.name}
            fallbackText={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-vastra-charcoal/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white text-xs font-semibold tracking-widest uppercase px-3 py-1 bg-vastra-charcoal">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs tracking-wider uppercase text-vastra-muted">
                {product.category?.name}
              </span>
              <button
                onClick={handleWishlistClick}
                className="p-1.5 text-vastra-muted hover:text-red-600 transition-colors"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${inWishlist ? 'fill-red-600 text-red-600' : ''}`}
                />
              </button>
            </div>

            <Link to={`/products/${product.slug}`}>
              <h3 className="font-serif text-lg font-semibold text-vastra-charcoal hover:text-vastra-terracotta transition-colors mb-2">
                {product.name}
              </h3>
            </Link>

            <p className="text-xs text-vastra-muted line-clamp-2 mb-4 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {discountPercent && <Badge variant="sale">{discountPercent}% OFF</Badge>}
              {product.isNewArrival && <Badge variant="new">New Arrival</Badge>}
              {totalStock > 0 && totalStock <= 5 && (
                <Badge variant="lowStock">Only {totalStock} left</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-vastra-border/60">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-base text-vastra-charcoal">
                {formatPrice(salePrice || regularPrice)}
              </span>
              {salePrice && (
                <span className="text-xs text-vastra-muted line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>

            <Link
              to={`/products/${product.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-vastra-terracotta hover:underline"
            >
              Select Options →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col bg-white border border-vastra-border/60 hover:border-vastra-charcoal/30 hover:shadow-subtle transition-all duration-300 rounded-sm overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image & Badges */}
      <Link to={`/products/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-vastra-surface">
        <ImageWithFallback
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          fallbackText={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discountPercent && <Badge variant="sale">{discountPercent}% OFF</Badge>}
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {totalStock > 0 && totalStock <= 5 && (
            <Badge variant="lowStock">Only {totalStock} left</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-vastra-charcoal hover:text-red-600 shadow-sm flex items-center justify-center transition-all z-10"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist ? 'fill-red-600 text-red-600' : ''
            }`}
          />
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-vastra-charcoal/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-white text-xs font-semibold tracking-widest uppercase px-3 py-1 bg-vastra-charcoal">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-vastra-muted mb-1 block">
            {product.category?.name}
          </span>
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-serif text-sm font-medium text-vastra-charcoal group-hover:text-vastra-terracotta transition-colors line-clamp-1 mb-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Colour Swatches preview */}
          {uniqueColours.length > 1 && (
            <div className="flex items-center gap-1 mb-2">
              {uniqueColours.slice(0, 4).map(([colName, hex]) => (
                <span
                  key={colName}
                  title={colName}
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: hex || '#ccc' }}
                />
              ))}
              {uniqueColours.length > 4 && (
                <span className="text-[10px] text-vastra-muted ml-0.5">
                  +{uniqueColours.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Price display */}
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-sm text-vastra-charcoal">
              {formatPrice(salePrice || regularPrice)}
            </span>
            {salePrice && (
              <span className="text-xs text-vastra-muted line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
