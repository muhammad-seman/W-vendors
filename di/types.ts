import { IAuthenticationService } from '@/src/application/services/authentication.service.interface';
import { ITransactionManagerService } from '@/src/application/services/transaction-manager.service.interface';
import { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';

import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { IProductsRepository } from '@/src/application/repositories/products.repository.interface';

import { ISignInUseCase } from '@/src/application/use-cases/auth/sign-in.use-case';
import { ISignUpUseCase } from '@/src/application/use-cases/auth/sign-up.use-case';
import { ISignOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case';
import { IGetUsersUseCase } from '@/src/application/use-cases/users/get-users.use-case';
import { ICreateUserUseCase } from '@/src/application/use-cases/users/create-user.use-case';
import { IUpdateUserUseCase } from '@/src/application/use-cases/users/update-user.use-case';
import { IDeleteUserUseCase } from '@/src/application/use-cases/users/delete-user.use-case';
import {
  IGetProductsUseCase, IGetProductUseCase, ICreateProductUseCase, IUpdateProductUseCase,
  IDeleteProductUseCase, IAddProductPhotoUseCase, IDeleteProductPhotoUseCase, IUpdateProductPhotoUseCase,
} from '@/src/application/use-cases/products/products.use-cases';

import { ISignInController } from '@/src/interface-adapters/controllers/auth/sign-in.controller';
import { ISignOutController } from '@/src/interface-adapters/controllers/auth/sign-out.controller';
import { ISignUpController } from '@/src/interface-adapters/controllers/auth/sign-up.controller';
import { IGetUsersController } from '@/src/interface-adapters/controllers/users/get-users.controller';
import { ICreateUserController } from '@/src/interface-adapters/controllers/users/create-user.controller';
import { IUpdateUserController } from '@/src/interface-adapters/controllers/users/update-user.controller';
import { IDeleteUserController } from '@/src/interface-adapters/controllers/users/delete-user.controller';

export const DI_SYMBOLS = {
  // Services
  IAuthenticationService:    Symbol.for('IAuthenticationService'),
  ITransactionManagerService: Symbol.for('ITransactionManagerService'),
  IInstrumentationService:   Symbol.for('IInstrumentationService'),
  ICrashReporterService:     Symbol.for('ICrashReporterService'),

  // Repositories
  IUsersRepository:    Symbol.for('IUsersRepository'),
  IProductsRepository: Symbol.for('IProductsRepository'),

  // Auth use cases
  ISignInUseCase:  Symbol.for('ISignInUseCase'),
  ISignOutUseCase: Symbol.for('ISignOutUseCase'),
  ISignUpUseCase:  Symbol.for('ISignUpUseCase'),

  // Users use cases
  IGetUsersUseCase:    Symbol.for('IGetUsersUseCase'),
  ICreateUserUseCase:  Symbol.for('ICreateUserUseCase'),
  IUpdateUserUseCase:  Symbol.for('IUpdateUserUseCase'),
  IDeleteUserUseCase:  Symbol.for('IDeleteUserUseCase'),

  // Products use cases
  IGetProductsUseCase:        Symbol.for('IGetProductsUseCase'),
  IGetProductUseCase:         Symbol.for('IGetProductUseCase'),
  ICreateProductUseCase:      Symbol.for('ICreateProductUseCase'),
  IUpdateProductUseCase:      Symbol.for('IUpdateProductUseCase'),
  IDeleteProductUseCase:      Symbol.for('IDeleteProductUseCase'),
  IAddProductPhotoUseCase:    Symbol.for('IAddProductPhotoUseCase'),
  IDeleteProductPhotoUseCase: Symbol.for('IDeleteProductPhotoUseCase'),
  IUpdateProductPhotoUseCase: Symbol.for('IUpdateProductPhotoUseCase'),

  // Auth controllers
  ISignInController:  Symbol.for('ISignInController'),
  ISignOutController: Symbol.for('ISignOutController'),
  ISignUpController:  Symbol.for('ISignUpController'),

  // Users controllers
  IGetUsersController:    Symbol.for('IGetUsersController'),
  ICreateUserController:  Symbol.for('ICreateUserController'),
  IUpdateUserController:  Symbol.for('IUpdateUserController'),
  IDeleteUserController:  Symbol.for('IDeleteUserController'),
};

export interface DI_RETURN_TYPES {
  IAuthenticationService:    IAuthenticationService;
  ITransactionManagerService: ITransactionManagerService;
  IInstrumentationService:   IInstrumentationService;
  ICrashReporterService:     ICrashReporterService;

  IUsersRepository:    IUsersRepository;
  IProductsRepository: IProductsRepository;

  ISignInUseCase:  ISignInUseCase;
  ISignOutUseCase: ISignOutUseCase;
  ISignUpUseCase:  ISignUpUseCase;

  IGetUsersUseCase:    IGetUsersUseCase;
  ICreateUserUseCase:  ICreateUserUseCase;
  IUpdateUserUseCase:  IUpdateUserUseCase;
  IDeleteUserUseCase:  IDeleteUserUseCase;

  IGetProductsUseCase:        IGetProductsUseCase;
  IGetProductUseCase:         IGetProductUseCase;
  ICreateProductUseCase:      ICreateProductUseCase;
  IUpdateProductUseCase:      IUpdateProductUseCase;
  IDeleteProductUseCase:      IDeleteProductUseCase;
  IAddProductPhotoUseCase:    IAddProductPhotoUseCase;
  IDeleteProductPhotoUseCase: IDeleteProductPhotoUseCase;
  IUpdateProductPhotoUseCase: IUpdateProductPhotoUseCase;

  ISignInController:  ISignInController;
  ISignOutController: ISignOutController;
  ISignUpController:  ISignUpController;

  IGetUsersController:    IGetUsersController;
  ICreateUserController:  ICreateUserController;
  IUpdateUserController:  IUpdateUserController;
  IDeleteUserController:  IDeleteUserController;
}
