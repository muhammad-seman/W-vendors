import { createModule } from '@evyweb/ioctopus';

import { UsersRepository } from '@/src/infrastructure/repositories/users.repository';
import { getUsersUseCase } from '@/src/application/use-cases/users/get-users.use-case';
import { createUserUseCase } from '@/src/application/use-cases/users/create-user.use-case';
import { updateUserUseCase } from '@/src/application/use-cases/users/update-user.use-case';
import { deleteUserUseCase } from '@/src/application/use-cases/users/delete-user.use-case';
import { getUsersController } from '@/src/interface-adapters/controllers/users/get-users.controller';
import { createUserController } from '@/src/interface-adapters/controllers/users/create-user.controller';
import { updateUserController } from '@/src/interface-adapters/controllers/users/update-user.controller';
import { deleteUserController } from '@/src/interface-adapters/controllers/users/delete-user.controller';
import { DI_SYMBOLS } from '@/di/types';

export function createUsersModule() {
  const m = createModule();

  m.bind(DI_SYMBOLS.IUsersRepository).toClass(UsersRepository, [
    DI_SYMBOLS.IInstrumentationService,
    DI_SYMBOLS.ICrashReporterService,
  ]);

  m.bind(DI_SYMBOLS.IGetUsersUseCase).toHigherOrderFunction(getUsersUseCase, [DI_SYMBOLS.IUsersRepository]);
  m.bind(DI_SYMBOLS.ICreateUserUseCase).toHigherOrderFunction(createUserUseCase, [DI_SYMBOLS.IUsersRepository]);
  m.bind(DI_SYMBOLS.IUpdateUserUseCase).toHigherOrderFunction(updateUserUseCase, [DI_SYMBOLS.IUsersRepository]);
  m.bind(DI_SYMBOLS.IDeleteUserUseCase).toHigherOrderFunction(deleteUserUseCase, [DI_SYMBOLS.IUsersRepository]);

  m.bind(DI_SYMBOLS.IGetUsersController).toHigherOrderFunction(getUsersController, [DI_SYMBOLS.IGetUsersUseCase]);
  m.bind(DI_SYMBOLS.ICreateUserController).toHigherOrderFunction(createUserController, [DI_SYMBOLS.ICreateUserUseCase]);
  m.bind(DI_SYMBOLS.IUpdateUserController).toHigherOrderFunction(updateUserController, [DI_SYMBOLS.IUpdateUserUseCase]);
  m.bind(DI_SYMBOLS.IDeleteUserController).toHigherOrderFunction(deleteUserController, [DI_SYMBOLS.IDeleteUserUseCase]);

  return m;
}
