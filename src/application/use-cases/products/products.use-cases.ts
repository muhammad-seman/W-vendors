import { IProductsRepository, GetProductsOpts } from '@/src/application/repositories/products.repository.interface';
import type { PaginatedProducts, CreateProduct, UpdateProduct, ProductPhoto } from '@/src/entities/models/product';

export function getProductsUseCase(repo: IProductsRepository) {
  return async (opts: GetProductsOpts): Promise<PaginatedProducts> => repo.getProducts(opts);
}
export type IGetProductsUseCase = ReturnType<typeof getProductsUseCase>;

export function getProductUseCase(repo: IProductsRepository) {
  return async (id: string) => repo.getProduct(id);
}
export type IGetProductUseCase = ReturnType<typeof getProductUseCase>;

export function createProductUseCase(repo: IProductsRepository) {
  return async (input: CreateProduct & { id: string }) => repo.createProduct(input);
}
export type ICreateProductUseCase = ReturnType<typeof createProductUseCase>;

export function updateProductUseCase(repo: IProductsRepository) {
  return async (id: string, input: UpdateProduct) => repo.updateProduct(id, input);
}
export type IUpdateProductUseCase = ReturnType<typeof updateProductUseCase>;

export function deleteProductUseCase(repo: IProductsRepository) {
  return async (id: string) => repo.deleteProduct(id);
}
export type IDeleteProductUseCase = ReturnType<typeof deleteProductUseCase>;

export function addProductPhotoUseCase(repo: IProductsRepository) {
  return async (input: { id: string; product_id: string; url: string; order_idx?: number }): Promise<ProductPhoto> => {
    const count = await repo.getPhotoCount(input.product_id);
    if (count >= 5) throw new Error('Maximum 5 photos per product');
    return repo.addPhoto(input);
  };
}
export type IAddProductPhotoUseCase = ReturnType<typeof addProductPhotoUseCase>;

export function deleteProductPhotoUseCase(repo: IProductsRepository) {
  return async (id: string) => repo.deletePhoto(id);
}
export type IDeleteProductPhotoUseCase = ReturnType<typeof deleteProductPhotoUseCase>;

export function updateProductPhotoUseCase(repo: IProductsRepository) {
  return async (id: string, input: { order_idx: number }) => repo.updatePhoto(id, input);
}
export type IUpdateProductPhotoUseCase = ReturnType<typeof updateProductPhotoUseCase>;
