import { z } from 'zod';

export const productSchema = z.object({
  id:               z.string(),
  vendor_id:        z.string(),
  category_id:      z.string(),
  name:             z.string().min(1),
  description:      z.string().nullable().optional(),
  price_min:        z.number().int().min(0).default(0),
  price_max:        z.number().int().min(0).default(0),
  concurrent_slots: z.number().int().min(1).default(1),
  is_active:        z.boolean().default(true),
  created_at:       z.date().optional().nullable(),
});

export const createProductSchema = productSchema.omit({ id: true, created_at: true });
export const updateProductSchema = productSchema
  .omit({ id: true, vendor_id: true, created_at: true })
  .partial();

export type Product    = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export const productPhotoSchema = z.object({
  id:         z.string(),
  product_id: z.string(),
  url:        z.string().url(),
  order_idx:  z.number().int().default(0),
  created_at: z.date().optional().nullable(),
});

export type ProductPhoto   = z.infer<typeof productPhotoSchema>;
export type CreatePhotoInput = { product_id: string; url: string; order_idx?: number };

export const categorySchema = z.object({
  id:         z.string(),
  name:       z.string(),
  slug:       z.string(),
  icon:       z.string().optional().nullable(),
  created_at: z.date().optional().nullable(),
});
export type Category = z.infer<typeof categorySchema>;

export type PaginatedProducts = {
  products: (Product & { photos: ProductPhoto[]; category: Category })[];
  total: number;
  limit: number;
  offset: number;
};
