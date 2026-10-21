import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Product, Category } from '../types/index.js';
import { api } from '../lib/api.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { ProductFilters, FilterState } from '../components/product/ProductFilters.js';
import { Pagination } from '../components/common/Pagination.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const Catalogue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColours, setAvailableColours] = useState<
    Array<{ name: string; hex: string | null }>
  >([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 10000 });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract query filters from URL
  const currentCategory = searchParams.get('category') || undefined;
  const currentSearch = searchParams.get('search') || undefined;
  const currentSize = searchParams.get('size') || undefined;
  const currentColour = searchParams.get('colour') || undefined;
  const currentMinPrice = searchParams.get('minPrice')
    ? parseFloat(searchParams.get('minPrice')!)
    : undefined;
  const currentMaxPrice = searchParams.get('maxPrice')
    ? parseFloat(searchParams.get('maxPrice')!)
    : undefined;
  const currentInStock = searchParams.get('inStock') === 'true' ? true : undefined;
  const currentSort = searchParams.get('sort') || 'newest';

  // Active filters object
  const activeFilters: FilterState = {
    category: currentCategory,
    minPrice: currentMinPrice,
    maxPrice: currentMaxPrice,
    size: currentSize,
    colour: currentColour,
    inStock: currentInStock,
  };

  // Load filter metadata (categories, sizes, colours, price bounds)
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [catRes, filterRes] = await Promise.all([
          api.get<{ data: Category[] }>('/categories'),
          api.get<{
            data: {
              sizes: string[];
              colours: Array<{ name: string; hex: string | null }>;
              priceRange: { min: number; max: number };
            };
          }>('/products/filters'),
        ]);

        setCategories(catRes.data);
        setAvailableSizes(filterRes.data.sizes);
        setAvailableColours(filterRes.data.colours);
        setPriceBounds(filterRes.data.priceRange);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch products whenever searchParams change
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryString = searchParams.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
      const res = await api.get<{
        data: Product[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(endpoint);

      setProducts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update filters in URL
  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams);

    if (newFilters.category) params.set('category', newFilters.category);
    else params.delete('category');

    if (newFilters.size) params.set('size', newFilters.size);
    else params.delete('size');

    if (newFilters.colour) params.set('colour', newFilters.colour);
    else params.delete('colour');

    if (newFilters.minPrice !== undefined) params.set('minPrice', newFilters.minPrice.toString());
    else params.delete('minPrice');

    if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString());
    else params.delete('maxPrice');

    if (newFilters.inStock) params.set('inStock', 'true');
    else params.delete('inStock');

    // Reset to page 1 on filter change
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (currentSearch) params.set('search', currentSearch);
    setSearchParams(params);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Catalogue Header */}
      <div className="mb-8 pb-6 border-b border-vastra-border flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-vastra-terracotta font-semibold">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Curated Line'
              : 'Our Complete Collection'}
          </span>
          <h1 className="font-serif text-3xl font-bold text-vastra-charcoal mt-1">
            Handcrafted Indian Wear & Adornments
          </h1>
          <p className="text-xs text-vastra-muted mt-1">
            Showing {pagination.total} mindful creation{pagination.total === 1 ? '' : 's'}
          </p>
        </div>

        {/* View Mode & Sort Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border border-vastra-border rounded-sm bg-white text-vastra-charcoal hover:border-vastra-charcoal"
          >
            <SlidersHorizontal className="w-4 h-4 text-vastra-terracotta" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-vastra-muted absolute left-3 pointer-events-none" />
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="pl-8 pr-8 py-2 bg-white border border-vastra-border text-xs rounded-sm text-vastra-charcoal focus:outline-none focus:border-vastra-terracotta font-medium appearance-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Alphabetical: A-Z</option>
              <option value="name_desc">Alphabetical: Z-A</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center border border-vastra-border rounded-sm bg-white overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid'
                  ? 'bg-vastra-surface text-vastra-terracotta'
                  : 'text-vastra-muted hover:text-vastra-charcoal'
                }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors border-l border-vastra-border ${viewMode === 'list'
                  ? 'bg-vastra-surface text-vastra-terracotta'
                  : 'text-vastra-muted hover:text-vastra-charcoal'
                }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(currentCategory ||
        currentSearch ||
        currentSize ||
        currentColour ||
        currentInStock ||
        currentMinPrice !== undefined ||
        currentMaxPrice !== undefined) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">
            <span className="text-xs text-vastra-muted">Active filters:</span>

            {currentSearch && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-vastra-border rounded-full text-vastra-charcoal">
                Search: "{currentSearch}"
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete('search');
                    setSearchParams(p);
                  }}
                >
                  <X className="w-3 h-3 text-vastra-muted hover:text-vastra-charcoal" />
                </button>
              </span>
            )}

            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-vastra-border rounded-full text-vastra-charcoal">
                Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <button onClick={() => handleFilterChange({ ...activeFilters, category: undefined })}>
                  <X className="w-3 h-3 text-vastra-muted hover:text-vastra-charcoal" />
                </button>
              </span>
            )}

            {currentSize && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-vastra-border rounded-full text-vastra-charcoal">
                Size: {currentSize}
                <button onClick={() => handleFilterChange({ ...activeFilters, size: undefined })}>
                  <X className="w-3 h-3 text-vastra-muted hover:text-vastra-charcoal" />
                </button>
              </span>
            )}

            {currentColour && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-vastra-border rounded-full text-vastra-charcoal">
                Colour: {currentColour}
                <button onClick={() => handleFilterChange({ ...activeFilters, colour: undefined })}>
                  <X className="w-3 h-3 text-vastra-muted hover:text-vastra-charcoal" />
                </button>
              </span>
            )}

            {currentInStock && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-vastra-border rounded-full text-vastra-charcoal">
                In Stock Only
                <button onClick={() => handleFilterChange({ ...activeFilters, inStock: undefined })}>
                  <X className="w-3 h-3 text-vastra-muted hover:text-vastra-charcoal" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              className="text-xs text-vastra-terracotta hover:underline font-medium ml-1"
            >
              Clear All
            </button>
          </div>
        )}

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28 bg-white border border-vastra-border rounded-sm p-6">
            <ProductFilters
              categories={categories}
              availableSizes={availableSizes}
              availableColours={availableColours}
              priceBounds={priceBounds}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-elevated z-10 animate-fade-in">
              <ProductFilters
                categories={categories}
                availableSizes={availableSizes}
                availableColours={availableColours}
                priceBounds={priceBounds}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Products Grid / List Area */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div
              className={`grid ${viewMode === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-1'
                } gap-6`}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-vastra-surface animate-pulse rounded-sm" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No creations match your search"
              description="We could not find items that fulfill the chosen filters. Try resetting the filters or exploring other collections."
              actionText="Reset All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="space-y-6">
              <div
                className={`grid ${viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-1'
                  } gap-4 sm:gap-6`}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Server-side Pagination */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
