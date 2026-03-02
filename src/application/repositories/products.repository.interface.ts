import type { Product, CreateProduct, UpdateProduct, PaginatedProducts, ProductPhoto, CreatePhotoInput } from '@/src/entities/models/product';

export type ProductFilterOpts = {
  category_id?: string[];
  is_active?: boolean;
  vendor_id?: string;
};

export type GetProductsOpts = {
  limit: number;
  offset: number;
  filters?: ProductFilterOpts;
  sort?: { column: 'name' | 'price_min' | 'created_at' | 'concurrent_slots'; direction: 'asc' | 'desc' };
};

export interface IProductsRepository {
  getProducts(opts: GetProductsOpts): Promise<PaginatedProducts>;
  getProduct(id: string): Promise<(Product & { photos: any[]; category: any }) | undefined>;
  createProduct(input: CreateProduct & { id: string }): Promise<Product>;
  updateProduct(id: string, input: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  addPhoto(input: CreatePhotoInput & { id: string }): Promise<ProductPhoto>;
  deletePhoto(id: string): Promise<void>;
  updatePhoto(id: string, input: { order_idx: number }): Promise<void>;
  getPhotoCount(product_id: string): Promise<number>;
}
