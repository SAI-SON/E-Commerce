import { z } from 'zod';
import { OrderStatus, DiscountType } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name is required').trim(),
  slug: z.string().min(2, 'Slug is required').trim(),
  shortDescription: z.string().optional(),
  description: z.string().min(10, 'Description is required').trim(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  categoryId: z.string().uuid('Valid category ID required'),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        url: z.string().url('Valid image URL required'),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, 'At least one image is required'),
  variants: z
    .array(
      z.object({
        sku: z.string().min(2, 'SKU is required').trim(),
        size: z.string().min(1, 'Size is required').trim(),
        colour: z.string().min(1, 'Colour is required').trim(),
        colourHex: z.string().optional(),
        price: z.number().positive('Price must be greater than zero'),
        salePrice: z.number().positive().optional().nullable(),
        stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
      })
    )
    .min(1, 'At least one variant is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  shortDescription: z.string().optional(),
  description: z.string().min(10).optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const adjustStockSchema = z.object({
  adjustment: z.number().int(), // e.g. +10 or -5
  reason: z.string().min(3, 'Adjustment reason is required').trim(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

export const createCouponSchema = z.object({
  code: z.string().min(3, 'Code is required').trim().toUpperCase(),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().positive('Discount value must be positive'),
  minPurchaseAmount: z.number().positive().optional().nullable(),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});
