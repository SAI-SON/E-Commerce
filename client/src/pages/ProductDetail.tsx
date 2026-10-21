import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Truck, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { Product, ProductVariant } from '../types/index.js';
import { api } from '../lib/api.js';
import { formatPrice } from '../lib/utils.js';
import { ImageWithFallback } from '../components/common/ImageWithFallback.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { useCartStore } from '../../src/store/cartStore.js';
import { useAuthStore } from '../../src/store/authStore.js';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'material' | 'care' | 'shipping'>('desc');

  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setCartSuccessMessage(null);
        const res = await api.get<{ data: Product; relatedProducts: Product[] }>(
          `/products/${slug}`
        );

        const prod = res.data;
        setProduct(prod);
        setRelatedProducts(res.relatedProducts || []);

        if (prod.images.length > 0) {
          setSelectedImage(prod.images[0].url);
        }

        // Pre-select first available variant's size and colour
        const firstAvail = prod.variants.find((v) => v.isActive && v.stockQuantity > 0) || prod.variants[0];
        if (firstAvail) {
          setSelectedSize(firstAvail.size);
          setSelectedColour(firstAvail.colour);
        }
      } catch (err: unknown) {
        setErrorMessage((err as Error).message || 'Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      loadProduct();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vastra-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-vastra-charcoal mb-4">
          Product Not Found
        </h2>
        <p className="text-sm text-vastra-muted mb-6">{errorMessage || 'Unable to locate this item.'}</p>
        <Link to="/products">
          <Button variant="outline">Back to Collection</Button>
        </Link>
      </div>
    );
  }

  // Find exact selected variant
  const selectedVariant: ProductVariant | undefined = product.variants.find(
    (v) => v.size === selectedSize && v.colour === selectedColour
  );

  const isSelectedOutOfStock = !selectedVariant || selectedVariant.stockQuantity <= 0;
  const unitPrice = selectedVariant ? Number(selectedVariant.salePrice || selectedVariant.price) : 0;
  const regularPrice = selectedVariant ? Number(selectedVariant.price) : 0;
  const salePrice = selectedVariant?.salePrice ? Number(selectedVariant.salePrice) : null;
  const discountPercent =
    salePrice && regularPrice > salePrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : null;

  // Distinct sizes and colours
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const availableColours = Array.from(
    new Map(product.variants.map((v) => [v.colour, v.colourHex])).entries()
  );

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setErrorMessage('Please select a valid size and colour option.');
      return;
    }

    if (selectedVariant.stockQuantity < quantity) {
      setErrorMessage(`Only ${selectedVariant.stockQuantity} unit(s) left in stock.`);
      return;
    }

    try {
      setIsAddingToCart(true);
      setErrorMessage(null);
      await api.post('/cart/items', {
        variantId: selectedVariant.id,
        quantity,
      });

      await fetchCart();
      setCartSuccessMessage(`Added ${quantity} × ${product.name} to your bag.`);
      setTimeout(() => setCartSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to add item to bag');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post<{ data: { inWishlist: boolean } }>(
        `/wishlist/toggle/${product.id}`
      );
      setInWishlist(res.data.inWishlist);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-vastra-muted mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-vastra-charcoal">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-vastra-charcoal">
          Collection
        </Link>
        <span>/</span>
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-vastra-charcoal">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-vastra-charcoal font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-vastra-surface rounded-sm overflow-hidden border border-vastra-border/60">
            <ImageWithFallback
              src={selectedImage}
              alt={product.name}
              fallbackText={product.name}
              className="w-full h-full object-cover object-center"
            />
            {isSelectedOutOfStock && (
              <div className="absolute inset-0 bg-vastra-charcoal/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-white text-xs font-semibold tracking-widest uppercase px-4 py-1.5 bg-vastra-charcoal">
                  Currently Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-24 rounded-sm overflow-hidden border-2 shrink-0 transition-all ${selectedImage === img.url
                      ? 'border-vastra-terracotta scale-95 shadow-xs'
                      : 'border-transparent hover:border-vastra-border'
                    }`}
                >
                  <ImageWithFallback
                    src={img.url}
                    alt={img.altText || product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Information & Purchase Controls */}
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs uppercase tracking-widest text-vastra-terracotta font-semibold">
                {product.category?.name}
              </span>
              <button
                onClick={handleWishlistToggle}
                className="p-2 rounded-full border border-vastra-border hover:border-vastra-charcoal text-vastra-charcoal hover:text-red-600 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-600 text-red-600' : ''}`} />
              </button>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-vastra-charcoal leading-tight mb-2">
              {product.name}
            </h1>

            {selectedVariant && (
              <p className="text-xs text-vastra-light font-mono mb-4">SKU: {selectedVariant.sku}</p>
            )}

            {/* Price Display */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-vastra-border/60">
              <span className="font-serif text-2xl sm:text-3xl font-semibold text-vastra-charcoal">
                {formatPrice(unitPrice)}
              </span>
              {salePrice && (
                <span className="text-base text-vastra-muted line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
              {discountPercent && <Badge variant="sale">{discountPercent}% OFF</Badge>}
              <span className="text-[11px] text-vastra-light ml-auto">Inclusive of all taxes</span>
            </div>

            {/* Colour Selector */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-vastra-charcoal">
                  Selected Colour: <span className="text-vastra-muted">{selectedColour}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableColours.map(([colourName, hex]) => {
                  const isSelected = selectedColour === colourName;
                  return (
                    <button
                      key={colourName}
                      onClick={() => setSelectedColour(colourName)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-medium transition-all ${isSelected
                          ? 'border-vastra-charcoal bg-vastra-surface ring-1 ring-vastra-charcoal'
                          : 'border-vastra-border hover:border-vastra-charcoal bg-white'
                        }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: hex || '#ccc' }}
                      />
                      <span>{colourName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-vastra-charcoal">
                  Selected Size: <span className="text-vastra-muted">{selectedSize}</span>
                </span>
                <span className="text-vastra-terracotta cursor-pointer hover:underline">
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const variantForSize = product.variants.find(
                    (v) => v.size === size && v.colour === selectedColour
                  );
                  const isAvailable = variantForSize && variantForSize.stockQuantity > 0;

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`min-w-12 px-3.5 py-2 text-xs font-semibold rounded-sm border transition-all ${isSelected
                          ? 'bg-vastra-charcoal text-white border-vastra-charcoal'
                          : isAvailable
                            ? 'bg-white border-vastra-border text-vastra-charcoal hover:border-vastra-charcoal'
                            : 'bg-stone-100 text-stone-400 border-stone-200 line-through cursor-not-allowed'
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Availability Callout */}
            <div className="mb-6">
              {selectedVariant ? (
                selectedVariant.stockQuantity > 5 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                    <Check className="w-4 h-4" />
                    <span>In Stock — ready for dispatch</span>
                  </div>
                ) : selectedVariant.stockQuantity > 0 ? (
                  <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>Only {selectedVariant.stockQuantity} unit(s) left in this variant!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>Out of stock in selected combination.</span>
                  </div>
                )
              ) : null}
            </div>

            {/* Quantity Stepper & Add to Bag */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-vastra-border rounded-sm bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isSelectedOutOfStock}
                    className="px-3 py-2 text-sm text-vastra-charcoal hover:bg-vastra-surface disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-semibold text-vastra-charcoal">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          selectedVariant ? selectedVariant.stockQuantity : 10,
                          quantity + 1
                        )
                      )
                    }
                    disabled={
                      isSelectedOutOfStock ||
                      (selectedVariant && quantity >= selectedVariant.stockQuantity)
                    }
                    className="px-3 py-2 text-sm text-vastra-charcoal hover:bg-vastra-surface disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isSelectedOutOfStock}
                  isLoading={isAddingToCart}
                  size="lg"
                  className="flex-1"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {isSelectedOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}
                </Button>
              </div>

              {/* Success / Error Feedback Alerts */}
              {cartSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center justify-between animate-fade-in">
                  <span>{cartSuccessMessage}</span>
                  <Link to="/cart" className="font-semibold underline ml-2">
                    View Bag →
                  </Link>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm animate-fade-in">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Assurance Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-8 mt-8 border-t border-vastra-border/60 text-center">
              <div className="p-2 space-y-1">
                <Sparkles className="w-4 h-4 text-vastra-terracotta mx-auto" />
                <p className="text-[11px] font-semibold">Authentic Weave</p>
                <p className="text-[10px] text-vastra-muted">Pure certified handloom</p>
              </div>
              <div className="p-2 space-y-1">
                <Truck className="w-4 h-4 text-vastra-olive mx-auto" />
                <p className="text-[11px] font-semibold">Complimentary</p>
                <p className="text-[10px] text-vastra-muted">Free delivery over ₹1,999</p>
              </div>
              <div className="p-2 space-y-1">
                <RefreshCw className="w-4 h-4 text-vastra-sand mx-auto" />
                <p className="text-[11px] font-semibold">Mindful Returns</p>
                <p className="text-[10px] text-vastra-muted">7-day exchange window</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Material, Care, Shipping */}
      <div className="mt-16 pt-10 border-t border-vastra-border">
        <div className="flex border-b border-vastra-border overflow-x-auto space-x-8">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-4 text-sm font-semibold tracking-wide uppercase transition-colors relative ${activeTab === 'desc'
                ? 'text-vastra-terracotta after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-vastra-terracotta'
                : 'text-vastra-muted hover:text-vastra-charcoal'
              }`}
          >
            The Artisan Story
          </button>
          <button
            onClick={() => setActiveTab('material')}
            className={`pb-4 text-sm font-semibold tracking-wide uppercase transition-colors relative ${activeTab === 'material'
                ? 'text-vastra-terracotta after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-vastra-terracotta'
                : 'text-vastra-muted hover:text-vastra-charcoal'
              }`}
          >
            Natural Material
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-4 text-sm font-semibold tracking-wide uppercase transition-colors relative ${activeTab === 'care'
                ? 'text-vastra-terracotta after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-vastra-terracotta'
                : 'text-vastra-muted hover:text-vastra-charcoal'
              }`}
          >
            Care Instructions
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-4 text-sm font-semibold tracking-wide uppercase transition-colors relative ${activeTab === 'shipping'
                ? 'text-vastra-terracotta after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-vastra-terracotta'
                : 'text-vastra-muted hover:text-vastra-charcoal'
              }`}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="py-8 max-w-3xl text-sm leading-relaxed text-vastra-charcoal">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 bg-vastra-surface text-vastra-muted rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'material' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-vastra-charcoal">Fibers & Composition:</h4>
              <p>{product.material || '100% Pure Natural Fibers crafted through heritage techniques.'}</p>
              <p className="text-xs text-vastra-muted">
                Zero harmful chemical softeners. Naturally breathable and gentle on sensitive skin.
              </p>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-vastra-charcoal">Mindful Garment Care:</h4>
              <p>{product.careInstructions || 'Gentle hand wash in cold water with mild shampoo or mild soap nut detergent. Dry in shaded breeze.'}</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-vastra-charcoal">Complimentary & Express Shipping</h4>
              <p>
                Orders across India typically arrive within 3–5 business days via our premium insured
                logistics partners. Hand-packaged in plastic-free biodegradable recycled paper.
              </p>
              <p className="text-xs text-vastra-muted">
                7-day exchange window for unused, unwashed garments with original tags intact.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-vastra-border">
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-vastra-terracotta">
              Harmony & Pairings
            </span>
            <h3 className="font-serif text-2xl font-bold text-vastra-charcoal mt-1">
              You May Also Appreciate
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
