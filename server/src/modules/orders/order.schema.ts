import { z } from 'zod';

export const createOrderSchema = z.object({
  customerEmail: z.string().email('Valid email is required').trim().toLowerCase(),
  customerPhone: z.string().min(10, 'Valid phone number is required').trim(),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required').trim(),
    phone: z.string().min(10, 'Contact number is required').trim(),
    streetAddress: z.string().min(3, 'Street address is required').trim(),
    apartment: z.string().optional(),
    city: z.string().min(2, 'City is required').trim(),
    state: z.string().min(2, 'State is required').trim(),
    postalCode: z.string().min(4, 'Postal code is required').trim(),
    country: z.string().default('India'),
  }),
  billingAddress: z
    .object({
      fullName: z.string().min(2).trim(),
      phone: z.string().min(10).trim(),
      streetAddress: z.string().min(3).trim(),
      apartment: z.string().optional(),
      city: z.string().min(2).trim(),
      state: z.string().min(2).trim(),
      postalCode: z.string().min(4).trim(),
      country: z.string().default('India'),
    })
    .optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid('Valid variant ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20),
      })
    )
    .min(1, 'Order must contain at least one item'),
  couponCode: z.string().optional(),
  paymentMethod: z
    .enum([
      'RAZORPAY',
      'ONLINE_GATEWAY',
      'SIMULATED_UPI',
      'SIMULATED_CARD',
      'SIMULATED_NET_BANKING',
      'CASH_ON_DELIVERY',
    ])
    .default('ONLINE_GATEWAY'),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
