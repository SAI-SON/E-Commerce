import { z } from 'zod';

export const addToCartSchema = z.object({
  variantId: z.string().uuid('Valid variant ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum quantity limit is 20'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum quantity limit is 20'),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').trim().toUpperCase(),
});

export const mergeCartSchema = z.object({
  guestSessionId: z.string().min(1, 'Guest session ID is required'),
});
