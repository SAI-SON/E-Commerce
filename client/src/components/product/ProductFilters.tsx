import React from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../../types/index.js';
import { Button } from '../common/Button.js';

export interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  colour?: string;
  inStock?: boolean;
}

interface ProductFiltersProps {
  categories: Category[];
  availableSizes: string[];
  availableColours: Array<{ name: string; hex: string | null }>;
  priceBounds: { min: number; max: number };
  activeFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  onCloseMobileDrawer?: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  availableSizes,
  availableColours,
  priceBounds,
  activeFilters,
  onFilterChange,
  onClearFilters,
  onCloseMobileDrawer,
}) => {
  const hasActiveFilters = Object.values(activeFilters).some((val) => val !== undefined);

  return (
    <div className="space-y-8">
      {/* Header for mobile or desktop */}
      <div className="flex items-center justify-between pb-4 border-b border-vastra-border">
        <h3 className="font-serif text-base font-semibold tracking-wide text-vastra-charcoal">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-vastra-terracotta hover:underline font-medium"
          >
            Clear All
          </button>
        )}
        {onCloseMobileDrawer && (
          <button
            onClick={onCloseMobileDrawer}
            className="lg:hidden p-1 text-vastra-charcoal hover:text-vastra-terracotta"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-vastra-charcoal mb-3">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange({ ...activeFilters, category: undefined })}
            className={`w-full text-left text-xs py-1.5 px-2 rounded-sm transition-colors ${!activeFilters.category
                ? 'bg-vastra-terracotta-light text-vastra-terracotta font-semibold'
                : 'text-vastra-charcoal hover:bg-vastra-surface'
              }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ ...activeFilters, category: cat.slug })}
              className={`w-full text-left text-xs py-1.5 px-2 rounded-sm transition-colors flex items-center justify-between ${activeFilters.category === cat.slug
                  ? 'bg-vastra-terracotta-light text-vastra-terracotta font-semibold'
                  : 'text-vastra-charcoal hover:bg-vastra-surface'
                }`}
            >
              <span>{cat.name}</span>
              {cat._count?.products !== undefined && (
                <span className="text-[10px] text-vastra-muted">({cat._count.products})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Availability / In Stock */}
      <div className="pt-4 border-t border-vastra-border/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-vastra-charcoal mb-3">
          Availability
        </h4>
        <label className="flex items-center space-x-2.5 text-xs text-vastra-charcoal cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!activeFilters.inStock}
            onChange={(e) =>
              onFilterChange({ ...activeFilters, inStock: e.target.checked ? true : undefined })
            }
            className="rounded-xs border-vastra-border text-vastra-terracotta focus:ring-vastra-terracotta/40 w-4 h-4"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div className="pt-4 border-t border-vastra-border/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-vastra-charcoal mb-3">
            Size
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = activeFilters.size === size;
              return (
                <button
                  key={size}
                  onClick={() =>
                    onFilterChange({
                      ...activeFilters,
                      size: isSelected ? undefined : size,
                    })
                  }
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${isSelected
                      ? 'bg-vastra-charcoal text-white border-vastra-charcoal'
                      : 'bg-white border-vastra-border text-vastra-charcoal hover:border-vastra-charcoal'
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colours */}
      {availableColours.length > 0 && (
        <div className="pt-4 border-t border-vastra-border/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-vastra-charcoal mb-3">
            Colour
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableColours.map((c) => {
              const isSelected = activeFilters.colour === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() =>
                    onFilterChange({
                      ...activeFilters,
                      colour: isSelected ? undefined : c.name,
                    })
                  }
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-sm transition-colors ${isSelected
                      ? 'bg-vastra-surface text-vastra-terracotta font-semibold'
                      : 'text-vastra-charcoal hover:bg-vastra-surface'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: c.hex || '#ccc' }}
                    />
                    <span>{c.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-vastra-terracotta" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-vastra-border/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-vastra-charcoal mb-3">
          Price Range (₹)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={`Min (₹${priceBounds.min})`}
            value={activeFilters.minPrice !== undefined ? activeFilters.minPrice : ''}
            onChange={(e) => {
              const val = e.target.value ? parseFloat(e.target.value) : undefined;
              onFilterChange({ ...activeFilters, minPrice: val });
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
          />
          <span className="text-xs text-vastra-muted">-</span>
          <input
            type="number"
            placeholder={`Max (₹${priceBounds.max})`}
            value={activeFilters.maxPrice !== undefined ? activeFilters.maxPrice : ''}
            onChange={(e) => {
              const val = e.target.value ? parseFloat(e.target.value) : undefined;
              onFilterChange({ ...activeFilters, maxPrice: val });
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-vastra-border rounded-sm focus:outline-none focus:border-vastra-terracotta"
          />
        </div>
      </div>

      {onCloseMobileDrawer && (
        <div className="pt-6 border-t border-vastra-border lg:hidden">
          <Button onClick={onCloseMobileDrawer} className="w-full">
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
};
