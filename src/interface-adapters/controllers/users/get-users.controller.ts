import { IGetUsersUseCase } from '@/src/application/use-cases/users/get-users.use-case';
import { PaginatedUsers } from '@/src/entities/models/user';
import type { GetUsersOpts } from '@/src/application/repositories/users.repository.interface';

export function getUsersController(getUsersUseCase: IGetUsersUseCase) {
  return async function (opts: GetUsersOpts): Promise<PaginatedUsers> {
    return await getUsersUseCase(opts);
  };
}

export type IGetUsersController = ReturnType<typeof getUsersController>;
