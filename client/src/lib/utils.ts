import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '₹0';
  const num = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(num)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getFallbackImage(text = 'Vastra'): string {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23F8F5EE"><rect width="100%" height="100%" fill="%23F8F5EE"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="%238C4A2F">${encodeURIComponent(text)}</text><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239E988F">Pure Living Handcrafted</text></svg>`;
}
