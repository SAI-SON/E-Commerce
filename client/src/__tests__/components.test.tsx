import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { ImageWithFallback } from '../components/common/ImageWithFallback.js';
import { formatPrice } from '../lib/utils.js';

describe('Vastra Core UI Components & Testing Requirements', () => {
  // TC20: Failed product images display a fallback
  it('TC20: ImageWithFallback renders fallback image when image load fails', () => {
    render(
      <ImageWithFallback
        src="https://invalid-domain.example/broken-garment.jpg"
        alt="Handloom Silk Saree"
      />
    );

    const img = screen.getByAltText('Handloom Silk Saree') as HTMLImageElement;
    expect(img).toBeInTheDocument();

    // Trigger image error event
    fireEvent.error(img);

    // Should switch to reliable embedded SVG fallback without network dependency
    expect(img.src).toContain('data:image/svg+xml');
  });

  // TC11: Empty search results display a useful message
  it('TC11: EmptyState renders useful message and interactive action', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No matching heirloom garments found"
        description="Try searching for another colour or clearing applied filters."
        actionText="Reset Filters"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No matching heirloom garments found')).toBeInTheDocument();
    expect(screen.getByText('Try searching for another colour or clearing applied filters.')).toBeInTheDocument();

    const actionBtn = screen.getByText('Reset Filters');
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  // Currency & Decimal-safe Formatting
  it('correctly formats INR currency values', () => {
    expect(formatPrice(2490)).toBe('₹2,490');
    expect(formatPrice(0)).toBe('₹0');
    expect(formatPrice('5000')).toBe('₹5,000');
  });

  // Badge Component Variants
  it('renders status badges with appropriate theme styles', () => {
    const { rerender } = render(<Badge variant="sale">25% OFF</Badge>);
    expect(screen.getByText('25% OFF')).toHaveClass('text-vastra-terracotta');

    rerender(<Badge variant="danger">CANCELLED</Badge>);
    expect(screen.getByText('CANCELLED')).toHaveClass('text-red-800');

    rerender(<Badge variant="success">CONFIRMED</Badge>);
    expect(screen.getByText('CONFIRMED')).toHaveClass('text-emerald-800');
  });

  // Button Component
  it('renders button with loading spinner and disabled state', () => {
    render(
      <Button isLoading disabled>
        Submit Order
      </Button>
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass('disabled:opacity-50');
  });
});
