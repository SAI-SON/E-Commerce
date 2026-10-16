import { z } from 'zod';

const numberOrString = (defaultValue?: number) =>
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return defaultValue;
      return typeof val === 'number' ? val : parseFloat(val);
    });

const booleanOrString = () =>
  z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return undefined;
      return val === true || val === 'true';
    });

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: numberOrString(),
  maxPrice: numberOrString(),
  size: z.string().optional(),
  colour: z.string().optional(),
  inStock: booleanOrString(),
  isFeatured: booleanOrString(),
  isNewArrival: booleanOrString(),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'])
    .optional()
    .default('newest'),
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (!val) return 1;
      const num = typeof val === 'number' ? val : parseInt(val, 10);
      return isNaN(num) ? 1 : Math.max(1, num);
    })
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (!val) return 12;
      const num = typeof val === 'number' ? val : parseInt(val, 10);
      return isNaN(num) ? 12 : Math.min(50, Math.max(1, num));
    })
    .default(12),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
