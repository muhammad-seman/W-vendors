import { createModule } from '@evyweb/ioctopus';

import { ProductsRepository } from '@/src/infrastructure/repositories/products.repository';
import {
  getProductsUseCase,
  getProductUseCase,
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  addProductPhotoUseCase,
  deleteProductPhotoUseCase,
  updateProductPhotoUseCase,
} from '@/src/application/use-cases/products/products.use-cases';
import { DI_SYMBOLS } from '@/di/types';

export function createProductsModule() {
  const m = createModule();

  m.bind(DI_SYMBOLS.IProductsRepository).toClass(ProductsRepository, [
    DI_SYMBOLS.IInstrumentationService,
    DI_SYMBOLS.ICrashReporterService,
  ]);

  m.bind(DI_SYMBOLS.IGetProductsUseCase).toHigherOrderFunction(getProductsUseCase, [DI_SYMBOLS.IProductsRepository]);
  m.bind(DI_SYMBOLS.IGetProductUseCase).toHigherOrderFunction(getProductUseCase, [DI_SYMBOLS.IProductsRepository]);
  m.bind(DI_SYMBOLS.ICreateProductUseCase).toHigherOrderFunction(createProductUseCase, [DI_SYMBOLS.IProductsRepository]);
  m.bind(DI_SYMBOLS.IUpdateProductUseCase).toHigherOrderFunction(updateProductUseCase, [DI_SYMBOLS.IProductsRepository]);
  m.bind(DI_SYMBOLS.IDeleteProductUseCase).toHigherOrderFunction(deleteProductUseCase, [DI_SYMBOLS.IProductsRepository]);
  m.bind(DI_SYMBOLS.IAddProductPhotoUseCase).toHigherOrderFunction(addProductPhotoUseCase, [DI_SYMBOLS.IProductsRepository]);
  m.bind(DI_SYMBOLS.IDeleteProductPhotoUseCase).toHigherOrderFunction(deleteProductPhotoUseCase, [DI_SYMBOLS.IProductsRepository]);
  m.bind(DI_SYMBOLS.IUpdateProductPhotoUseCase).toHigherOrderFunction(updateProductPhotoUseCase, [DI_SYMBOLS.IProductsRepository]);

  return m;
}
