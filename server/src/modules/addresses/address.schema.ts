import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').trim(),
  phone: z.string().min(10, 'Valid contact number is required').trim(),
  streetAddress: z.string().min(3, 'Street address is required').trim(),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required').trim(),
  state: z.string().min(2, 'State is required').trim(),
  postalCode: z.string().min(4, 'Postal code is required').trim(),
  country: z.string().default('India'),
  isDefaultShipping: z.boolean().optional().default(false),
  isDefaultBilling: z.boolean().optional().default(false),
});

export const updateAddressSchema = addressSchema.partial();
